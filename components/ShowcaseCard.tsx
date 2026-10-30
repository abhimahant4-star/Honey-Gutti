import { inr } from "@/lib/format";
import type { Product } from "@/lib/products";
import { BuyButton } from "./BuyButton";
import { MotherTagline } from "./MotherTagline";
import { ProductPack } from "./ProductPack";

/** Landing-page product showcase: the product, its price and a Buy button (no cart for guests). */
export function ShowcaseCard({ product }: { product: Product }) {
  return (
    <article className="grid overflow-hidden rounded-3xl border border-ink/10 bg-white md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="flex h-64 items-center justify-center bg-gradient-to-b from-honey-soft to-honey-mist p-5 md:h-[19rem]">
        <ProductPack product={product} sizes="(min-width:768px) 420px, 90vw" />
      </div>
      <div className="flex flex-col justify-center gap-3 p-6 md:p-7">
        <div className="flex flex-wrap gap-2">
          {product.badges.map((b) => (
            <span key={b} className="rounded-full bg-leaf-soft px-3 py-1 text-xs font-semibold text-leaf-dark">{b}</span>
          ))}
        </div>
        <div>
          {product.hindiName && <p lang="hi" className="font-display text-xl font-bold text-pack">{product.hindiName}</p>}
          <h3 className="font-display text-2xl font-bold leading-snug sm:text-3xl">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-ink/80">{product.description}</p>
        </div>
        {/* tagline on the left, price and Buy on the right: keeps the card short on wide screens */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink/10 pt-4">
          <MotherTagline variant="compact" />
          <div className="flex flex-wrap items-center gap-4">
            <p>
              <span className="block text-3xl font-bold leading-none">{inr(product.price)}</span>
              <span className="text-sm text-ink/70">{product.size} · Incl. of all taxes</span>
            </p>
            <BuyButton slug={product.slug} />
          </div>
        </div>
      </div>
    </article>
  );
}
