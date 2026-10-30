import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Star } from "lucide-react";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import { ImportStarterProducts, StatusSelect } from "@/components/admin/ProductQuickActions";
import { AdminPage, PageHeader, btnPrimary, card } from "@/components/admin/ui";
import { toProduct } from "@/lib/catalog";
import { connectDB, isDbConfigured } from "@/lib/db";
import { inr } from "@/lib/format";
import { PRODUCT_STATUSES, statusLabel, type Product, type ProductStatus } from "@/lib/products";
import { getAdmin } from "@/lib/session";
import { Product as ProductModel, type ProductLean } from "@/models/Product";

export const metadata: Metadata = { title: "Products" };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminProducts({ searchParams }: { searchParams: { status?: string; deleted?: string } }) {
  if (!(await getAdmin())) redirect("/admin/login?next=/admin/products");
  if (!isDbConfigured()) return <DatabaseNotice reason="not-configured" />;

  const filter = PRODUCT_STATUSES.includes(searchParams.status as ProductStatus) ? (searchParams.status as ProductStatus) : undefined;
  let all: Product[];
  try {
    await connectDB();
    all = ((await ProductModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean()) as unknown as ProductLean[]).map(toProduct);
  } catch (e) {
    console.error("admin products: database error", e);
    return <DatabaseNotice reason="unreachable" />;
  }
  const count = (s?: ProductStatus) => (s ? all.filter((p) => p.status === s).length : all.length);
  const list = filter ? all.filter((p) => p.status === filter) : all;

  return (
    <AdminPage>
      <PageHeader title="Products" text="Add products, set prices and photos, and choose whether each one is Live, Coming soon or Hidden. Changes show on the website at once.">
        <Link href="/admin/products/new" className={btnPrimary}>
          <Plus size={18} /> Add product
        </Link>
      </PageHeader>

      {searchParams.deleted && <p role="status" className="mt-5 rounded-xl bg-emerald-50 p-3 text-emerald-800">✓ Product deleted.</p>}

      {all.length === 0 ? (
        <div className={`${card} mt-8 p-8 text-center`}>
          <p className="text-lg font-semibold">No products in the database yet.</p>
          <p className="mx-auto mt-1 max-w-lg text-slate-600">
            Until you add one, the website shows Honey Ghutti from the built-in details. Import it to edit it here, or add a new product.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <ImportStarterProducts />
            <Link href="/admin/products/new" className={btnPrimary}><Plus size={18} /> Add product</Link>
          </div>
        </div>
      ) : (
        <>
          <nav aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
            {[undefined, ...PRODUCT_STATUSES].map((s) => {
              const on = s === filter;
              return (
                <Link
                  key={s ?? "all"}
                  href={s ? `/admin/products?status=${s}` : "/admin/products"}
                  aria-current={on ? "page" : undefined}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold ${on ? "bg-slate-900 text-white" : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-slate-900"}`}
                >
                  {s ? statusLabel[s] : "All"} <span className="opacity-70">({count(s)})</span>
                </Link>
              );
            })}
          </nav>

          <div className={`${card} mt-4 overflow-x-auto`}>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((p) => (
                  <tr key={p.id} className="align-middle">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-14 w-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-honey-soft">
                          {p.images[0] ? (
                            <Image src={p.images[0]} alt="" width={44} height={56} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-500">No photo</span>
                          )}
                        </span>
                        <div className="min-w-0">
                          <Link href={`/admin/products/${p.id}`} className="font-semibold text-slate-900 hover:text-pack hover:underline">
                            {p.name}
                          </Link>
                          <p className="text-xs text-slate-500">
                            /products/{p.slug} · {p.size}
                            {p.featured && <span className="ml-2 inline-flex items-center gap-0.5 text-amber-700"><Star size={12} fill="currentColor" /> Featured</span>}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{inr(p.price)}</td>
                    <td className="px-4 py-3"><StatusSelect id={p.id!} status={p.status} name={p.name} /></td>
                    <td className="px-4 py-3 tabular-nums text-slate-600">{p.sortOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        {p.status !== "hidden" && (
                          <a href={`/products/${p.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-pack hover:underline">View</a>
                        )}
                        <Link href={`/admin/products/${p.id}`} className="rounded-lg border border-slate-300 px-3 py-1 font-semibold hover:bg-slate-900 hover:text-white">Edit</Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No {filter ? statusLabel[filter].toLowerCase() : ""} products.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminPage>
  );
}
