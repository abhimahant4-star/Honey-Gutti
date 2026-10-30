import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, Droplets, Truck, Flag } from "lucide-react";
import { AboutUs } from "@/components/AboutUs";
import { Hero } from "@/components/Hero";
import { HoneyDrip } from "@/components/HoneyDrip";
import { PostCard } from "@/components/PostCard";
import { ProductHighlights } from "@/components/ProductHighlights";
import { ProductShowcase } from "@/components/ProductShowcase";
import { ComingSoonSection } from "@/components/ComingSoonSection";
import { getPublishedPosts, toView } from "@/lib/blog";
import { getCatalog } from "@/lib/catalog";
import { site } from "@/lib/site";
import { inr } from "@/lib/format";

export const metadata: Metadata = { alternates: { canonical: "/" } };

const trust = [
  { icon: Droplets, title: "Honey based", text: "Made on a pure honey base." },
  { icon: Leaf, title: "Ayurvedic herbs", text: "Tulsi, Mulethi, Vasa and more." },
  { icon: Flag, title: "Made in India", text: "Mfg. Lic. No. HP-207-AY." },
  { icon: Truck, title: "Delivered to you", text: `Free delivery above ${inr(site.freeShippingAbove)}.` },
];

export const revalidate = 300; // latest blog posts; also refreshed when the admin saves a post

export default async function Home() {
  const [posts, catalog] = await Promise.all([getPublishedPosts(3).then((x) => x.map(toView)), getCatalog()]);
  return (
    <>
      <Hero products={catalog.live.slice(0, 5)} />
      <HoneyDrip />

      <section aria-labelledby="why-title" className="mx-auto max-w-6xl px-4 py-10">
        <h2 id="why-title" className="sr-only">Why choose Honey Ghutti</h2>
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

      <section id="products" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Our products</h2>
        <p className="mt-2 max-w-2xl text-ink/75">
          Honey-based Ayurvedic remedies made in India. Tap Buy now, log in or create a free account, and order in a minute.
        </p>
        <div className="mt-8">
          <ProductShowcase live={catalog.live} />
        </div>
        <ComingSoonSection catalog={catalog} className="mt-14" />
      </section>

      <AboutUs />

      {posts.length > 0 && (
        <section aria-labelledby="blog-title" className="mx-auto max-w-6xl px-4 pb-16 pt-8">
          <div className="flex items-end justify-between gap-4">
            <h2 id="blog-title" className="font-display text-3xl font-bold sm:text-4xl">From our blog</h2>
            <Link href="/blog" className="font-semibold text-pack underline underline-offset-4">All articles</Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}

      <ProductHighlights showInside={false} />
    </>
  );
}
