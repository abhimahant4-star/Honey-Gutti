"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

/** Shown on the order page only when the order is paid, so a failed payment keeps the cart. */
export function ClearCartOnPaid() {
  const { clear } = useCart();
  useEffect(() => {
    try {
      localStorage.removeItem("doyjoy-cart-v1"); // stop CartProvider re-loading the old cart
    } catch {}
    clear();
  }, [clear]);
  return null;
}
