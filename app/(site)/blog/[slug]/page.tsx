import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PostArticle } from "@/components/PostArticle";
import { PostCard } from "@/components/PostCard";
import { getPublishedPost, getPublishedPosts, toView } from "@/lib/blog";
import { getCatalog } from "@/lib/catalog";
import { heroProduct } from "@/lib/products";
import { site } from "@/lib/site";

export const revalidate = 300; // also refreshed instantly when the admin saves a post

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const doc = await getPublishedPost(params.slug);
  if (!doc) return { title: "Article not found", robots: { index: false } };
  const p = toView(doc);
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/blog/${p.slug}` },
    authors: [{ name: p.author }],
    openGraph: {
      type: "article",
      url: `/blog/${p.slug}`,
      title: p.title,
      description: p.description,
      publishedTime: p.date,
      modifiedTime: new Date(doc.updatedAt).toISOString(),
      images: p.image ? [{ url: p.image, alt: p.imageAlt || p.title }] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const doc = await getPublishedPost(params.slug);
  if (!doc) notFound();
  const p = toView(doc);
  const url = `${site.url}/blog/${p.slug}`;
  const more = (await getPublishedPosts(4)).filter((x) => x.slug !== p.slug).slice(0, 2).map(toView);
  const product = (await getCatalog()).live[0] ?? heroProduct;

  return (
    <article className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "BlogPosting",
              headline: p.title,
              description: p.description,
              datePublished: p.date,
              dateModified: new Date(doc.updatedAt).toISOString(),
              author: { "@type": "Organization", name: p.author },
              publisher: { "@id": `${site.url}/#org` },
              mainEntityOfPage: url,
              url,
              image: `${site.url}${p.image ?? "/opengraph-image.jpg"}`,
              keywords: p.tags.join(", "),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: site.url },
                { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
                { "@type": "ListItem", position: 3, name: p.title, item: url },
              ],
            },
          ],
        }}
      />

      <PostArticle post={p} />

      {product && (
        <aside className="mt-8 flex flex-col items-start gap-4 rounded-2xl bg-honey p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xl font-bold text-ink">{product.name}</p>
            <p className="text-ink/85">{product.tagline}</p>
          </div>
          <Link href={`/products/${product.slug}`} className="rounded-full bg-pack px-6 py-3 font-bold text-white hover:bg-ink">
            View product
          </Link>
        </aside>
      )}

      {more.length > 0 && (
        <section className="mt-14" aria-labelledby="more-title">
          <h2 id="more-title" className="font-display text-2xl font-bold">More from the blog</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {more.map((x) => (
              <PostCard key={x.slug} post={x} headingLevel="h3" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
