import { redis, LABELS } from "../../../lib/db";
const view = (t) => ({ code: t.code, name: t.name, surname: t.surname, birth: t.birth, formula: LABELS[t.type], buffet: t.buffet, email: t.email, usedAt: t.usedAt });
export async function POST(req) {
  if (req.headers.get("x-pin") !== process.env.STAFF_PIN) return Response.json({ error: "PIN errato" }, { status: 401 });
  const { code, enter } = await req.json();
  const stats = async () => ({ sold: (await redis.get("sold")) || 0, entered: (await redis.get("entered")) || 0 });
  const key = "ticket:" + String(code || "").trim().toUpperCase();
  const t = await redis.get(key);
  if (!t) return Response.json({ status: "invalid", ...(await stats()) });
  if (enter && !t.used) {
    t.used = true; t.usedAt = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });
    await redis.set(key, t); await redis.incr("entered");
    return Response.json({ status: "entered", ticket: view(t), ...(await stats()) });
  }
  return Response.json({ status: t.used ? "used" : "valid", ticket: view(t), ...(await stats()) });
}
