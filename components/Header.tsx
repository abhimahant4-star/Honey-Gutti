"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "./CartProvider";

const links = [
  { href: "/products", label: "Shop" },
  { href: "/#about", label: "About us" },
  { href: "/#spotlight", label: "What's inside" },
  { href: "/#delivery", label: "Delivery" },
  { href: "/#contact", label: "Contact" },
];

export function Header() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2" aria-label="Doy & Joy home">
          <Image src="/images/logo.png" alt="" width={40} height={44} className="h-10 w-auto" />
          <span className="font-display text-xl font-bold text-leaf-dark">Doy &amp; Joy</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="font-medium text-ink hover:text-honey-deep">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            className="relative flex h-11 items-center gap-2 rounded-full bg-pack px-4 font-semibold text-white transition hover:bg-ink"
            aria-label={`Open cart, ${count} items`}
          >
            <ShoppingBag size={20} />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-honey px-1 text-xs font-bold text-ink">
                {count}
              </span>
            )}
          </button>
          <button
            className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 md:hidden"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-label="Menu"
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menu && (
        <nav aria-label="Mobile" className="border-t border-ink/10 bg-white px-4 py-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenu(false)}
              className="block py-3 text-lg font-medium text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
