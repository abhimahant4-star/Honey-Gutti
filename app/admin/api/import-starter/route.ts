import { NextResponse } from "next/server";
import { adminDbError, guardAdmin } from "@/lib/admin-api";
import { refreshBlogPages } from "@/lib/blog";
import { connectDB } from "@/lib/db";
import { starterPosts } from "@/lib/posts";
import { Post } from "@/models/Post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Adds the 3 starter posts (skips any whose web address already exists). */
export async function POST(req: Request) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  try {
    await connectDB();
    let added = 0;
    for (const s of starterPosts) {
      if (await Post.exists({ slug: s.slug })) continue;
      await Post.create({
        slug: s.slug,
        title: s.title,
        description: s.description,
        body: s.body,
        tags: s.tags,
        image: s.image,
        tone: s.tone,
        status: "published",
        publishedAt: new Date(`${s.date}T10:00:00+05:30`),
      });
      added++;
    }
    refreshBlogPages(...starterPosts.map((s) => s.slug));
    return NextResponse.json({ ok: true, added });
  } catch (e) {
    return adminDbError(e, "import starter posts");
  }
}
