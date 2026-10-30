"use client";

import { ShoppingBag } from "lucide-react";
import { inr } from "@/lib/format";
import { useCart } from "./CartProvider";

/** Always-visible buy bar on phones so the button never scrolls away. */
export function StickyBuy({ slug, name, price }: { slug: string; name: string; price: number }) {
  const { add } = useCart();
  return (
    <div data-sticky-buy className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-ink/10 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-ink/70">{name}</p>
        <p className="text-lg font-bold">{inr(price)}</p>
      </div>
      <button onClick={() => add(slug, 1)} className="flex h-12 items-center gap-2 rounded-full bg-pack px-6 font-bold text-white">
        <ShoppingBag size={18} /> Add to cart
      </button>
    </div>
  );
}
