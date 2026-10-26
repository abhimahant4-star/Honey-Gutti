import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order, OrderLean } from "@/models/Order";
import { amountsMatch, payuConfig, siteUrl, verifyResponseHash } from "@/lib/payu";
import { markFailed, markPaid, reconcileOrder } from "@/lib/reconcile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * PayU posts the customer's browser here (surl and furl) after payment.
 * We trust the result only if the reverse hash is valid; otherwise we ask
 * PayU's verify_payment API directly. Always 303-redirect to the order page.
 */
export async function POST(req: Request) {
  const base = siteUrl();
  let f: Record<string, string> = {};
  try {
    const form = await req.formData();
    form.forEach((v, k) => {
      if (typeof v === "string") f[k] = v;
    });
  } catch {
    return NextResponse.redirect(`${base}/checkout?payment=error`, 303);
  }

  const txnid = f.txnid || "";
  try {
    await connectDB();
    const order = txnid ? ((await Order.findOne({ txnid }).lean()) as unknown as OrderLean | null) : null;
    if (!order) return NextResponse.redirect(`${base}/checkout?payment=error`, 303);
    const target = `${base}/order/${order.publicId}`;

    const { key, salt } = payuConfig();
    const trusted = f.key === key && verifyResponseHash(f, salt);

    if (!trusted) {
      console.warn("[payu callback] hash check failed, reconciling", txnid);
      await reconcileOrder(txnid, { minIntervalMs: 0 });
      return NextResponse.redirect(target, 303);
    }

    const status = (f.status || "").toLowerCase();
    if (status === "success" && amountsMatch(f.amount, order.total)) {
      await markPaid(txnid, { mihpayid: f.mihpayid, mode: f.mode });
    } else if (status === "success") {
      console.error("[payu callback] amount mismatch", txnid, f.amount, order.total);
    } else if (status === "failure") {
      await markFailed(txnid, f.error_Message || f.field9 || "Payment failed");
    } else {
      // pending or unknown — leave created; order page will reconcile
    }
    return NextResponse.redirect(target, 303);
  } catch (e) {
    console.error("[payu callback]", e);
    return NextResponse.redirect(`${base}/checkout?payment=error`, 303);
  }
}

// If someone opens the URL directly
export function GET() {
  return NextResponse.redirect(`${siteUrl()}/`, 303);
}
