import { NextResponse } from "next/server";

/**
 * CSRF protection for login/signup/logout: the browser always sends an Origin
 * header on POST, and it must be our own site.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export const jsonError = (error: string, status = 400, extra?: Record<string, unknown>) =>
  NextResponse.json({ error, ...extra }, { status, headers: { "Cache-Control": "no-store" } });

export const forbiddenOrigin = () => jsonError("Request blocked.", 403);

/**
 * Simple in-memory rate limiter (per server instance). Slows down password guessing.
 * Customer accounts also have a database lockout, see app/api/auth/login.
 */
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (hits.size > 5000) {
    hits.forEach((v, k) => {
      if (v.reset < now) hits.delete(k);
    });
  }
  const h = hits.get(key);
  if (!h || h.reset < now) {
    hits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  h.count += 1;
  return h.count <= limit;
}
