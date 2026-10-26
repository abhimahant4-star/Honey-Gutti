"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ProductPack } from "./ProductPack";
import { products } from "@/lib/products";

export function Hero() {
  const p = products[0];
  const reduce = useReducedMotion();
  // One orchestrated entrance: the two packs rise in, staggered.
  const rise = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 48 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay, ease: "easeOut" as const } };

  return (
    <section className="bg-honey">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-6 pt-10 md:grid-cols-2 md:pt-14">
        <div>
          <p className="inline-block rounded-full bg-pack px-4 py-1 text-sm font-semibold text-white">Honey based · Ayurvedic</p>
          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-pack sm:text-6xl lg:text-7xl">
            हनी की घुट्टी,
            <br />
            खांसी की छुट्टी
          </h1>
          <p className="mt-5 max-w-md text-lg font-medium text-ink">
            Honey Ghutti Cough Remedy is made with Tulsi, Mulethi and Banaphsa for all types of cough. Fast relief with a non-drowsy formula.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/products/${p.slug}`} className="rounded-full bg-pack px-7 py-3.5 font-bold text-white transition hover:bg-ink">
              Buy Honey Ghutti
            </Link>
            <Link href="/products" className="rounded-full border-2 border-ink px-7 py-3 font-bold text-ink transition hover:bg-ink hover:text-white">
              See all products
            </Link>
          </div>
        </div>

        <div className="flex h-[380px] items-end justify-center gap-4 sm:h-[460px] md:h-[520px]">
          <motion.div className="h-[86%] -rotate-3" {...rise(0.1)}>
            <ProductPack product={p} src="/images/pack-hindi.jpg" priority sizes="(min-width:768px) 22vw, 40vw" />
          </motion.div>
          <motion.div className="h-full rotate-2" {...rise(0.3)}>
            <ProductPack product={p} src="/images/pack-english.jpg" priority sizes="(min-width:768px) 24vw, 44vw" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
