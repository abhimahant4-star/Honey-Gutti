import { connectDB } from "@/lib/db";
import { inr } from "@/lib/format";
import { reconcileStale } from "@/lib/reconcile";
import { Order, OrderLean, orderNumber } from "@/models/Order";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const badge = { paid: "bg-leaf-soft text-leaf-dark", created: "bg-honey-soft text-ink", failed: "bg-red-100 text-red-800" } as const;

export default async function AdminOrders() {
  await connectDB();
  try {
    await reconcileStale(10); // ask PayU about "created" orders older than ~90 seconds
  } catch (e) {
    console.error("admin reconcile failed", e);
  }
  const orders = (await Order.find().sort({ createdAt: -1 }).limit(200).lean()) as unknown as OrderLean[];
  const paid = orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((s, o) => s + o.total, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Orders</h1>
      <p className="mt-1 text-ink/75">
        {paid.length} paid orders, {inr(revenue)} collected (latest 200 orders shown). Ship only orders marked Paid.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-honey-mist">
            <tr>
              {["Order", "Date", "Status", "Items", "Total", "Customer", "PayU"].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {orders.map((o) => (
              <tr key={o.publicId} className="align-top">
                <td className="px-4 py-3 font-semibold">{orderNumber(o.publicId)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{new Date(o.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 font-semibold ${badge[o.status]}`}>{o.status}</span>
                  {o.paymentError && <p className="mt-1 max-w-[160px] text-xs text-red-700">{o.paymentError}</p>}
                </td>
                <td className="px-4 py-3">{o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}</td>
                <td className="px-4 py-3 font-semibold">{inr(o.total)}</td>
                <td className="px-4 py-3">{o.customer.name}<br />{o.customer.phone}<br />{o.customer.email}{o.customer.email && <br />}{o.customer.address}, {o.customer.city}, {o.customer.state} {o.customer.pin}</td>
                <td className="px-4 py-3 text-xs text-ink/70">
                  {o.txnid ? <>Txn {o.txnid}<br /></> : "—"}
                  {o.payuPaymentId && <>ID {o.payuPaymentId}<br /></>}
                  {o.paymentMode}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-ink/70">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
