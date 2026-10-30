import type { MetadataRoute } from "next";
import { policies } from "@/lib/policies";
import { getPublishedPosts } from "@/lib/blog";
import { site } from "@/lib/site";

// Always current (new blog posts appear immediately). It is a small, quick database query.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getPublishedPosts();
  return [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    // single product pages need a login, so they are not listed for search engines.
    { url: `${site.url}/blog`, lastModified: posts[0] ? new Date(posts[0].updatedAt) : now, changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((p) => ({ url: `${site.url}/blog/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...policies.map((p) => ({ url: `${site.url}/${p.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
