import { NextResponse } from "next/server";
import { forbiddenOrigin, isSameOrigin } from "@/lib/http";
import { clearSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

/** GET is used to clear an old login (e.g. after a password reset on another device). */
export async function GET(req: Request) {
  const next = new URL(req.url).searchParams.get("next");
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/login";
  const res = NextResponse.redirect(new URL(`${target}${target.includes("?") ? "&" : "?"}expired=1`, req.url), 303);
  clearSessionCookie(res, "customer");
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  clearSessionCookie(res, "customer");
  return res;
}
