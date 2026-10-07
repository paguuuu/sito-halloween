import Stripe from "stripe";
import { randomBytes } from "crypto";
import { redis, PRICES, LABELS } from "../../../lib/db";
export async function POST(req) {
  const { email, people } = await req.json().catch(() => ({}));
  const str = (s) => typeof s === "string" && s.trim().length > 0 && s.length < 60;
  if (!/^\S+@\S+\.\S+$/.test(email || "") || !Array.isArray(people) || people.length < 1 || people.length > 10)
    return Response.json({ error: "Dati non validi" }, { status: 400 });
  const clean = [];
  for (const p of people) {
    const y = Number(p.birth);
    if (!PRICES[p.type] || !str(p.name) || !str(p.surname) || !(y >= 1930 && y <= 2008))
      return Response.json({ error: "Controlla i dati dei biglietti (anno di nascita compreso)." }, { status: 400 });
    clean.push({ type: p.type, name: p.name.trim(), surname: p.surname.trim(), birth: y, buffet: !!p.buffet });
  }
  const id = randomBytes(8).toString("hex");
  await redis.set("order:" + id, { id, email, people: clean }, { ex: 60 * 60 * 24 * 30 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const qty = {};
  clean.forEach((p) => (qty[p.type] = (qty[p.type] || 0) + 1));
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: Object.entries(qty).map(([t, q]) => ({ quantity: q, price_data: { currency: "eur", unit_amount: PRICES[t], product_data: { name: "Rifelloween — " + LABELS[t] } } })),
    metadata: { orderId: id },
    success_url: process.env.BASE_URL + "/grazie",
    cancel_url: process.env.BASE_URL + "/#biglietti",
  });
  return Response.json({ url: session.url });
}
