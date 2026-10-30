"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { ProductPack } from "./ProductPack";

export function Gallery({ product }: { product: Product }) {
  const [i, setI] = useState(0);
  const imgs = product.images;
  return (
    <div>
      <div className="flex h-[440px] items-center justify-center rounded-2xl bg-gradient-to-b from-honey-soft to-honey-mist py-6 sm:h-[540px]">
        <ProductPack product={product} src={imgs[i]} priority sizes="(min-width:1024px) 40vw, 90vw" />
      </div>
      {imgs.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-3">
          {imgs.map((src, idx) => (
            <button
              key={src}
              onClick={() => setI(idx)}
              aria-label={`Show image ${idx + 1}`}
              aria-current={idx === i}
              className={`h-24 w-16 overflow-hidden rounded border-2 ${idx === i ? "border-pack" : "border-transparent"}`}
            >
              <Image src={src} alt="" width={64} height={96} sizes="64px" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
