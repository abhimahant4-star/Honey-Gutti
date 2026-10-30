"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { btnPrimary, card, field, label } from "./ui";

/** How many "Coming soon" cards the website shows, and the heading above them. */
export function ComingSoonSettings({ limit, title, available }: { limit: number; title: string; available: number }) {
  const router = useRouter();
  const [n, setN] = useState(limit);
  const [heading, setHeading] = useState(title);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function save() {
    setBusy(true);
    setMsg(null);
    setErrors({});
    const res = await fetch("/admin/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comingSoonLimit: n, comingSoonTitle: heading }),
    }).catch(() => null);
    const out = await res?.json().catch(() => ({}));
    setBusy(false);
    if (!res?.ok) {
      setErrors(out?.fields ?? {});
      setMsg({ ok: false, text: out?.error ?? "Couldn't save. Try again." });
      return;
    }
    setMsg({ ok: true, text: "Saved. The website is updated." });
    router.refresh();
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className={`${card} p-5 sm:p-6`}
    >
      <h2 className="font-display text-xl font-bold">Coming soon cards on the website</h2>
      <p className="mt-1 text-sm text-slate-600">
        Shown on Home and Products below the products on sale. Set 0 to hide the section.
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
        <div>
          <span className={label} id="limit-label">Number of cards</span>
          <div className="flex items-center rounded-xl border border-slate-300 bg-white" role="group" aria-labelledby="limit-label">
            <button type="button" onClick={() => setN((x) => Math.max(0, x - 1))} className="grid h-11 w-11 place-items-center" aria-label="Fewer cards"><Minus size={18} /></button>
            <span className="w-10 text-center text-xl font-bold tabular-nums" aria-live="polite">{n}</span>
            <button type="button" onClick={() => setN((x) => Math.min(12, x + 1))} className="grid h-11 w-11 place-items-center" aria-label="More cards"><Plus size={18} /></button>
          </div>
          <p className="mt-1 text-xs text-slate-500">0 to 12</p>
          {errors.comingSoonLimit && <p className="mt-1 text-sm text-red-700">{errors.comingSoonLimit}</p>}
        </div>
        <div>
          <label htmlFor="cs-title" className={label}>Heading</label>
          <input id="cs-title" value={heading} onChange={(e) => setHeading(e.target.value)} className={field} />
          {errors.comingSoonTitle && <p className="mt-1 text-sm text-red-700">{errors.comingSoonTitle}</p>}
        </div>
      </div>
      <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
        {n === 0
          ? "The Coming soon section is hidden."
          : available === 0
            ? `Up to ${n} card${n === 1 ? "" : "s"} will show once you mark products as Coming soon.`
            : `The website shows ${Math.min(n, available)} of your ${available} coming soon product${available === 1 ? "" : "s"}${available > n ? ` (the first ${n} by position)` : ""}.`}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy && <Loader2 size={18} className="animate-spin" />} Save
        </button>
        {msg && <p role="status" className={`text-sm ${msg.ok ? "text-emerald-800" : "text-red-700"}`}>{msg.ok ? "✓ " : ""}{msg.text}</p>}
      </div>
    </form>
  );
}
