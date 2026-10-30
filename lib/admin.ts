import { createHash, timingSafeEqual } from "crypto";

/**
 * The shop owner logs in with ADMIN_USER / ADMIN_PASSWORD from the environment
 * (.env.local on your PC, Environment Variables on Vercel). There is no admin
 * signup, so customers can never make themselves admin.
 */

const WEAK = new Set(["change-me", "changeme", "admin", "password", "password123", "12345678", "admin123"]);

export type AdminCheck = "ok" | "invalid" | "not-configured" | "weak-password";

function same(a: string, b: string): boolean {
  // hash first so both sides have equal length; compare in constant time
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export function checkAdminCredentials(username: string, password: string): AdminCheck {
  const user = process.env.ADMIN_USER?.trim();
  const pass = process.env.ADMIN_PASSWORD?.trim();
  if (!user || !pass) return "not-configured";
  if (pass.length < 10 || WEAK.has(pass.toLowerCase())) return "weak-password";
  const userOk = same(username.trim().toLowerCase(), user.toLowerCase());
  const passOk = same(password, pass);
  return userOk && passOk ? "ok" : "invalid";
}
