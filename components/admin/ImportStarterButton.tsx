"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export function ImportStarterButton() {
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
          const res = await fetch("/admin/api/import-starter", { method: "POST" });
          const out = await res.json().catch(() => ({}));
          setBusy(false);
          setMsg(res.ok ? `Added ${out.added} starter post${out.added === 1 ? "" : "s"}.` : out.error ?? "Could not import.");
          router.refresh();
        }}
        className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-ink px-5 font-bold hover:bg-ink hover:text-white disabled:opacity-60"
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />} Import 3 starter posts
      </button>
      {msg && <p role="status" className="mt-2 text-sm text-leaf-dark">{msg}</p>}
    </div>
  );
}
