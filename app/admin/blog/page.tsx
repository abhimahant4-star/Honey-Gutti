import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { ImportStarterButton } from "@/components/admin/ImportStarterButton";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import { formatPostDate } from "@/lib/blog-format";
import { connectDB, isDbConfigured } from "@/lib/db";
import { getAdmin } from "@/lib/session";
import { Post, type PostLean } from "@/models/Post";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminBlogPage({ searchParams }: { searchParams: { deleted?: string } }) {
  if (!(await getAdmin())) redirect("/admin/login?next=/admin/blog");
  if (!isDbConfigured()) return <DatabaseNotice reason="not-configured" />;
  let posts: PostLean[];
  try {
    await connectDB();
    posts = (await Post.find().sort({ updatedAt: -1 }).select("-body").lean()) as unknown as PostLean[];
  } catch (e) {
    console.error("admin blog: database error", e);
    return <DatabaseNotice reason="unreachable" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Blog posts</h1>
          <p className="mt-1 text-ink/75">Write, publish and edit articles. Published posts appear on the website straight away.</p>
        </div>
        <Link href="/admin/blog/new" className="inline-flex h-11 items-center gap-2 rounded-full bg-pack px-5 font-bold text-white hover:bg-ink">
          <Plus size={18} /> New post
        </Link>
      </div>

      {searchParams.deleted && <p role="status" className="mt-4 rounded-xl bg-leaf-soft p-3 text-leaf-dark">✓ Post deleted.</p>}

      {posts.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-ink/25 p-8 text-center">
          <p className="text-lg">No blog posts yet.</p>
          <p className="mt-1 text-ink/75">Write your first post, or start with the 3 ready-made articles about Honey Ghutti.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <ImportStarterButton />
          </div>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white">
          {posts.map((p) => (
            <li key={String(p._id)} className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
              <div className="min-w-0">
                <Link href={`/admin/blog/${p._id}`} className="font-display text-lg font-bold hover:text-pack hover:underline">{p.title}</Link>
                <p className="text-sm text-ink/70">
                  /blog/{p.slug} · {p.status === "published" && p.publishedAt ? `published ${formatPostDate(p.publishedAt)}` : `edited ${formatPostDate(p.updatedAt)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${p.status === "published" ? "bg-leaf-soft text-leaf-dark" : "bg-honey-soft text-ink"}`}>
                  {p.status === "published" ? "Published" : "Draft"}
                </span>
                {p.status === "published" && (
                  <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-pack hover:underline">View</a>
                )}
                <Link href={`/admin/blog/${p._id}`} className="rounded-full border border-ink/20 px-4 py-1.5 text-sm font-semibold hover:bg-ink hover:text-white">Edit</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
