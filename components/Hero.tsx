"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import type { Product } from "@/lib/products";
import { MotherTagline } from "./MotherTagline";
import { ProductPack } from "./ProductPack";

const HONEY_GHUTTI = "honey-ghutti-cough-remedy";
const INTERVAL = 6000;

/** Honey Ghutti keeps its own headline, text and the two tilted packs. */
const custom: Record<string, { badge: string; lines: string[]; text: string; cta: string }> = {
  [HONEY_GHUTTI]: {
    badge: "Honey based · Ayurvedic",
    lines: ["हनी की घुट्टी,", "खांसी की छुट्टी"],
    text: "Honey Ghutti Cough Remedy is made with Tulsi, Mulethi and Banaphsa for all types of cough. Fast relief with a non-drowsy formula.",
    cta: "Buy Honey Ghutti",
  },
};

/** The yellow banner at the top of Home: one slide per live product. */
export function Hero({ products }: { products: Product[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false); // only the Pause button stops it
  const count = products.length;
  const go = useCallback((n: number) => setI(((n % count) + count) % count), [count]);
  const touchX = useRef<number | null>(null);

  // next slide every 6 seconds; choosing a slide by hand restarts the 6 seconds
  useEffect(() => {
    if (paused || count < 2) return;
    const t = setTimeout(() => go(i + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [i, paused, count, go]);

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Our products"
      className="relative bg-honey"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {/* slides sit side by side and the track moves sideways; every slide gets the height of the tallest one */}
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-700 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${i * 100}%)` }}>
        {products.map((p, idx) => {
          const on = idx === i;
          return (
            <div
              key={p.slug}
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${count}: ${p.name}`}
              aria-hidden={!on}
              // hidden slides can't be reached with the keyboard (React 18 has no `inert` prop yet)
              ref={(el) => {
                if (el) el.toggleAttribute("inert", !on);
              }}
              className="w-full shrink-0"
            >
              <div className="mx-auto grid h-full max-w-6xl items-center gap-8 px-4 pb-4 pt-10 md:grid-cols-2 md:pt-14">
              <SlideText product={p} first={idx === 0} />
              <SlideArt product={p} first={idx === 0} active={on} />
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {count > 1 && (
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 pb-8 pt-2">
          <button
            type="button"
            onClick={() => go(i - 1)}
            aria-label="Previous product"
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink/80 text-ink transition hover:bg-ink hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2" role="tablist" aria-label="Choose a product">
            {products.map((p, idx) => (
              <button
                key={p.slug}
                type="button"
                role="tab"
                aria-selected={idx === i}
                aria-label={p.name}
                onClick={() => go(idx)}
                className={`h-2.5 rounded-full transition-all ${idx === i ? "w-8 bg-pack" : "w-2.5 bg-ink/30 hover:bg-ink/60"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(i + 1)}
            aria-label="Next product"
            className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink/80 text-ink transition hover:bg-ink hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
          <button
            type="button"
            onClick={() => setPaused((x) => !x)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            className="ml-1 grid h-10 w-10 place-items-center rounded-full text-ink/70 transition hover:bg-ink/10 hover:text-ink"
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      )}
    </section>
  );
}

function SlideText({ product: p, first }: { product: Product; first: boolean }) {
  const c = custom[p.slug];
  const badge = c?.badge ?? p.badges.slice(0, 2).join(" · ");
  const lines = c?.lines ?? [p.tagline];
  const len = lines.join(" ").length;
  const Heading = first ? "h1" : "p"; // one main heading per page
  return (
    <div>
      {badge && <p className="inline-block rounded-full bg-pack px-4 py-1 text-sm font-semibold text-white">{badge}</p>}
      <Heading
        lang={/[ऀ-ॿ]/.test(lines[0]) ? "hi" : undefined}
        className={`mt-5 font-display font-extrabold leading-[1.05] text-pack ${
          len > 40 ? "text-3xl sm:text-4xl lg:text-5xl" : len > 28 ? "text-4xl sm:text-5xl lg:text-6xl" : "text-4xl sm:text-6xl lg:text-7xl"
        }`}
      >
        {lines.map((l, k) => (
          <span key={k} className="block">{l}</span>
        ))}
      </Heading>
      <p className="mt-5 line-clamp-3 max-w-md text-lg font-medium text-ink">{c?.text ?? p.description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/products/${p.slug}`} className="rounded-full bg-pack px-7 py-3.5 font-bold text-white transition hover:bg-ink">
          {c?.cta ?? `Buy ${p.name}`}
        </Link>
        <Link href="/products" className="rounded-full border-2 border-ink px-7 py-3 font-bold text-ink transition hover:bg-ink hover:text-white">
          See all products
        </Link>
      </div>
      <MotherTagline variant="hero" className="mt-8" />
    </div>
  );
}

function SlideArt({ product: p, first, active }: { product: Product; first: boolean; active: boolean }) {
  if (p.slug === HONEY_GHUTTI) {
    // the two packs rise in, staggered (turned off for "reduce motion" users in globals.css)
    return (
      <div className="flex h-[300px] items-end justify-center gap-4 sm:h-[460px] md:h-[520px]">
        <div className="h-[86%] -rotate-3">
          <div className={`h-full ${active ? "animate-rise [animation-delay:100ms]" : ""}`}>
            <ProductPack product={p} src="/images/pack-hindi.jpg" priority={first} sizes="(min-width:768px) 190px, (min-width:640px) 165px, 140px" />
          </div>
        </div>
        <div className="h-full rotate-2">
          <div className={`h-full ${active ? "animate-rise [animation-delay:300ms]" : ""}`}>
            <ProductPack product={p} src="/images/pack-english.jpg" priority={first} sizes="(min-width:768px) 220px, (min-width:640px) 190px, 160px" />
          </div>
        </div>
      </div>
    );
  }
  const src = p.images[0];
  return (
    <div className="flex h-[300px] items-center justify-center sm:h-[460px] md:h-[520px]">
      {src ? (
        <div className={`relative aspect-[1/1.05] h-full max-h-[480px] max-w-full overflow-hidden rounded-[2rem] shadow-pack ring-4 ring-white/60 ${active ? "animate-rise" : ""}`}>
          <Image src={src} alt={`${p.name} pack`} fill priority={first} sizes="(min-width:768px) 480px, 90vw" className="object-cover" />
        </div>
      ) : (
        <ProductPack product={p} />
      )}
    </div>
  );
}
