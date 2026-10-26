import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, Droplets, Truck, ShieldCheck, Flag } from "lucide-react";
import { AboutUs } from "@/components/AboutUs";
import { Hero } from "@/components/Hero";
import { HoneyDrip } from "@/components/HoneyDrip";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/lib/products";
import { site } from "@/lib/site";
import { inr } from "@/lib/format";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const trust = [
  { icon: Droplets, title: "Honey based", text: "Made on a pure honey base." },
  { icon: Leaf, title: "Ayurvedic herbs", text: "Tulsi, Mulethi, Vasa and more." },
  { icon: Flag, title: "Made in India", text: "Mfg. Lic. No. HP-207-AY." },
  { icon: Truck, title: "Delivered to you", text: `Free delivery above ${inr(site.freeShippingAbove)}.` },
];

export default function Home() {
  const hero = products[0];
  return (
    <>
      <Hero />
      <HoneyDrip />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trust.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf-dark">
                <Icon size={22} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold">{title}</h3>
                <p className="text-ink/75">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Our products</h2>
          <Link href="/products" className="font-semibold text-pack underline underline-offset-4">View all</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <AboutUs />

      <section id="spotlight" className="bg-honey-mist py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">What's in Honey Ghutti</h2>
            <p className="mt-3 max-w-md text-ink/80">Each 10 ml contains the following, as printed on the pack.</p>
            <dl className="mt-6 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
              {hero.ingredients!.map((i) => (
                <div key={i.latin} className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-3 px-4 py-2.5">
                  <dt className="font-semibold">{i.hi}</dt>
                  <dd className="text-ink/80">{i.latin}</dd>
                  <dd className="font-semibold tabular-nums">{i.qty}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-col justify-center gap-6">
            <div className="rounded-2xl bg-pack p-6 text-white">
              <h3 className="font-display text-xl font-bold text-honey">How to use</h3>
              <p className="mt-2 text-lg">{hero.dosage}</p>
              <p className="mt-3 font-semibold">Shake well before use.</p>
            </div>
            <div className="flex gap-3 rounded-2xl border border-leaf/30 bg-leaf-soft p-5 text-leaf-dark">
              <ShieldCheck className="mt-0.5 shrink-0" />
              <p>Indicated for all types of cough and respiratory disease. Permitted colour, flavour and preservatives used.</p>
            </div>
            <Link href={`/products/${hero.slug}`} className="self-start rounded-full bg-honey px-7 py-3.5 font-bold text-ink hover:bg-honey-deep">
              Buy Honey Ghutti
            </Link>
          </div>
        </div>
      </section>

      <section id="delivery" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">How ordering works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            ["Pick your products", "Add what you need to the cart. Change quantities any time."],
            ["Enter your address", "Tell us where to deliver and a phone number we can reach."],
            ["Pay securely online", `Pay with UPI, card or net banking. Delivery is free above ${inr(site.freeShippingAbove)}, otherwise ${inr(site.shippingFee)}.`],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-ink/10 p-6">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-honey font-bold text-ink">{i + 1}</span>
              <h3 className="mt-4 font-display text-xl font-bold">{t}</h3>
              <p className="mt-1 text-ink/75">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
