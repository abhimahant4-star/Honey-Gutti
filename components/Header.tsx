"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { loginToShop, useMe } from "./useMe";

const links = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const isActive = (path: string, href: string) => path === href || path.startsWith(`${href}/`);

export function Header() {
  const { count } = useCart();
  const path = usePathname();
  const [menu, setMenu] = useState(false);
  const me = useMe();
  const account = me
    ? { href: "/account", label: `Hi, ${me.name.split(" ")[0]}`, aria: "My account" }
    : { href: "/login", label: "Log in", aria: "Log in or create an account" };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 lg:h-[76px]">
        <Link href="/" className="flex items-center gap-2" aria-label="Doy & Joy home">
          <Image src="/images/logo.png" alt="" width={64} height={70} priority className="h-[52px] w-auto lg:h-16" />
          <span className="hidden whitespace-nowrap font-display text-xl font-bold text-leaf-dark min-[360px]:inline">Doy &amp; Joy</span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(path, l.href) ? "page" : undefined}
              className={`border-b-2 py-1 font-medium transition hover:text-honey-deep ${
                isActive(path, l.href) ? "border-honey text-pack" : "border-transparent text-ink"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={account.href}
            aria-label={account.aria}
            className={`flex h-11 items-center gap-2 rounded-full border border-ink/15 px-3 font-semibold text-ink transition hover:border-pack hover:text-pack ${
              me === undefined ? "opacity-0" : me === null ? "hidden" : "opacity-100"
            }`}
          >
            <UserRound size={20} />
            <span className="hidden max-w-[9rem] truncate sm:inline">{account.label}</span>
          </Link>
          {me === null ? (
            // guests: the cart needs an account
            <Link
              href={loginToShop("/products")}
              className="relative flex h-11 items-center gap-2 rounded-full bg-pack px-4 font-semibold text-white transition hover:bg-ink"
              aria-label="Log in to shop and use the cart"
            >
              <ShoppingBag size={20} />
              <span className="hidden sm:inline">Log in to shop</span>
            </Link>
          ) : (
            // the Cart button opens the cart page; the side drawer only opens after "Add to cart"
            <Link
              href="/cart"
              aria-current={path === "/cart" ? "page" : undefined}
              className={`relative flex h-11 items-center gap-2 rounded-full bg-pack px-4 font-semibold text-white transition hover:bg-ink ${
                me === undefined ? "pointer-events-none opacity-0" : ""
              }`}
              aria-label={`Cart, ${count} items`}
            >
              <ShoppingBag size={20} />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-honey px-1 text-xs font-bold text-ink">
                  {count}
                </span>
              )}
            </Link>
          )}
          <button
            className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 lg:hidden"
            onClick={() => setMenu((m) => !m)}
            aria-expanded={menu}
            aria-label="Menu"
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menu && (
        <nav aria-label="Mobile" className="border-t border-ink/10 bg-white px-4 py-2 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenu(false)}
              aria-current={isActive(path, l.href) ? "page" : undefined}
              className={`block py-3 text-lg font-medium ${isActive(path, l.href) ? "text-pack" : "text-ink"}`}
            >
              {l.label}
            </Link>
          ))}
          <Link href={account.href} onClick={() => setMenu(false)} className="block border-t border-ink/10 py-3 text-lg font-semibold text-pack">
            {me ? "My account" : "Log in / Sign up to shop"}
          </Link>
        </nav>
      )}
    </header>
  );
}
