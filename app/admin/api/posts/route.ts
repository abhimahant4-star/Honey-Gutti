import { NextResponse } from "next/server";
import { adminDbError, guardAdmin } from "@/lib/admin-api";
import { refreshBlogPages } from "@/lib/blog";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { isDuplicateKey, toDoc } from "@/lib/post-save";
import { fieldErrors, postSchema } from "@/lib/validation";
import { Post } from "@/models/Post";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Create a post. */
export async function POST(req: Request) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please check the highlighted fields.", 400, { fields: fieldErrors(parsed.error.issues) });
  try {
    await connectDB();
    const doc = await Post.create(toDoc(parsed.data));
    refreshBlogPages(doc.slug);
    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  } catch (e) {
    if (isDuplicateKey(e)) return jsonError("Another post already uses this web address.", 409, { fields: { slug: "Already used by another post. Change it slightly." } });
    return adminDbError(e, "create post");
  }
}
