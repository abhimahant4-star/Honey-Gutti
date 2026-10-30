import type { ProductStatus } from "@/lib/products";
import { statusLabel } from "@/lib/products";

/** Small building blocks shared by the admin pages. */

export const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";
export const btnPrimary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 font-semibold text-white transition hover:bg-pack disabled:opacity-60";
export const btnSecondary =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-800 transition hover:border-slate-900 disabled:opacity-60";
export const field =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base focus:border-pack focus:outline-none focus:ring-2 focus:ring-honey/60";
export const label = "mb-1 block text-sm font-semibold text-slate-800";

export function PageHeader({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">{title}</h1>
        {text && <p className="mt-1 max-w-2xl text-slate-600">{text}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

export const statusStyle: Record<ProductStatus, string> = {
  live: "bg-emerald-100 text-emerald-800",
  coming_soon: "bg-amber-100 text-amber-900",
  hidden: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status }: { status: ProductStatus }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-semibold ${statusStyle[status]}`}>{statusLabel[status]}</span>;
}

/** Wraps an admin page with the usual padding. */
export function AdminPage({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>;
}
