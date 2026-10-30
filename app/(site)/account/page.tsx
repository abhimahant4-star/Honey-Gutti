import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, Package, Phone, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { connectDB } from "@/lib/db";
import { inr } from "@/lib/format";
import { getCustomer, getCustomerChecked } from "@/lib/session";
import { Order, OrderLean, orderNumber } from "@/models/Order";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const badge = {
  paid: { cls: "bg-leaf-soft text-leaf-dark", label: "Paid" },
  created: { cls: "bg-honey-soft text-ink", label: "Payment pending" },
  failed: { cls: "bg-red-100 text-red-800", label: "Payment failed" },
} as const;

export default async function AccountPage() {
  const me = await getCustomer(); // checked again here, not only in middleware
  if (!me) redirect("/login?next=/account");

  let orders: OrderLean[] = [];
  let dbError = false;
  let stale = false;
  try {
    // account deleted, or password reset on another device -> this login is no longer valid
    stale = (await getCustomerChecked()) === "stale";
  } catch {
    dbError = true;
  }
  if (stale) redirect("/api/auth/logout?next=/login");

  if (!dbError) try {
    await connectDB();
    // Only this customer's own orders
    orders = (await Order.find({ userId: me.sub }).sort({ createdAt: -1 }).limit(50).lean()) as unknown as OrderLean[];
  } catch (e) {
    console.error("account orders failed", e);
    dbError = true;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-semibold uppercase tracking-wider text-honey-dark">My account</p>
          <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Namaste, {me.name.split(" ")[0]}!</h1>
        </div>
        <LogoutButton endpoint="/api/auth/logout" redirectTo="/" />
      </div>

      <section className="mt-8 grid gap-3 rounded-2xl bg-honey-mist p-5 sm:grid-cols-3 sm:p-6">
        <p className="flex items-center gap-2"><UserRound size={18} className="shrink-0 text-leaf-dark" />{me.name}</p>
        <p className="flex items-center gap-2 break-all"><Mail size={18} className="shrink-0 text-leaf-dark" />{me.email}</p>
        <p className="flex items-center gap-2"><Phone size={18} className="shrink-0 text-leaf-dark" />{me.phone}</p>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold">My orders</h2>

        {dbError && (
          <p className="mt-4 rounded-xl bg-red-50 p-4 text-red-800">We couldn&apos;t load your orders right now. Please try again later.</p>
        )}

        {!dbError && orders.length === 0 && (
          <div className="mt-4 rounded-2xl border border-ink/10 p-8 text-center">
            <Package className="mx-auto text-honey-deep" size={40} />
            <p className="mt-3 text-ink/75">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className="mt-5 inline-block rounded-full bg-honey px-6 py-3 font-bold text-ink hover:bg-honey-deep">
              Shop now
            </Link>
          </div>
        )}

        {orders.length > 0 && (
          <ul className="mt-4 divide-y divide-ink/10 rounded-2xl border border-ink/10">
            {orders.map((o) => (
              <li key={o.publicId}>
                <Link href={`/order/${o.publicId}`} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-honey-mist sm:p-5">
                  <div>
                    <p className="font-semibold">{orderNumber(o.publicId)}</p>
                    <p className="text-sm text-ink/70">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" })} ·{" "}
                      {o.items.map((i) => `${i.name} × ${i.qty}`).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${badge[o.status].cls}`}>{badge[o.status].label}</span>
                    <span className="font-bold">{inr(o.total)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
