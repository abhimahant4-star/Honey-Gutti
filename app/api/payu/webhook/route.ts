import { NextResponse } from "next/server";
import { reconcileOrder } from "@/lib/reconcile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Optional backstop: set this URL as a Payment webhook in the PayU dashboard.
 * We do NOT trust the webhook body. We only read the txnid from it and then ask
 * PayU's verify_payment API (server to server) for the real status.
 */
export async function POST(req: Request) {
  let txnid = "";
  try {
    const type = req.headers.get("content-type") || "";
    if (type.includes("application/json")) {
      const j = await req.json();
      txnid = String(j?.txnid ?? j?.merchantTransactionId ?? "");
    } else {
      const form = await req.formData();
      const v = form.get("txnid");
      txnid = typeof v === "string" ? v : "";
    }
  } catch {
    /* ignore */
  }

  if (/^[A-Za-z0-9]{1,25}$/.test(txnid)) {
    try {
      await reconcileOrder(txnid, { minIntervalMs: 0 });
    } catch (e) {
      console.error("[payu webhook]", e);
    }
  }
  return NextResponse.json({ ok: true });
}
