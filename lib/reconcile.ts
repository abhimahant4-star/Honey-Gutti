import { connectDB } from "./db";
import { amountsMatch, verifyPayment } from "./payu";
import { Order, OrderLean } from "@/models/Order";

const FAILED_STATUSES = new Set(["failure", "failed", "usercancelled", "user_cancelled", "bounced", "dropped"]);

/** Mark an order paid. Allowed from created or failed (PayU's server is the source of truth). */
export async function markPaid(txnid: string, info: { mihpayid?: string; mode?: string }) {
  return (await Order.findOneAndUpdate(
    { txnid, status: { $in: ["created", "failed"] } },
    {
      $set: { status: "paid", payuPaymentId: info.mihpayid, paymentMode: info.mode, paidAt: new Date() },
      $unset: { paymentError: 1 },
    },
    { new: true }
  ).lean()) as unknown as OrderLean | null;
}

/** Mark failed only if still created — never downgrade a paid order. */
export async function markFailed(txnid: string, error?: string) {
  return (await Order.findOneAndUpdate(
    { txnid, status: "created" },
    { $set: { status: "failed", paymentError: (error || "Payment failed").slice(0, 300) } },
    { new: true }
  ).lean()) as unknown as OrderLean | null;
}

/**
 * Ask PayU (server to server) what happened to this txnid and update the order.
 * Fails safe: on any doubt the order is left unchanged.
 * Throttled with lastCheckedAt so page refreshes don't hammer PayU.
 */
export async function reconcileOrder(txnid: string, opts: { minIntervalMs?: number } = {}) {
  await connectDB();
  const minInterval = opts.minIntervalMs ?? 30_000;
  const order = (await Order.findOne({ txnid }).lean()) as unknown as OrderLean | null;
  if (!order || order.status === "paid") return order;
  if (order.lastCheckedAt && Date.now() - new Date(order.lastCheckedAt).getTime() < minInterval) return order;

  await Order.updateOne({ txnid }, { $set: { lastCheckedAt: new Date() } });

  const r = await verifyPayment(txnid);
  if (!r.ok) {
    console.warn("[payu] verify_payment:", txnid, r.reason);
    return order;
  }
  if (r.status === "success" && amountsMatch(r.amount, order.total)) {
    return (await markPaid(txnid, { mihpayid: r.mihpayid, mode: r.mode })) ?? order;
  }
  if (r.status === "success") {
    console.error("[payu] amount mismatch", txnid, r.amount, order.total);
    return order;
  }
  if (FAILED_STATUSES.has(r.status)) {
    return (await markFailed(txnid, r.error || r.status)) ?? order;
  }
  return order; // "pending", "not found", etc. — leave as created
}

/** Reconcile created orders between ~90 seconds and 2 days old (used by the admin page). */
export async function reconcileStale(limit = 10) {
  await connectDB();
  const cutoff = new Date(Date.now() - 90_000);
  const stale = (await Order.find({ status: "created", txnid: { $exists: true }, createdAt: { $lt: cutoff, $gt: new Date(Date.now() - 2 * 86_400_000) } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("txnid")
    .lean()) as unknown as { txnid?: string }[];
  for (const o of stale) if (o.txnid) await reconcileOrder(o.txnid);
}
