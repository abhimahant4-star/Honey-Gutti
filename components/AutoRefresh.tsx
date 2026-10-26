"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Re-checks the order a few times while the payment is still being confirmed. */
export function AutoRefresh({ times = 6, everyMs = 4000 }: { times?: number; everyMs?: number }) {
  const router = useRouter();
  useEffect(() => {
    let n = 0;
    const id = setInterval(() => {
      router.refresh();
      if (++n >= times) clearInterval(id);
    }, everyMs);
    return () => clearInterval(id);
  }, [router, times, everyMs]);
  return null;
}
