import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { connectDB, isDbConfigured, isDbConnectionError } from "@/lib/db";
import { clientIp, forbiddenOrigin, isSameOrigin, jsonError, rateLimit } from "@/lib/http";
import { setSessionCookie } from "@/lib/session";
import { fieldErrors, resetSchema } from "@/lib/validation";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  if (!rateLimit(`reset:${clientIp(req)}`, 10, 15 * 60 * 1000)) {
    return jsonError("Too many attempts. Please wait 15 minutes and try again.", 429);
  }

  const parsed = resetSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please check your details.", 400, { fields: fieldErrors(parsed.error.issues) });
  if (!isDbConfigured()) return jsonError("Accounts are not available yet: the database is not connected.", 503);

  const { token, password } = parsed.data;
  try {
    await connectDB();
    const hash = createHash("sha256").update(token).digest("hex");
    const passwordHash = await bcrypt.hash(password, 10);
    const changedAt = new Date();
    // Find the token and remove it in one atomic step, so a link can only ever work once.
    const target = await User.findOne({ resetTokenHash: hash, resetTokenExpires: { $gt: new Date() } }).select("_id").lean() as
      | { _id: unknown }
      | null;
    const used = target
      ? await User.updateOne(
          { _id: target._id, resetTokenHash: hash },
          {
            $set: { passwordHash, passwordChangedAt: changedAt, failedLogins: 0, lastLoginAt: changedAt },
            $unset: { resetTokenHash: 1, resetTokenExpires: 1, lockUntil: 1 },
          }
        )
      : null;
    const user = used?.modifiedCount === 1 ? await User.findById(target!._id) : null;
    if (!user) {
      return jsonError("This reset link is invalid or has expired. Please ask for a new one.", 400, { expired: true });
    }

    // Logs out every other device, then logs this browser in with the new password.
    const res = NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    await setSessionCookie(res, { sub: String(user._id), role: "customer", name: user.name, email: user.email, phone: user.phone });
    return res;
  } catch (e) {
    if (isDbConnectionError(e)) {
      return jsonError("Can't connect to the database. Check MONGODB_URI (password, cluster name) and Network Access in MongoDB Atlas.", 503);
    }
    console.error("reset-password failed", e);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
