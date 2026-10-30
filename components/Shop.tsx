"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

export function Shop({ products }: { products: Product[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"featured" | "low" | "high">("featured");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const filtered = products.filter((p) => !s || `${p.name} ${p.hindiName ?? ""} ${p.tagline}`.toLowerCase().includes(s));
    if (sort === "low") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "high") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, q, sort]);

  return (
    <>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search products</span>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products"
            className="h-12 w-full rounded-full border border-ink/20 bg-white pl-11 pr-4"
          />
        </label>
        <label>
          <span className="sr-only">Sort by</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-12 w-full rounded-full border border-ink/20 bg-white px-4 sm:w-52">
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>

      <h2 className="sr-only">Products</h2>
      {list.length === 0 ? (
        <p className="mt-12 text-center text-lg text-ink/70">No products match “{q}”. Try a different word.</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </>
  );
}
