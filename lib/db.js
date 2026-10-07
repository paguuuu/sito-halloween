import { Redis } from "@upstash/redis";
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});
export const PRICES = { ingresso: 2000, openbar: 3000 };
export const LABELS = { ingresso: "Ingresso + 2 drink", openbar: "Open bar" };
