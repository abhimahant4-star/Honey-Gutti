import crypto from "crypto";
import { site } from "./site";

/**
 * PayU (India) helpers — hosted checkout.
 * Hash formulas from docs.payu.in:
 *   request : sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
 *   response: sha512([additionalCharges|]SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
 *   verify  : sha512(key|command|var1|SALT)
 */

export type PayuEnv = "test" | "live";

const TEST_PAYMENT_URL = "https://test.payu.in/_payment";
const LIVE_PAYMENT_URL = "https://secure.payu.in/_payment";

/**
 * Reads PayU settings from .env.local:
 *   PAYU_MERCHANT_KEY, PAYU_MERCHANT_SALT,
 *   PAYU_BASE_URL = https://test.payu.in/_payment (test) or https://secure.payu.in/_payment (live)
 */
export function payuConfig() {
  const key = process.env.PAYU_MERCHANT_KEY?.trim();
  const salt = process.env.PAYU_MERCHANT_SALT?.trim();
  if (!key || !salt || key === "your_merchant_key" || salt === "your_merchant_salt") {
    throw new Error("Set PAYU_MERCHANT_KEY and PAYU_MERCHANT_SALT in .env.local");
  }
  const base = (process.env.PAYU_BASE_URL || TEST_PAYMENT_URL).trim();
  const env: PayuEnv = base.includes("secure.payu.in") ? "live" : "test";
  return {
    key,
    salt,
    env,
    paymentUrl: env === "live" ? LIVE_PAYMENT_URL : TEST_PAYMENT_URL,
    verifyUrl:
      env === "live"
        ? "https://info.payu.in/merchant/postservice.php?form=2"
        : "https://test.payu.in/merchant/postservice.php?form=2",
  };
}

export function siteUrl(): string {
  return site.url;
}

function sha512(input: string): string {
  return crypto.createHash("sha512").update(input, "utf8").digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from((a || "").toLowerCase(), "utf8");
  const y = Buffer.from((b || "").toLowerCase(), "utf8");
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** ≤25 chars, alphanumeric only. e.g. DJlx3k9a2b1f4e8c0 */
export function newTxnId(): string {
  return ("DJ" + Date.now().toString(36) + crypto.randomBytes(4).toString("hex")).slice(0, 25);
}

/** PayU fields that go into the hash must not contain | and are safest as plain ASCII. */
export function asciiSafe(value: string, max: number, fallback: string): string {
  const cleaned = (value || "")
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9 .\-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return cleaned || fallback;
}

export function formatAmount(rupees: number): string {
  return (Math.round(rupees * 100) / 100).toFixed(2);
}

type RequestHashInput = {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
};

export function requestHash(p: RequestHashInput, salt: string): string {
  const parts = [
    p.key,
    p.txnid,
    p.amount,
    p.productinfo,
    p.firstname,
    p.email,
    p.udf1 ?? "",
    p.udf2 ?? "",
    p.udf3 ?? "",
    p.udf4 ?? "",
    p.udf5 ?? "",
    "",
    "",
    "",
    "",
    "",
    salt,
  ];
  return sha512(parts.join("|"));
}

/** Verify the hash PayU posts back to surl/furl. `f` = every posted field as strings. */
export function verifyResponseHash(f: Record<string, string>, salt: string): boolean {
  const parts = [
    salt,
    f.status ?? "",
    "",
    "",
    "",
    "",
    "",
    f.udf5 ?? "",
    f.udf4 ?? "",
    f.udf3 ?? "",
    f.udf2 ?? "",
    f.udf1 ?? "",
    f.email ?? "",
    f.firstname ?? "",
    f.productinfo ?? "",
    f.amount ?? "",
    f.txnid ?? "",
    f.key ?? "",
  ];
  let base = parts.join("|");
  if (f.additionalCharges) base = `${f.additionalCharges}|${base}`;
  return safeEqualHex(sha512(base), f.hash ?? "");
}

export type VerifyResult =
  | { ok: true; status: string; amount: number | null; mihpayid?: string; mode?: string; error?: string }
  | { ok: false; reason: string };

/** Server-to-server check with PayU's verify_payment API. Never throws. */
export async function verifyPayment(txnid: string): Promise<VerifyResult> {
  try {
    const { key, salt, verifyUrl } = payuConfig();
    const command = "verify_payment";
    const body = new URLSearchParams({
      key,
      command,
      var1: txnid,
      hash: sha512(`${key}|${command}|${txnid}|${salt}`),
    });
    const res = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body,
      cache: "no-store",
    });
    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return { ok: false, reason: `Non-JSON response (${res.status})` };
    }
    const d = json?.transaction_details?.[txnid];
    if (!d || typeof d !== "object") return { ok: false, reason: "No transaction_details for txnid" };
    const status = String(d.status ?? "").toLowerCase();
    const amtRaw = d.amt ?? d.transaction_amount ?? d.amount;
    const amount = amtRaw != null && !isNaN(Number(amtRaw)) ? Number(amtRaw) : null;
    return {
      ok: true,
      status,
      amount,
      mihpayid: d.mihpayid ? String(d.mihpayid) : undefined,
      mode: d.mode ? String(d.mode) : undefined,
      error: d.error_Message ? String(d.error_Message) : undefined,
    };
  } catch (e: any) {
    return { ok: false, reason: e?.message || "verify_payment failed" };
  }
}

export function amountsMatch(a: number | string | null | undefined, b: number): boolean {
  const n = Number(a);
  return Number.isFinite(n) && Math.abs(n - b) < 0.01;
}
