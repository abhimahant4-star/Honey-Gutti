import nodemailer from "nodemailer";

/**
 * Sends email through any SMTP account (Gmail, Zoho, Hostinger, etc.).
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (and optionally MAIL_FROM).
 * While SMTP is not set up and you are running `npm run dev`, emails are printed
 * in the terminal instead, so you can still test.
 */

export function isMailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export const isDev = process.env.NODE_ENV !== "production";

type Mail = { to: string; subject: string; text: string; html: string; replyTo?: string };

/** Returns "sent", or "logged" when it was printed to the terminal (development only). */
export async function sendMail(mail: Mail): Promise<"sent" | "logged"> {
  if (!isMailConfigured()) {
    if (isDev) {
      console.log(`\n====== EMAIL (SMTP not set up, shown here instead) ======\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n=========================================================\n`);
      return "logged";
    }
    throw new Error("SMTP is not configured (SMTP_HOST, SMTP_USER, SMTP_PASS)");
  }
  const port = Number(process.env.SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transport.sendMail({
    from: process.env.MAIL_FROM || `"Doy & Joy" <${process.env.SMTP_USER}>`,
    to: mail.to,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    replyTo: mail.replyTo,
  });
  return "sent";
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function resetPasswordEmail(name: string, link: string, minutes: number): Omit<Mail, "to"> {
  const first = name.split(" ")[0] || "there";
  return {
    subject: "Reset your Doy & Joy password",
    text: `Namaste ${first},\n\nWe received a request to reset your Doy & Joy password.\nOpen this link to choose a new password (valid for ${minutes} minutes):\n\n${link}\n\nIf you didn't ask for this, you can ignore this email. Your password won't change.\n\n- Doy & Joy`,
    html: `<!doctype html><html><body style="margin:0;background:#FFFBEA;font-family:Arial,Helvetica,sans-serif;color:#0A1F5C">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #f1e3a6" cellpadding="0" cellspacing="0">
<tr><td style="padding:28px 28px 8px"><p style="margin:0;font-size:20px;font-weight:bold;color:#1F4A2B">Doy &amp; Joy</p></td></tr>
<tr><td style="padding:8px 28px 0"><h1 style="margin:0 0 12px;font-size:22px">Reset your password</h1>
<p style="margin:0 0 16px;line-height:1.5">Namaste ${esc(first)}, we received a request to reset your password. Tap the button below to choose a new one. This link works for ${minutes} minutes and only once.</p>
<p style="margin:24px 0"><a href="${esc(link)}" style="display:inline-block;background:#0B2E8A;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:999px">Choose a new password</a></p>
<p style="margin:0 0 8px;font-size:13px;color:#4a5680">If the button doesn't work, copy this link into your browser:<br><span style="word-break:break-all">${esc(link)}</span></p>
<p style="margin:16px 0 28px;font-size:13px;color:#4a5680">If you didn't ask for this, you can safely ignore this email. Your password won't change.</p></td></tr>
</table></td></tr></table></body></html>`,
  };
}

/** Message from the Contact page, sent to the shop's own inbox. */
export function contactEmail(m: { name: string; email: string; phone?: string; message: string }): Omit<Mail, "to"> {
  const phone = m.phone ? `\nMobile: ${m.phone}` : "";
  return {
    subject: `New message from ${m.name} (Doy & Joy website)`,
    replyTo: m.email,
    text: `Name: ${m.name}\nEmail: ${m.email}${phone}\n\n${m.message}\n\n- Sent from the Contact page. Reply to this email to answer ${m.name}.`,
    html: `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#0A1F5C;line-height:1.5">
<h2 style="margin:0 0 12px">New message from the website</h2>
<p style="margin:0"><strong>Name:</strong> ${esc(m.name)}<br><strong>Email:</strong> ${esc(m.email)}${m.phone ? `<br><strong>Mobile:</strong> ${esc(m.phone)}` : ""}</p>
<p style="margin:16px 0;white-space:pre-wrap;border-left:4px solid #FFC20E;padding-left:12px">${esc(m.message)}</p>
<p style="font-size:13px;color:#4a5680">Reply to this email to answer ${esc(m.name)}.</p></body></html>`,
  };
}
