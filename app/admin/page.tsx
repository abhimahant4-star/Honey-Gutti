import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, IndianRupee, Newspaper, Package, Plus, ReceiptText } from "lucide-react";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import { AdminPage, PageHeader, btnPrimary, btnSecondary, card } from "@/components/admin/ui";
import { readSettings } from "@/lib/catalog";
import { connectDB, isDbConfigured } from "@/lib/db";
import { inr } from "@/lib/format";
import { getAdmin } from "@/lib/session";
import { Order } from "@/models/Order";
import { Post } from "@/models/Post";
import { Product } from "@/models/Product";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Count = { _id: string; n: number };

export default async function AdminDashboard() {
  if (!(await getAdmin())) redirect("/admin/login?next=/admin");
  if (!isDbConfigured()) return <DatabaseNotice reason="not-configured" />;

  let products: Record<string, number>, orders: Record<string, number>, revenue: number, posts: Record<string, number>, comingSoonLimit: number;
  try {
    await connectDB();
    const [p, o, r, b, s] = await Promise.all([
      Product.aggregate<Count>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
      Order.aggregate<Count>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
      Order.aggregate<{ total: number }>([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
      Post.aggregate<Count>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
      readSettings(),
    ]);
    const map = (rows: Count[]) => Object.fromEntries(rows.map((x) => [x._id, x.n]));
    products = map(p);
    orders = map(o);
    revenue = r[0]?.total ?? 0;
    posts = map(b);
    comingSoonLimit = s.comingSoonLimit;
  } catch (e) {
    console.error("admin dashboard: database error", e);
    return <DatabaseNotice reason="unreachable" />;
  }

  const stats = [
    { label: "Live products", value: products.live ?? 0, note: `${products.hidden ?? 0} hidden`, icon: Package, href: "/admin/products?status=live" },
    { label: "Coming soon", value: products.coming_soon ?? 0, note: comingSoonLimit ? `website shows up to ${comingSoonLimit}` : "section hidden", icon: Clock, href: "/admin/coming-soon" },
    { label: "Paid orders", value: orders.paid ?? 0, note: `${orders.created ?? 0} waiting for payment`, icon: ReceiptText, href: "/admin/orders" },
    { label: "Collected", value: inr(revenue), note: "from paid orders", icon: IndianRupee, href: "/admin/orders" },
    { label: "Blog posts", value: posts.published ?? 0, note: `${posts.draft ?? 0} drafts`, icon: Newspaper, href: "/admin/blog" },
  ];

  return (
    <AdminPage>
      <PageHeader title="Dashboard" text="Your shop at a glance.">
        <Link href="/admin/products/new" className={btnPrimary}><Plus size={18} /> Add product</Link>
        <Link href="/admin/blog/new" className={btnSecondary}><Plus size={18} /> New blog post</Link>
      </PageHeader>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, note, icon: Icon, href }) => (
          <li key={label}>
            <Link href={href} className={`${card} flex items-start gap-4 p-5 transition hover:border-slate-400`}>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-honey-soft text-slate-900"><Icon size={20} /></span>
              <span>
                <span className="block text-sm font-semibold text-slate-600">{label}</span>
                <span className="block font-display text-3xl font-bold tabular-nums">{value}</span>
                <span className="block text-sm text-slate-500">{note}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {Object.keys(products).length === 0 && (
        <p className={`${card} mt-6 p-5 text-slate-700`}>
          No products in the database yet, so the website shows Honey Ghutti from the built-in details.{" "}
          <Link href="/admin/products" className="font-semibold text-pack underline">Go to Products</Link> to import it or add your own.
        </p>
      )}
    </AdminPage>
  );
}
