import { NextResponse } from "next/server";
import { clientIp, forbiddenOrigin, isSameOrigin, jsonError, rateLimit } from "@/lib/http";
import { contactEmail, isDev, isMailConfigured, sendMail } from "@/lib/mail";
import { site } from "@/lib/site";
import { contactSchema, fieldErrors } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const OK = "Thank you! Your message has been sent. We usually reply within one working day.";

/** Contact page form: emails the message to the shop (NEXT_PUBLIC_SUPPORT_EMAIL), with Reply-To set to the visitor. */
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 60 * 60 * 1000)) {
    return jsonError("You've sent several messages already. Please wait a while, or call us.", 429);
  }

  const parsed = contactSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    // a filled honeypot means a bot: pretend it worked so it doesn't retry
    const bot = parsed.error.issues.some((i) => i.path[0] === "website");
    if (bot) return NextResponse.json({ ok: true, message: OK });
    return jsonError("Please check your details.", 400, { fields: fieldErrors(parsed.error.issues) });
  }
  if (!isMailConfigured() && !isDev) {
    return jsonError(`Our message form isn't set up yet. Please call ${site.phone} or email ${site.email}.`, 503);
  }

  const { name, email, phone, message } = parsed.data;
  try {
    const how = await sendMail({ to: site.email, ...contactEmail({ name, email, phone: phone || undefined, message }) });
    return NextResponse.json(
      {
        ok: true,
        message: OK,
        devNote: how === "logged" ? "Email isn't set up yet, so the message was printed in the terminal where npm run dev is running." : undefined,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e) {
    console.error("contact email failed", e);
    return jsonError(`We couldn't send your message right now. Please call ${site.phone} or email ${site.email}.`, 502);
  }
}
