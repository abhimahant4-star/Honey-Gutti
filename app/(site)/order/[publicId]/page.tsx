import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { AutoRefresh } from "@/components/AutoRefresh";
import { ClearCartOnPaid } from "@/components/ClearCartOnPaid";
import { connectDB } from "@/lib/db";
import { inr } from "@/lib/format";
import { reconcileOrder } from "@/lib/reconcile";
import { getCustomerChecked } from "@/lib/session";
import { site } from "@/lib/site";
import { Order, OrderLean, orderNumber } from "@/models/Order";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const metadata: Metadata = { title: "Your order", robots: { index: false, follow: false } };

export default async function OrderPage({ params }: { params: { publicId: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.publicId)) notFound();
  await connectDB();
  let o = (await Order.findOne({ publicId: params.publicId }).lean()) as unknown as OrderLean | null;
  if (!o) notFound();

  // Orders placed from an account can only be opened by that account.
  // (Guest orders use the long random link as their key.)
  if (o.userId) {
    const me = await getCustomerChecked();
    if (me === "stale") redirect(`/api/auth/logout?next=${encodeURIComponent(`/login?next=/order/${o.publicId}`)}`);
    if (!me) redirect(`/login?next=/order/${o.publicId}`);
    if (me.sub !== o.userId) notFound();
  }

  // PayU callback lost or delayed? After ~90 seconds, ask PayU directly.
  if (o.status === "created" && o.txnid && Date.now() - new Date(o.createdAt).getTime() > 90_000) {
    o = (await reconcileOrder(o.txnid)) ?? o;
  }

  const state = {
    paid: { icon: CheckCircle2, color: "text-leaf", title: "Payment received. Thank you!", text: "Your order is confirmed. We will pack it and share delivery updates on your mobile number." },
    created: { icon: Clock, color: "text-honey-deep", title: "Confirming your payment…", text: "This page updates by itself. If you already paid, please do not pay again; we will confirm it shortly." },
    failed: { icon: AlertCircle, color: "text-red-600", title: "Payment was not completed", text: "Your cart is still saved, so you can try again. If money was deducted, your bank will refund it automatically." },
  }[o.status];
  const Icon = state.icon;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-14">
      {o.status === "created" && <AutoRefresh times={30} everyMs={5000} />}
      {o.status === "paid" && <ClearCartOnPaid />}
      <div className="text-center">
        <Icon size={56} className={`mx-auto ${state.color}`} />
        <h1 className="mt-4 font-display text-3xl font-bold">{state.title}</h1>
        <p className="mt-2 text-ink/80">{state.text}</p>
        <p className="mt-3 font-semibold">Order {orderNumber(o.publicId)}</p>
      </div>

      <section className="mt-8 rounded-2xl border border-ink/10 p-5 sm:p-6">
        <h2 className="font-display text-xl font-bold">Items</h2>
        <ul className="mt-3 divide-y divide-ink/10">
          {o.items.map((i) => (
            <li key={i.slug} className="flex justify-between gap-3 py-2">
              <span>{i.name} × {i.qty}</span>
              <span className="font-semibold">{inr(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-ink/10 pt-3">
          <div className="flex justify-between"><dt>Delivery</dt><dd>{o.shipping === 0 ? "Free" : inr(o.shipping)}</dd></div>
          <div className="flex justify-between text-lg font-bold"><dt>Total</dt><dd>{inr(o.total)}</dd></div>
        </dl>
        <h2 className="mt-6 font-display text-xl font-bold">Delivering to</h2>
        <p className="mt-2">{o.customer.name}<br />{o.customer.address}, {o.customer.city}, {o.customer.state} {o.customer.pin}<br />{o.customer.phone}</p>
      </section>

      <p className="mt-6 text-center text-ink/70">Questions? Call {site.phone} or email {site.email}.</p>
      <div className="mt-6 text-center">
        <Link href={o.status === "failed" ? "/checkout" : "/products"} className="inline-block rounded-full bg-honey px-7 py-3 font-bold text-ink hover:bg-honey-deep">
          {o.status === "failed" ? "Try again" : "Continue shopping"}
        </Link>
      </div>
    </div>
  );
}
