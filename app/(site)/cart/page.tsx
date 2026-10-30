"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useMe } from "@/components/useMe";
import { inr } from "@/lib/format";
import { site } from "@/lib/site";

/** Full cart page (the header's Cart button). Needs a login: middleware sends guests to /login first. */
export default function CartPage() {
  const me = useMe();
  const { items, count, subtotal, shipping, total, setQty } = useCart();
  const toFree = Math.max(0, site.freeShippingAbove - subtotal);

  if (me === undefined) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="animate-spin text-pack" size={36} aria-label="Loading your cart" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-honey-deep" />
        <h1 className="mt-4 font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-ink/80">Add a product to start your order.</p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-honey px-7 py-3 font-bold text-ink hover:bg-honey-deep">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Your cart</h1>
      <p className="mt-1 text-ink/70">{count} {count === 1 ? "item" : "items"}</p>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
        <ul className="divide-y divide-ink/10 rounded-2xl border border-ink/10">
          {items.map((i) => (
            <li key={i.slug} className="flex gap-4 p-4 sm:gap-5 sm:p-5">
              <Link href={`/products/${i.slug}`} className="grid h-28 w-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-honey-soft sm:h-32 sm:w-24">
                {i.image ? (
                  <Image src={i.image} alt="" width={96} height={128} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingBag className="text-honey-deep" />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/products/${i.slug}`} className="font-display text-lg font-bold leading-snug hover:text-pack">{i.name}</Link>
                  <p className="shrink-0 font-bold">{inr(i.price * i.qty)}</p>
                </div>
                <p className="text-sm text-ink/70">{inr(i.price)} each</p>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-ink/20">
                    <button className="grid h-10 w-10 place-items-center" aria-label={`Decrease ${i.name}`} onClick={() => setQty(i.slug, i.qty - 1)}>
                      <Minus size={16} />
                    </button>
                    <span className="w-7 text-center font-semibold" aria-live="polite">{i.qty}</span>
                    <button
                      className="grid h-10 w-10 place-items-center disabled:opacity-40"
                      aria-label={`Increase ${i.name}`}
                      disabled={i.qty >= 10}
                      onClick={() => setQty(i.slug, i.qty + 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <button className="flex items-center gap-1.5 p-2 text-sm text-ink/70 hover:text-red-600" onClick={() => setQty(i.slug, 0)}>
                    <Trash2 size={17} /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit space-y-3 rounded-2xl bg-honey-mist p-5 sm:p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-xl font-bold">Order summary</h2>
          <p className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${toFree > 0 ? "bg-honey-soft text-ink" : "bg-leaf-soft text-leaf-dark"}`}>
            <Truck size={17} className="shrink-0" />
            {toFree > 0 ? `Add ${inr(toFree)} more for free delivery.` : "You get free delivery on this order."}
          </p>
          <Row label="Subtotal" value={inr(subtotal)} />
          <Row label="Delivery" value={shipping === 0 ? "Free" : inr(shipping)} />
          <div className="border-t border-ink/10 pt-3">
            <Row label="Total" value={inr(total)} bold />
          </div>
          <Link href="/checkout" className="mt-2 block rounded-full bg-pack py-3.5 text-center font-bold text-white hover:bg-ink">
            Proceed to checkout
          </Link>
          <Link href="/products" className="block text-center font-semibold text-pack underline underline-offset-4">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-lg font-bold text-ink" : "text-ink/80"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
