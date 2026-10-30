"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { loginToShop, useMe } from "./useMe";

/** Next to the showcase: invites guests to log in / sign up to see the full range. */
export function MembersTeaser({ more }: { more: number }) {
  const me = useMe();
  const signup = `/signup?next=${encodeURIComponent("/products")}&shop=1`;

  return (
    <aside className="flex flex-col justify-between gap-6 rounded-3xl bg-pack p-6 text-white sm:p-8 md:flex-row md:items-center">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10 text-honey">
          {me ? <Sparkles size={22} /> : <Lock size={22} />}
        </span>
        <div>
          <h3 className="font-display text-2xl font-bold">
            {more > 0 ? `${more} more Ayurvedic product${more === 1 ? "" : "s"}` : "The full Doy & Joy range"}
          </h3>
          <p className="mt-2 text-white/80">
            {me
              ? "Browse every product, add to your cart and order with secure online payment."
              : "Create a free account to see all our products, use your cart, pay securely and track every order."}
          </p>
        </div>
      </div>
      {me ? (
        <Link href="/products" className="shrink-0 rounded-full bg-honey px-8 py-3.5 text-center font-bold text-ink transition hover:bg-honey-deep">
          View all products
        </Link>
      ) : (
        <div className="grid shrink-0 gap-3 md:w-64">
          <Link href={signup} className="rounded-full bg-honey py-3.5 text-center font-bold text-ink transition hover:bg-honey-deep">
            Create free account
          </Link>
          <Link
            href={loginToShop("/products")}
            className="rounded-full border-2 border-white/60 py-3 text-center font-bold text-white transition hover:bg-white hover:text-pack"
          >
            I already have an account
          </Link>
        </div>
      )}
    </aside>
  );
}
