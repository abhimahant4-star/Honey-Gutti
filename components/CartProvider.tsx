"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { CartProduct } from "@/lib/products";
import { site } from "@/lib/site";
import { loginToShop, useMe } from "./useMe";

type Lines = Record<string, number>; // slug -> qty

type Action =
  | { type: "add"; slug: string; qty: number }
  | { type: "set"; slug: string; qty: number }
  | { type: "clear" }
  | { type: "load"; lines: Lines };

function reducer(state: Lines, a: Action): Lines {
  switch (a.type) {
    case "load":
      return a.lines;
    case "add":
      return { ...state, [a.slug]: Math.min(10, (state[a.slug] ?? 0) + a.qty) };
    case "set": {
      const next = { ...state };
      if (a.qty <= 0) delete next[a.slug];
      else next[a.slug] = Math.min(10, a.qty);
      return next;
    }
    case "clear":
      return {};
  }
}

type CartCtx = {
  items: { slug: string; qty: number; name: string; price: number; image?: string }[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "doyjoy-cart-v1";

/** products = live products and prices from the database (passed in by the server). */
export function CartProvider({ children, products }: { children: React.ReactNode; products: CartProduct[] }) {
  const [lines, dispatch] = useReducer(reducer, {});
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const me = useMe();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "load", lines: JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);

  // The cart belongs to a logged-in customer. Logged out (or someone else on this device): empty it.
  useEffect(() => {
    if (me !== null) return;
    dispatch({ type: "clear" });
    setOpen(false);
    try {
      localStorage.removeItem(KEY);
    } catch {}
  }, [me]);

  useEffect(() => {
    if (!ready || !me) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, ready, me]);

  const add = useCallback(
    (slug: string, qty = 1) => {
      if (me === null) {
        // guests must log in first; they come back to this product afterwards
        window.location.assign(loginToShop(`/products/${slug}`));
        return;
      }
      dispatch({ type: "add", slug, qty });
      setOpen(true);
    },
    [me]
  );
  const setQty = useCallback((slug: string, qty: number) => dispatch({ type: "set", slug, qty }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartCtx>(() => {
    const items = Object.entries(me ? lines : {}).flatMap(([slug, qty]) => {
      const p = products.find((x) => x.slug === slug);
      return p ? [{ slug, qty, name: p.name, price: p.price, image: p.image }] : []; // sold-out or removed products drop out
    });
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal === 0 || subtotal >= site.freeShippingAbove ? 0 : site.shippingFee;
    return {
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      open,
      setOpen,
      add,
      setQty,
      clear,
    };
  }, [lines, open, add, setQty, clear, me, products]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
};
