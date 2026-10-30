"use client";

import { useState } from "react";
import type { Product } from "@/lib/products";
import { BuyButton } from "./BuyButton";
import { IngredientList, insideText, insideTitle } from "./IngredientList";
import { ProductPack } from "./ProductPack";

/** "What's in …" for every product with a composition: one tab per product. */
export function WhatsInside({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const p = products[Math.min(active, products.length - 1)];
  if (!p) return null;

  return (
    <section aria-labelledby="inside-title" className="bg-honey-mist py-16">
      <div className="mx-auto max-w-6xl px-4">
        {products.length > 1 && (
          <div role="tablist" aria-label="Choose a product" className="mb-8 flex flex-wrap gap-2">
            {products.map((x, i) => (
              <button
                key={x.slug}
                role="tab"
                aria-selected={i === active}
                aria-controls="inside-panel"
                onClick={() => setActive(i)}
                className={`rounded-full px-5 py-2 font-semibold transition ${
                  i === active ? "bg-pack text-white" : "bg-white text-ink ring-1 ring-ink/15 hover:ring-pack"
                }`}
              >
                {x.name}
              </button>
            ))}
          </div>
        )}

        <div
          id="inside-panel"
          role={products.length > 1 ? "tabpanel" : undefined}
          className="grid overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
        >
          {/* product */}
          <div className="flex flex-col gap-4 bg-gradient-to-b from-honey-soft to-honey-mist p-6 sm:p-8">
            <div className="flex h-48 items-center justify-center">
              <ProductPack product={p} sizes="(min-width:1024px) 300px, 60vw" />
            </div>
            <div>
              {p.hindiName && <p lang="hi" className="font-display text-lg font-bold text-pack">{p.hindiName}</p>}
              <p className="font-display text-2xl font-bold leading-snug">{p.name}</p>
              <p className="mt-1 line-clamp-3 text-ink/75">{p.description}</p>
            </div>
            {p.dosage && (
              <div className="rounded-2xl bg-pack p-4 text-white">
                <p className="font-display font-bold text-honey">How to use</p>
                <p className="mt-1 text-sm">{p.dosage}</p>
              </div>
            )}
            <div className="mt-auto">
              <BuyButton slug={p.slug} label={`Buy ${p.name}`} />
            </div>
          </div>

          {/* herbs */}
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h2 id="inside-title" className="font-display text-3xl font-bold sm:text-4xl">{insideTitle(p.name)}</h2>
              <p className="text-sm font-semibold text-ink/60">{p.ingredients?.length ?? 0} herbs</p>
            </div>
            <p className="mt-2 text-ink/75">{insideText}</p>
            <IngredientList items={p.ingredients ?? []} className="mt-6" cols={(p.ingredients?.length ?? 0) > 12 ? "grid-cols-2 xl:grid-cols-3" : "grid-cols-2"} />
          </div>
        </div>
      </div>
    </section>
  );
}
