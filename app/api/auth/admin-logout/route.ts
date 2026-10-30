import { NextResponse } from "next/server";
import { forbiddenOrigin, isSameOrigin } from "@/lib/http";
import { clearSessionCookie } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  clearSessionCookie(res, "admin");
  return res;
}
