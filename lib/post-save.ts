import { BlogImage } from "@/models/BlogImage";
import { Post } from "@/models/Post";
import { Product } from "@/models/Product";
import type { PostInput } from "./validation";

const IMAGE_ID = /^\/api\/blog-image\/([a-f0-9]{24})$/;

/** Turns the form values into what is stored. Keeps the original publish date unless the admin changes it. */
export function toDoc(input: PostInput, existingPublishedAt?: Date) {
  let publishedAt = existingPublishedAt;
  if (input.publishedAt) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    const chosen = input.publishedAt;
    const sameDay = existingPublishedAt && existingPublishedAt.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) === chosen;
    if (!sameDay) publishedAt = chosen === today ? new Date() : new Date(`${chosen}T10:00:00+05:30`);
  }
  if (input.status === "published" && !publishedAt) publishedAt = new Date();
  return {
    title: input.title,
    slug: input.slug,
    description: input.description,
    body: input.body,
    tags: [...new Set(input.tags.map((t) => t.trim()).filter(Boolean))],
    image: input.image || undefined,
    imageAlt: input.imageAlt || undefined,
    tone: input.tone,
    status: input.status,
    publishedAt,
  };
}

/** Deletes an uploaded photo when no blog post and no product uses it any more. */
export async function deleteImageIfUnused(url?: string) {
  const id = url?.match(IMAGE_ID)?.[1];
  if (!id) return;
  const stillUsed = (await Post.exists({ image: url })) || (await Product.exists({ images: url }));
  if (!stillUsed) await BlogImage.deleteOne({ _id: id });
}

export const isDuplicateKey = (e: unknown) => (e as { code?: number })?.code === 11000;
