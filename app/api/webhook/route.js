import Stripe from "stripe";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";
import { redis, LABELS } from "../../../lib/db";
export const runtime = "nodejs";
const code = () => { const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; return "RFL" + [...randomBytes(9)].map((x) => a[x % a.length]).join(""); };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let ev;
  try { ev = stripe.webhooks.constructEvent(await req.text(), req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET); }
  catch { return new Response("firma non valida", { status: 400 }); }
  if (ev.type !== "checkout.session.completed" || ev.data.object.payment_status !== "paid") return Response.json({ ok: true });

  const id = ev.data.object.metadata?.orderId;
  const order = id && (await redis.get("order:" + id));
  if (!order) return Response.json({ ok: true });
  if (!(await redis.set("paid:" + id, 1, { nx: true }))) return Response.json({ ok: true }); // già gestito

  const tickets = [];
  for (const p of order.people) {
    const t = { ...p, code: code(), orderId: id, email: order.email, used: false };
    await redis.set("ticket:" + t.code, t);
    tickets.push(t);
  }
  await redis.incrby("sold", tickets.length);

  const base = process.env.BASE_URL;
  const html = `<div style="background:#070405;color:#eee4cf;font-family:Courier New,monospace;padding:28px;max-width:560px;margin:auto">
  <h1 style="color:#c0071f;font-size:34px;margin:0">RIFELLOWEEN</h1>
  <p>31 ottobre 2026 — dalle 23:00<br>Il luogo ti verrà comunicato pochi giorni prima via email.<br>Dress code: vestirsi è consigliato.</p>
  ${tickets.map((t) => `<div style="border:1px solid #c0071f;padding:18px;margin:18px 0;text-align:center">
    <b style="font-size:18px">${esc(t.name)} ${esc(t.surname)}</b><br>${LABELS[t.type]}${t.buffet ? " · richiesta buffet" : ""}<br>
    <img src="${base}/api/qr/${t.code}" width="220" height="220" alt="QR ${t.code}" style="background:#fff;margin:14px 0"><br><code>${t.code}</code></div>`).join("")}
  <p style="font-size:13px;color:#a39683">Biglietti nominativi: porta un documento. Ogni QR vale per un solo ingresso.</p></div>`;
  const mail = nodemailer.createTransport({ service: "gmail", auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD } });
  await mail.sendMail({ from: `Rifelloween <${process.env.GMAIL_USER}>`, to: order.email, subject: "I tuoi biglietti Rifelloween", html });
  return Response.json({ ok: true });
}
