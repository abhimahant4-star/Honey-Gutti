"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { loginToShop, useMe } from "./useMe";

/**
 * Landing-page "Buy now". Logged in: opens the product to add it to the cart.
 * Guest: goes to log in / sign up first, then straight back to the product.
 */
export function BuyButton({ slug, label = "Buy now", className = "" }: { slug: string; label?: string; className?: string }) {
  const me = useMe();
  const href = me === null ? loginToShop(`/products/${slug}`) : `/products/${slug}`;
  return (
    <div className="space-y-2">
      <Link
        href={href}
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-full bg-pack px-7 font-bold text-white transition hover:bg-ink ${className}`}
      >
        <ShoppingBag size={18} /> {label}
      </Link>
      {me === null && <p className="text-sm text-ink/70">Log in or create a free account to buy.</p>}
    </div>
  );
}
