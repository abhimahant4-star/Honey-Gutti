import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { ADMIN_COOKIE, CUSTOMER_COOKIE, SESSION_MAX_AGE, signSession, verifySession, type Session } from "./auth";
import { site } from "./site";

/** Server-only helpers (route handlers and server components). */

export async function getCustomer(): Promise<Session | null> {
  return verifySession(cookies().get(CUSTOMER_COOKIE)?.value, "customer");
}

/**
 * Like getCustomer(), but also checks the database: the account must still exist and
 * the login must be newer than the last password change (a reset logs out other devices).
 * Returns "stale" when the cookie should be cleared.
 */
export async function getCustomerChecked(): Promise<Session | null | "stale"> {
  const s = await getCustomer();
  if (!s) return null;
  const { connectDB } = await import("./db");
  const { User } = await import("@/models/User");
  await connectDB();
  const u = (await User.findById(s.sub).select("passwordChangedAt").lean().catch(() => null)) as { passwordChangedAt?: Date } | null;
  if (!u) return "stale";
  if (u.passwordChangedAt && (s.iat ?? 0) < Math.floor(new Date(u.passwordChangedAt).getTime() / 1000)) return "stale";
  return s;
}

export async function getAdmin(): Promise<Session | null> {
  return verifySession(cookies().get(ADMIN_COOKIE)?.value, "admin");
}

// "Secure" cookies only travel over https. Safari refuses them on http://localhost,
// so this follows the site address: https in production (Vercel), http on your PC.
const secureCookies = site.url.startsWith("https://");

export async function setSessionCookie(res: NextResponse, session: Session) {
  const token = await signSession(session);
  if (session.role === "admin") {
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: secureCookies,
      sameSite: "strict",
      path: "/admin",
      maxAge: SESSION_MAX_AGE.admin,
    });
  } else {
    res.cookies.set(CUSTOMER_COOKIE, token, {
      httpOnly: true,
      secure: secureCookies,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE.customer,
    });
  }
}

export function clearSessionCookie(res: NextResponse, role: Session["role"]) {
  const name = role === "admin" ? ADMIN_COOKIE : CUSTOMER_COOKIE;
  res.cookies.set(name, "", {
    httpOnly: true,
    secure: secureCookies,
    sameSite: role === "admin" ? "strict" : "lax",
    path: role === "admin" ? "/admin" : "/",
    maxAge: 0,
  });
}
