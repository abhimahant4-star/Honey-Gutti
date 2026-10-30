import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PostCard } from "@/components/PostCard";
import { getPublishedPosts, toView } from "@/lib/blog";
import { site } from "@/lib/site";

export const revalidate = 300; // also refreshed instantly when the admin saves a post

export const metadata: Metadata = {
  title: "Blog: Ayurveda, honey and home care",
  description: "Simple guides from Doy & Joy on Ayurvedic herbs, Honey Ghutti and caring for coughs and colds at home.",
  alternates: { canonical: "/blog" },
  openGraph: { type: "website", url: "/blog", title: "Doy & Joy Blog", description: "Simple guides on Ayurvedic herbs, Honey Ghutti and home care." },
};

export default async function BlogPage() {
  const posts = (await getPublishedPosts()).map(toView);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: `${site.name} Blog`,
          url: `${site.url}/blog`,
          publisher: { "@id": `${site.url}/#org` },
          blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${site.url}/blog/${p.slug}`, datePublished: p.date })),
        }}
      />
      <p className="font-semibold uppercase tracking-wider text-honey-dark">Blog</p>
      <h1 className="mt-1 font-display text-4xl font-bold">Ayurveda, honey &amp; home care</h1>
      <p className="mt-2 max-w-2xl text-lg text-ink/75">
        Simple, honest guides on the herbs we use, how to take Honey Ghutti, and caring for your family in cough and cold season.
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 text-center text-lg text-ink/70">New articles are coming soon.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
