import { NextResponse } from "next/server";
import { adminDbError, guardAdmin } from "@/lib/admin-api";
import { refreshBlogPages } from "@/lib/blog";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { deleteImageIfUnused, isDuplicateKey, toDoc } from "@/lib/post-save";
import { fieldErrors, postSchema } from "@/lib/validation";
import { Post } from "@/models/Post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const validId = (id: string) => /^[a-f0-9]{24}$/.test(id);

/** Update a post. */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  if (!validId(params.id)) return jsonError("Post not found.", 404);
  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please check the highlighted fields.", 400, { fields: fieldErrors(parsed.error.issues) });
  try {
    await connectDB();
    const old = (await Post.findById(params.id).lean()) as { slug: string; image?: string; publishedAt?: Date } | null;
    if (!old) return jsonError("This post no longer exists.", 404);
    const next = toDoc(parsed.data, old.publishedAt);
    await Post.updateOne({ _id: params.id }, { $set: next, ...(next.image ? {} : { $unset: { image: 1 } }) });
    if (old.image && old.image !== next.image) await deleteImageIfUnused(old.image);
    refreshBlogPages(old.slug, next.slug);
    return NextResponse.json({ ok: true, id: params.id });
  } catch (e) {
    if (isDuplicateKey(e)) return jsonError("Another post already uses this web address.", 409, { fields: { slug: "Already used by another post. Change it slightly." } });
    return adminDbError(e, "update post");
  }
}

/** Delete a post (and its uploaded photo). */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  if (!validId(params.id)) return jsonError("Post not found.", 404);
  try {
    await connectDB();
    const old = (await Post.findByIdAndDelete(params.id).lean()) as { slug: string; image?: string } | null;
    if (!old) return jsonError("This post no longer exists.", 404);
    await deleteImageIfUnused(old.image);
    refreshBlogPages(old.slug);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminDbError(e, "delete post");
  }
}
