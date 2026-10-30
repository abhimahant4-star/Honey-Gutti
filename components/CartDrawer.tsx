"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { inr } from "@/lib/format";
import { site } from "@/lib/site";
import { useCart } from "./CartProvider";

export function CartDrawer() {
  const { open, setOpen, items, subtotal, shipping, total, setQty } = useCart();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const toFree = Math.max(0, site.freeShippingAbove - subtotal);

  return (
    <>
      {open && (
        <>
          <div className="fixed inset-0 z-50 animate-fade-in bg-ink/50" onClick={() => setOpen(false)} />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md animate-slide-in flex-col bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
              <h2 className="font-display text-xl font-bold text-ink">Your cart</h2>
              <button autoFocus onClick={() => setOpen(false)} aria-label="Close cart" className="grid h-10 w-10 place-items-center rounded-full hover:bg-honey-soft">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <ShoppingBag size={40} className="text-honey-deep" />
                <p className="text-lg text-ink">Your cart is empty.</p>
                <Link href="/products" onClick={() => setOpen(false)} className="rounded-full bg-honey px-6 py-3 font-bold text-ink hover:bg-honey-deep">
                  Browse products
                </Link>
              </div>
            ) : (
              <>
                {toFree > 0 ? (
                  <p className="bg-honey-soft px-5 py-2 text-sm text-ink">
                    Add {inr(toFree)} more for free delivery.
                  </p>
                ) : (
                  <p className="bg-leaf-soft px-5 py-2 text-sm text-leaf-dark">You get free delivery on this order.</p>
                )}
                <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-5">
                  {items.map((i) => (
                    <li key={i.slug} className="flex gap-4 py-4">
                      <div className="grid h-24 w-16 shrink-0 place-items-center overflow-hidden rounded bg-honey-soft">
                        {i.image ? (
                          <Image src={i.image} alt="" width={64} height={96} className="h-full w-full object-cover" />
                        ) : (
                          <ShoppingBag className="text-honey-deep" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <p className="font-semibold leading-snug text-ink">{i.name}</p>
                        <p className="text-sm text-ink/70">{inr(i.price)}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-ink/20">
                            <button className="grid h-10 w-10 place-items-center" aria-label={`Decrease ${i.name}`} onClick={() => setQty(i.slug, i.qty - 1)}>
                              <Minus size={16} />
                            </button>
                            <span className="w-6 text-center font-semibold" aria-live="polite">{i.qty}</span>
                            <button className="grid h-10 w-10 place-items-center" aria-label={`Increase ${i.name}`} onClick={() => setQty(i.slug, i.qty + 1)}>
                              <Plus size={16} />
                            </button>
                          </div>
                          <button className="p-2 text-ink/70 hover:text-red-600" aria-label={`Remove ${i.name}`} onClick={() => setQty(i.slug, 0)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 border-t border-ink/10 p-5">
                  <Row label="Subtotal" value={inr(subtotal)} />
                  <Row label="Delivery" value={shipping === 0 ? "Free" : inr(shipping)} />
                  <Row label="Total" value={inr(total)} bold />
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="mt-3 block rounded-full bg-pack py-3.5 text-center font-bold text-white hover:bg-ink"
                  >
                    Checkout
                  </Link>
                  <Link
                    href="/cart"
                    onClick={() => setOpen(false)}
                    className="block rounded-full border-2 border-pack py-3 text-center font-bold text-pack hover:bg-pack hover:text-white"
                  >
                    View cart
                  </Link>
                </div>
              </>
            )}
          </aside>
        </>
      )}
    </>
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
