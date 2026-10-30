import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { connectDB, isDbConfigured, isDbConnectionError } from "@/lib/db";
import { clientIp, forbiddenOrigin, isSameOrigin, jsonError, rateLimit } from "@/lib/http";
import { isDev, isMailConfigured, resetPasswordEmail, sendMail } from "@/lib/mail";
import { site } from "@/lib/site";
import { fieldErrors, forgotSchema } from "@/lib/validation";
import { User } from "@/models/User";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_MINUTES = 30;
// Same answer whether or not the email has an account, so nobody can use this to check who is registered.
const DONE = "If an account exists for this email, we've sent a link to reset the password. Please check your inbox and spam folder.";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  if (!rateLimit(`forgot:${clientIp(req)}`, 5, 15 * 60 * 1000)) {
    return jsonError("Too many requests. Please wait 15 minutes and try again.", 429);
  }

  const parsed = forgotSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please check your details.", 400, { fields: fieldErrors(parsed.error.issues) });
  if (!isDbConfigured()) return jsonError("Accounts are not available yet: the database is not connected.", 503);
  if (!isMailConfigured() && !isDev) return jsonError("Password reset email isn't set up yet. Please contact us.", 503);

  const { email } = parsed.data;
  // at most 3 emails per address per hour (stops someone flooding a customer's inbox)
  if (!rateLimit(`forgot-email:${email}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: true, message: DONE }, { headers: { "Cache-Control": "no-store" } });
  }

  let printed = false;
  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (user) {
      const token = randomBytes(32).toString("base64url");
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            resetTokenHash: createHash("sha256").update(token).digest("hex"),
            resetTokenExpires: new Date(Date.now() + VALID_MINUTES * 60 * 1000),
          },
        }
      );
      const link = `${site.url}/reset-password?token=${token}`;
      try {
        printed = (await sendMail({ to: email, ...resetPasswordEmail(user.name, link, VALID_MINUTES) })) === "logged";
      } catch (e) {
        console.error("reset email failed", e); // keep the same answer for the visitor
      }
    }
  } catch (e) {
    if (isDbConnectionError(e)) {
      return jsonError("Can't connect to the database. Check MONGODB_URI (password, cluster name) and Network Access in MongoDB Atlas.", 503);
    }
    console.error("forgot-password failed", e);
    return jsonError("Something went wrong. Please try again.", 500);
  }

  return NextResponse.json(
    {
      ok: true,
      message: DONE,
      // development only: tell the developer where the email went
      devNote:
        isDev && !isMailConfigured()
          ? printed
            ? "Email isn't set up yet, so the reset link was printed in the terminal where npm run dev is running."
            : "Email isn't set up yet. No account was found for this email, so nothing was printed."
          : undefined,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
