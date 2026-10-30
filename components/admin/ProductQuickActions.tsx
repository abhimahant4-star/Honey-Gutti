"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PRODUCT_STATUSES, statusLabel, type ProductStatus } from "@/lib/products";

/** Change a product's status straight from a list (saved at once). */
export function StatusSelect({ id, status, name }: { id: string; status: ProductStatus; name: string }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function change(next: ProductStatus) {
    const before = value;
    setValue(next);
    setBusy(true);
    setError("");
    const res = await fetch(`/admin/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      const out = await res?.json().catch(() => ({}));
      setValue(before);
      setError(out?.error ?? "Couldn't save. Try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <select
          value={value}
          disabled={busy}
          onChange={(e) => change(e.target.value as ProductStatus)}
          aria-label={`Status of ${name}`}
          className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm font-semibold"
        >
          {PRODUCT_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel[s]}</option>
          ))}
        </select>
        {busy && <Loader2 size={16} className="animate-spin text-slate-500" />}
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

/** Adds Honey Ghutti (from the pack details) to the database so it can be edited. */
export function ImportStarterProducts() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const res = await fetch("/admin/api/products/import-starter", { method: "POST" }).catch(() => null);
          const out = await res?.json().catch(() => ({}));
          setBusy(false);
          setMsg(res?.ok ? (out.added ? "Honey Ghutti added. You can edit it now." : "Honey Ghutti is already in your products.") : out?.error ?? "Could not import.");
          router.refresh();
        }}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 font-semibold text-slate-800 hover:border-slate-900 disabled:opacity-60"
      >
        {busy && <Loader2 size={18} className="animate-spin" />} Import Honey Ghutti
      </button>
      {msg && <p role="status" className="mt-2 text-sm text-emerald-800">{msg}</p>}
    </div>
  );
}
