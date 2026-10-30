import { notFound, redirect } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import { connectDB, isDbConfigured } from "@/lib/db";
import { getAdmin } from "@/lib/session";
import { Post, type PostLean } from "@/models/Post";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  if (!(await getAdmin())) redirect(`/admin/login?next=/admin/blog/${params.id}`);
  if (!/^[a-f0-9]{24}$/.test(params.id)) notFound();
  if (!isDbConfigured()) return <DatabaseNotice reason="not-configured" />;
  let p: PostLean | null;
  try {
    await connectDB();
    p = (await Post.findById(params.id).lean()) as unknown as PostLean | null;
  } catch (e) {
    console.error("admin edit post: database error", e);
    return <DatabaseNotice reason="unreachable" />;
  }
  if (!p) notFound();
  return (
    <PostEditor
      key={String(p._id)}
      initial={{
        id: String(p._id),
        title: p.title,
        slug: p.slug,
        description: p.description,
        body: p.body,
        tags: p.tags ?? [],
        image: p.image,
        imageAlt: p.imageAlt,
        tone: p.tone ?? "honey",
        status: p.status,
        publishedAt: new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }),
      }}
    />
  );
}
