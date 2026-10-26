import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { policies } from "@/lib/policies";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...products
      .filter((p) => !p.placeholder)
      .map((p) => ({ url: `${site.url}/products/${p.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...policies.map((p) => ({ url: `${site.url}/${p.slug}`, lastModified: now, changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
