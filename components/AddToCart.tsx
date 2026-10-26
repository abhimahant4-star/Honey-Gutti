"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { getProduct } from "@/lib/products";
import { useCart } from "./CartProvider";

export function AddToCart({ slug, compact = false }: { slug: string; compact?: boolean }) {
  const { add, setOpen } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  if (getProduct(slug)?.placeholder) {
    return (
      <button disabled className="h-12 w-full cursor-not-allowed rounded-full bg-ink/10 font-bold text-ink/50">
        Coming soon
      </button>
    );
  }

  if (compact) {
    return (
      <button
        onClick={() => add(slug, 1)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-pack font-bold text-white transition hover:bg-ink"
      >
        <ShoppingBag size={18} /> Add to cart
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-full border border-ink/25">
          <button className="grid h-12 w-12 place-items-center" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
            <Minus size={18} />
          </button>
          <span className="w-8 text-center text-lg font-bold" aria-live="polite">{qty}</span>
          <button className="grid h-12 w-12 place-items-center" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(10, q + 1))}>
            <Plus size={18} />
          </button>
        </div>
        <button
          onClick={() => add(slug, qty)}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-pack px-6 font-bold text-white transition hover:bg-ink"
        >
          <ShoppingBag size={18} /> Add to cart
        </button>
      </div>
      <button
        onClick={() => {
          add(slug, qty);
          setOpen(false);
          router.push("/checkout");
        }}
        className="h-12 w-full rounded-full bg-honey font-bold text-ink transition hover:bg-honey-deep"
      >
        Buy now
      </button>
    </div>
  );
}
