import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { Gallery } from "@/components/Gallery";
import { JsonLd } from "@/components/JsonLd";
import { ProductCard } from "@/components/ProductCard";
import { StickyBuy } from "@/components/StickyBuy";
import { inr } from "@/lib/format";
import { getProduct, products } from "@/lib/products";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProduct(params.slug);
  if (!p) return {};
  const title = p.hindiName ? `${p.name} (${p.hindiName})` : p.name;
  const description = `${p.description} ${p.size}. Pay online and get it delivered across India.`;
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    robots: p.placeholder ? { index: false, follow: false } : undefined, // keep dummy products out of Google
    openGraph: { type: "website", title, description, url: `/products/${p.slug}`, images: p.images[0] ? [{ url: p.images[0], alt: p.name }] : undefined },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = getProduct(params.slug);
  if (!p) notFound();
  const others = products.filter((x) => x.slug !== p.slug).slice(0, 4);
  const url = `${site.url}/products/${p.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:py-8 md:pb-8">
      {!p.placeholder && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Product",
                name: p.name,
                description: p.description,
                sku: p.slug,
                image: p.images.map((i) => `${site.url}${i}`),
                brand: { "@type": "Brand", name: site.name },
                offers: {
                  "@type": "Offer",
                  url,
                  priceCurrency: "INR",
                  price: p.price,
                  availability: "https://schema.org/InStock",
                  itemCondition: "https://schema.org/NewCondition",
                  seller: { "@type": "Organization", name: site.name },
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: site.url },
                  { "@type": "ListItem", position: 2, name: "Shop", item: `${site.url}/products` },
                  { "@type": "ListItem", position: 3, name: p.name, item: url },
                ],
              },
            ],
          }}
        />
      )}

      <nav aria-label="Breadcrumb" className="text-sm text-ink/70">
        <Link href="/products" className="underline underline-offset-4">Shop</Link> / {p.name}
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-10">
        <Gallery product={p} />

        <div>
          {p.hindiName && <p lang="hi" className="font-display text-2xl font-bold text-pack">{p.hindiName}</p>}
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{p.name}</h1>
          <p className="mt-2 text-lg text-ink/80">{p.tagline}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {p.badges.map((b) => (
              <span key={b} className="rounded-full bg-leaf-soft px-3 py-1 text-sm font-semibold text-leaf-dark">{b}</span>
            ))}
          </div>

          <p className="mt-6">
            <span className="text-3xl font-bold">{inr(p.price)}</span>
            <span className="ml-3 text-ink/70">{p.size} · Inclusive of all taxes</span>
          </p>

          <div className="mt-6 max-w-md"><AddToCart slug={p.slug} /></div>

          <p className="mt-8 max-w-prose text-lg text-ink/85">{p.description}</p>

          {p.dosage && (
            <section className="mt-6 rounded-2xl bg-pack p-5 text-white">
              <h2 className="font-display text-lg font-bold text-honey">Dosage</h2>
              <p className="mt-1">{p.dosage}</p>
              <p className="mt-2 font-semibold">Shake well before use.</p>
            </section>
          )}

          {p.ingredients && (
            <section className="mt-6">
              <h2 className="font-display text-xl font-bold">Composition (each 10 ml)</h2>
              <dl className="mt-3 divide-y divide-ink/10 rounded-2xl border border-ink/10">
                {p.ingredients.map((i) => (
                  <div key={i.latin} className="grid grid-cols-[4.5rem_1fr_auto] gap-3 px-4 py-2 sm:grid-cols-[5.5rem_1fr_auto]">
                    <dt lang="hi" className="font-semibold">{i.hi}</dt>
                    <dd className="text-ink/80">{i.latin}</dd>
                    <dd className="font-semibold tabular-nums">{i.qty}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>

      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold">More from Doy &amp; Joy</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((o) => <ProductCard key={o.slug} product={o} />)}
        </div>
      </section>

      {!p.placeholder && <StickyBuy slug={p.slug} name={p.name} price={p.price} />}
    </div>
  );
}
