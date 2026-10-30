import { revalidatePath } from "next/cache";
import { connectDB, isDbConfigured } from "./db";
import { Post, type PostLean } from "@/models/Post";

/** Public, published posts (newest first). Never throws: an unreachable database just shows no posts. */
export async function getPublishedPosts(limit = 100): Promise<PostLean[]> {
  if (!isDbConfigured()) return [];
  try {
    await connectDB();
    return (await Post.find({ status: "published" }).sort({ publishedAt: -1 }).limit(limit).lean()) as unknown as PostLean[];
  } catch (e) {
    console.error("blog: could not load posts", e);
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<PostLean | null> {
  if (!isDbConfigured() || !/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  try {
    await connectDB();
    return (await Post.findOne({ slug, status: "published" }).lean()) as unknown as PostLean | null;
  } catch (e) {
    console.error("blog: could not load post", e);
    return null;
  }
}

/** Refresh the public pages after the admin saves, publishes or deletes a post. */
export function refreshBlogPages(...slugs: (string | undefined)[]) {
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  for (const s of slugs) if (s) revalidatePath(`/blog/${s}`);
}

/** Cards and pages use this shape (works for both database posts and previews). */
export type PostView = {
  slug: string;
  title: string;
  description: string;
  body: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  tone: "honey" | "leaf" | "pack";
  author: string;
  date: string; // ISO
};

export function toView(p: PostLean): PostView {
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    body: p.body,
    tags: p.tags ?? [],
    image: p.image,
    imageAlt: p.imageAlt,
    tone: p.tone ?? "honey",
    author: p.author ?? "Doy & Joy Team",
    date: new Date(p.publishedAt ?? p.createdAt).toISOString(),
  };
}
