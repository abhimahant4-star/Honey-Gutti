import { findProductsForCheckout } from "./catalog";
import { site } from "./site";

/** Prices are always calculated on the server from the database, never trusted from the browser. */
export async function priceCart(items: { slug: string; qty: number }[]) {
  const merged = new Map<string, number>();
  for (const i of items) merged.set(i.slug, Math.min(10, (merged.get(i.slug) ?? 0) + i.qty));

  const found = await findProductsForCheckout([...merged.keys()]);
  const lines: { slug: string; name: string; price: number; qty: number }[] = [];
  for (const [slug, qty] of merged) {
    const p = found.find((x) => x.slug === slug);
    if (!p || p.status === "hidden") return { ok: false as const, error: "A product in your cart is no longer sold. Remove it from your cart." };
    if (p.status !== "live") return { ok: false as const, error: `${p.name} is not available yet. Remove it from your cart.` };
    lines.push({ slug, name: p.name, price: p.price, qty });
  }
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal >= site.freeShippingAbove ? 0 : site.shippingFee;
  return { ok: true as const, lines, subtotal, shipping, total: subtotal + shipping };
}
