import { SignJWT, jwtVerify } from "jose";

/**
 * Session tokens (signed JWT in an HttpOnly cookie).
 * This file only uses `jose`, so it also works inside middleware (Edge runtime).
 *
 * Two separate cookies:
 *  - customers: "dj_session" (path /, 7 days)
 *  - admin:     "dj_admin"   (path /admin only, 8 hours, SameSite=Strict)
 * A customer token can never open /admin because the role is checked on every request.
 */

export type Role = "customer" | "admin";

export type Session = {
  sub: string; // customer: MongoDB user id, admin: "admin"
  role: Role;
  name: string;
  email?: string;
  phone?: string;
  iat?: number; // when this login was issued (seconds)
};

export const CUSTOMER_COOKIE = "dj_session";
export const ADMIN_COOKIE = "dj_admin";

export const SESSION_MAX_AGE: Record<Role, number> = {
  customer: 60 * 60 * 24 * 7,
  admin: 60 * 60 * 8,
};

const ISSUER = "doyjoy";

function secretKey(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set and at least 32 characters long");
  return new TextEncoder().encode(s);
}

export async function signSession(s: Session): Promise<string> {
  return new SignJWT({ role: s.role, name: s.name, email: s.email, phone: s.phone })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(s.sub)
    .setIssuer(ISSUER)
    .setAudience(s.role)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE[s.role]}s`)
    .sign(secretKey());
}

/** Returns the session only if the token is valid, unexpired and has the expected role. */
export async function verifySession(token: string | undefined, role: Role): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: role,
    });
    if (payload.role !== role || typeof payload.sub !== "string") return null;
    return {
      sub: payload.sub,
      role,
      name: typeof payload.name === "string" ? payload.name : "",
      email: typeof payload.email === "string" ? payload.email : undefined,
      phone: typeof payload.phone === "string" ? payload.phone : undefined,
      iat: typeof payload.iat === "number" ? payload.iat : undefined,
    };
  } catch {
    return null;
  }
}
