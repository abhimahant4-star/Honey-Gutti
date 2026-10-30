import Link from "next/link";
import { inr } from "@/lib/format";
import type { Product } from "@/lib/products";
import { AddToCart } from "./AddToCart";
import { MotherTagline } from "./MotherTagline";
import { ProductPack } from "./ProductPack";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition-shadow hover:shadow-lg">
      {product.status === "coming_soon" && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-pack px-3 py-1 text-xs font-bold text-white">Coming soon</span>
      )}
      <Link href={`/products/${product.slug}`} className="block bg-gradient-to-b from-honey-soft to-honey-mist">
        <div className="flex h-60 items-center justify-center p-5">
          <ProductPack product={product} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-2">
          {product.badges.slice(0, 2).map((b) => (
            <span key={b} className="rounded-full bg-leaf-soft px-2.5 py-0.5 text-xs font-semibold text-leaf-dark">
              {b}
            </span>
          ))}
        </div>
        <div>
          <h3 className="font-display text-lg font-bold leading-snug text-ink">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <p className="mt-1 text-sm text-ink/70">{product.tagline}</p>
        </div>
        <MotherTagline variant="compact" />
        <div className="mt-auto space-y-3">
          <p className="text-ink">
            <span className="text-xl font-bold">{inr(product.price)}</span>
            <span className="ml-2 text-sm text-ink/70">{product.size}</span>
          </p>
          <AddToCart slug={product.slug} compact available={product.status === "live"} />
        </div>
      </div>
    </article>
  );
}
