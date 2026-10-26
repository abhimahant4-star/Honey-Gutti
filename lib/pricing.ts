import { getProduct } from "./products";
import { site } from "./site";

/** Prices are always calculated on the server from lib/products.ts, never trusted from the browser. */
export function priceCart(items: { slug: string; qty: number }[]) {
  const merged = new Map<string, number>();
  for (const i of items) merged.set(i.slug, Math.min(10, (merged.get(i.slug) ?? 0) + i.qty));

  const lines: { slug: string; name: string; price: number; qty: number }[] = [];
  for (const [slug, qty] of merged) {
    const p = getProduct(slug);
    if (!p) return { ok: false as const, error: "A product in your cart no longer exists." };
    if (p.placeholder) return { ok: false as const, error: `${p.name} is not available yet. Remove it from your cart.` };
    lines.push({ slug, name: p.name, price: p.price, qty });
  }
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const shipping = subtotal >= site.freeShippingAbove ? 0 : site.shippingFee;
  return { ok: true as const, lines, subtotal, shipping, total: subtotal + shipping };
}
