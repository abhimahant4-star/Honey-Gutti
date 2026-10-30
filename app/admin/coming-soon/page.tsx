import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import { ComingSoonSettings } from "@/components/admin/ComingSoonSettings";
import { StatusSelect } from "@/components/admin/ProductQuickActions";
import { AdminPage, PageHeader, btnPrimary, card } from "@/components/admin/ui";
import { readSettings, toProduct } from "@/lib/catalog";
import { connectDB, isDbConfigured } from "@/lib/db";
import { inr } from "@/lib/format";
import type { Product } from "@/lib/products";
import { getAdmin } from "@/lib/session";
import { Product as ProductModel, type ProductLean } from "@/models/Product";
import type { StoreSettings } from "@/models/Setting";

export const metadata: Metadata = { title: "Coming soon" };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminComingSoon() {
  if (!(await getAdmin())) redirect("/admin/login?next=/admin/coming-soon");
  if (!isDbConfigured()) return <DatabaseNotice reason="not-configured" />;
  let list: Product[];
  let settings: StoreSettings;
  try {
    await connectDB();
    const [rows, s] = await Promise.all([
      ProductModel.find({ status: "coming_soon" }).sort({ sortOrder: 1, createdAt: -1 }).lean(),
      readSettings(),
    ]);
    list = (rows as unknown as ProductLean[]).map(toProduct);
    settings = s;
  } catch (e) {
    console.error("admin coming soon: database error", e);
    return <DatabaseNotice reason="unreachable" />;
  }

  return (
    <AdminPage>
      <PageHeader title="Coming soon" text="Tease products before they go on sale. Customers see them as Coming soon cards and can't buy them yet. When a product is ready, switch it to Live.">
        <Link href="/admin/products/new?status=coming_soon" className={btnPrimary}>
          <Plus size={18} /> Add coming soon product
        </Link>
      </PageHeader>

      <div className="mt-6">
        <ComingSoonSettings limit={settings.comingSoonLimit} title={settings.comingSoonTitle} available={list.length} />
      </div>

      <section className={`${card} mt-6`}>
        <h2 className="border-b border-slate-200 px-5 py-4 font-display text-xl font-bold">Coming soon products ({list.length})</h2>
        {list.length === 0 ? (
          <p className="p-8 text-center text-slate-500">
            No coming soon products yet. Add one, or set any product to Coming soon from the Products tab.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {list.map((p, i) => {
              const shown = i < settings.comingSoonLimit;
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <span className="grid h-14 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-honey-soft">
                    {p.images[0] ? <Image src={p.images[0]} alt="" width={44} height={56} className="h-full w-full object-cover" /> : <span className="text-[10px] font-semibold text-slate-500">No photo</span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-pack hover:underline">{p.name}</Link>
                    <p className="text-sm text-slate-500">{inr(p.price)} · {p.size} · position {p.sortOrder}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${shown ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                    {shown ? "Shown on website" : "Not shown (over the limit)"}
                  </span>
                  <StatusSelect id={p.id!} status={p.status} name={p.name} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AdminPage>
  );
}
