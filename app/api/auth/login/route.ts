import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { connectDB, isDbConfigured, isDbConnectionError } from "@/lib/db";
import { clientIp, forbiddenOrigin, isSameOrigin, jsonError, rateLimit } from "@/lib/http";
import { setSessionCookie } from "@/lib/session";
import { fieldErrors, loginSchema } from "@/lib/validation";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
// Used when the email doesn't exist, so the response takes the same time either way.
const DUMMY_HASH = "$2b$10$.9XD69CJcGFRanePq.amLeSfu5IIjVrvCvyHZMDCcyHqiXPxAMNt.";
const WRONG = "Wrong email or password.";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  if (!rateLimit(`login:${clientIp(req)}`, 20, 15 * 60 * 1000)) {
    return jsonError("Too many attempts. Please wait 15 minutes and try again.", 429);
  }

  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please check your details.", 400, { fields: fieldErrors(parsed.error.issues) });
  if (!isDbConfigured()) return jsonError("Accounts are not available yet: the database is not connected.", 503);
  const { email, password } = parsed.data;

  try {
    await connectDB();
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      return jsonError(WRONG, 401);
    }
    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      return jsonError("Too many wrong passwords. This account is locked for 15 minutes. You can reset your password with \"Forgot password?\".", 429);
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      const fails = (user.failedLogins ?? 0) + 1;
      await User.updateOne(
        { _id: user._id },
        fails >= MAX_FAILS
          ? { $set: { failedLogins: 0, lockUntil: new Date(Date.now() + LOCK_MS) } }
          : { $set: { failedLogins: fails } }
      );
      return jsonError(WRONG, 401);
    }

    await User.updateOne({ _id: user._id }, { $set: { failedLogins: 0, lastLoginAt: new Date() }, $unset: { lockUntil: 1 } });
    const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    await setSessionCookie(res, { sub: String(user._id), role: "customer", name: user.name, email: user.email, phone: user.phone });
    return res;
  } catch (e) {
    if (isDbConnectionError(e)) {
      return jsonError("Can't connect to the database. Check MONGODB_URI (password, cluster name) and Network Access in MongoDB Atlas.", 503);
    }
    console.error("login failed", e);
    return jsonError("Could not log you in. Please try again.", 500);
  }
}
