import { NextResponse } from "next/server";
import { checkAdminCredentials } from "@/lib/admin";
import { clientIp, forbiddenOrigin, isSameOrigin, jsonError, rateLimit } from "@/lib/http";
import { setSessionCookie } from "@/lib/session";
import { adminLoginSchema, fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  if (!rateLimit(`admin:${clientIp(req)}`, 5, 15 * 60 * 1000)) {
    return jsonError("Too many attempts. Please wait 15 minutes and try again.", 429);
  }

  const parsed = adminLoginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please check your details.", 400, { fields: fieldErrors(parsed.error.issues) });

  const result = checkAdminCredentials(parsed.data.username, parsed.data.password);
  if (result === "not-configured") return jsonError("Admin login is not set up. Add ADMIN_USER and ADMIN_PASSWORD.", 503);
  if (result === "weak-password") {
    return jsonError("ADMIN_PASSWORD is too weak. Set one with at least 10 characters, then restart.", 503);
  }
  if (result !== "ok") {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return jsonError("Wrong username or password.", 401);
  }

  try {
    const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    await setSessionCookie(res, { sub: "admin", role: "admin", name: "Admin" });
    return res;
  } catch (e) {
    console.error("admin login failed", e);
    return jsonError("Login is not set up. Add AUTH_SECRET (at least 32 characters).", 500);
  }
}
