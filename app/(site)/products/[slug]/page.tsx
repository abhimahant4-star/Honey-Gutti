import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { Gallery } from "@/components/Gallery";
import { IngredientList, insideText, insideTitle } from "@/components/IngredientList";
import { JsonLd } from "@/components/JsonLd";
import { MotherTagline } from "@/components/MotherTagline";
import { ProductCard } from "@/components/ProductCard";
import { StickyBuy } from "@/components/StickyBuy";
import { inr } from "@/lib/format";
import { getCatalog, getPublicProduct } from "@/lib/catalog";
import { site } from "@/lib/site";

// Products come from the database; pages refresh when the admin saves a product.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await getPublicProduct(params.slug);
  if (!p) return {};
  const title = p.hindiName ? `${p.name} (${p.hindiName})` : p.name;
  const description = `${p.description} ${p.size}. Pay online and get it delivered across India.`;
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    robots: p.status !== "live" ? { index: false, follow: false } : undefined, // keep "coming soon" products out of Google
    openGraph: { type: "website", title, description, url: `/products/${p.slug}`, images: p.images[0] ? [{ url: p.images[0], alt: p.name }] : undefined },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const [p, catalog] = await Promise.all([getPublicProduct(params.slug), getCatalog()]);
  if (!p) notFound();
  const live = p.status === "live";
  const others = [...catalog.live, ...catalog.comingSoonShown].filter((x) => x.slug !== p.slug).slice(0, 3);
  const url = `${site.url}/products/${p.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:py-8 md:pb-8">
      {live && (
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

      <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-10 [&>*]:min-w-0">
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

          <div className="mt-6 max-w-md"><AddToCart slug={p.slug} available={live} /></div>
          {!live && <p className="mt-2 text-ink/70">This product is coming soon. Check back shortly.</p>}

          <p className="mt-8 max-w-prose text-lg text-ink/85">{p.description}</p>

          <MotherTagline className="mt-6 max-w-md" />

          {p.dosage && (
            <section className="mt-6 rounded-2xl bg-pack p-5 text-white">
              <h2 className="font-display text-lg font-bold text-honey">Dosage</h2>
              <p className="mt-1">{p.dosage}</p>
            </section>
          )}
        </div>
      </div>

      {/* full width under the photo and details, so the long herb list doesn't leave the left side empty */}
      {p.ingredients && p.ingredients.length > 0 && (
        <section aria-labelledby="inside-title" className="mt-12 rounded-3xl bg-honey-mist p-5 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 id="inside-title" className="font-display text-2xl font-bold sm:text-3xl">{insideTitle(p.name)}</h2>
            <p className="text-sm font-semibold text-ink/60">{p.ingredients.length} herbs</p>
          </div>
          <p className="mt-1 text-ink/75">{insideText}</p>
          <IngredientList items={p.ingredients} className="mt-5" cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
        </section>
      )}

      {others.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">More from Doy &amp; Joy</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((o) => <ProductCard key={o.slug} product={o} />)}
          </div>
        </section>
      )}

      {live && <StickyBuy slug={p.slug} name={p.name} price={p.price} />}
    </div>
  );
}
