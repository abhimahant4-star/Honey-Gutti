import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB, isDbConfigured, isDbConnectionError } from "@/lib/db";
import { clientIp, forbiddenOrigin, isSameOrigin, jsonError, rateLimit } from "@/lib/http";
import { setSessionCookie } from "@/lib/session";
import { fieldErrors, signupSchema } from "@/lib/validation";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  if (!rateLimit(`signup:${clientIp(req)}`, 10, 60 * 60 * 1000)) {
    return jsonError("Too many sign-up attempts. Please try again later.", 429);
  }

  const parsed = signupSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please check your details.", 400, { fields: fieldErrors(parsed.error.issues) });
  if (!isDbConfigured()) return jsonError("Accounts are not available yet: the database is not connected.", 503);
  const { name, email, phone, password } = parsed.data;

  try {
    await connectDB();
    if (await User.exists({ email })) {
      return jsonError("An account with this email already exists. Please log in.", 409, {
        fields: { email: "This email is already registered." },
      });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, passwordHash, lastLoginAt: new Date() });

    const res = NextResponse.json({ ok: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
    await setSessionCookie(res, { sub: String(user._id), role: "customer", name, email, phone });
    return res;
  } catch (e) {
    // duplicate key if two sign-ups race with the same email
    if ((e as { code?: number })?.code === 11000) {
      return jsonError("An account with this email already exists. Please log in.", 409);
    }
    if (isDbConnectionError(e)) {
      return jsonError("Can't connect to the database. Check MONGODB_URI (password, cluster name) and Network Access in MongoDB Atlas.", 503);
    }
    console.error("signup failed", e);
    return jsonError("Could not create your account. Please try again.", 500);
  }
}
