import QRCode from "qrcode";
import { redis } from "../../../../lib/db";
export async function GET(_, { params }) {
  if (!(await redis.exists("ticket:" + params.code))) return new Response("not found", { status: 404 });
  const png = await QRCode.toBuffer(params.code, { margin: 2, width: 440 });
  return new Response(png, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=86400" } });
}
