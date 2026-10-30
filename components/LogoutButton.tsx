"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export function LogoutButton({ endpoint, redirectTo, className = "" }: { endpoint: string; redirectTo: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch(endpoint, { method: "POST" }).catch(() => {});
        window.location.assign(redirectTo);
      }}
      className={`inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 font-semibold hover:bg-ink hover:text-white disabled:opacity-60 ${className}`}
    >
      {busy ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
      Log out
    </button>
  );
}
