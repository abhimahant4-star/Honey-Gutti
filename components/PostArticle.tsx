import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BlogBody } from "@/components/BlogBody";
import { PostCover } from "@/components/PostCard";
import { formatPostDate, readingMinutesOf } from "@/lib/blog-format";
import type { PostView } from "@/lib/blog";

/** The article itself. Used by the public post page and the admin preview, so both look identical. */
export function PostArticle({ post, preview = false }: { post: PostView; preview?: boolean }) {
  return (
    <>
      {!preview && (
        <Link href="/blog" className="inline-flex items-center gap-1 font-semibold text-pack hover:underline">
          <ArrowLeft size={18} aria-hidden /> All articles
        </Link>
      )}
      <header className={preview ? "" : "mt-5"}>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-leaf-soft px-2.5 py-0.5 text-xs font-semibold text-leaf-dark">{t}</span>
            ))}
          </div>
        )}
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">{post.title || "Untitled post"}</h1>
        {post.description && <p className="mt-3 text-lg text-ink/75">{post.description}</p>}
        <p className="mt-3 text-sm text-ink/70">
          {post.author} · <time dateTime={post.date}>{formatPostDate(post.date)}</time> · {readingMinutesOf(post.body)} min read
        </p>
      </header>

      <div className="mt-8 overflow-hidden rounded-2xl">
        <PostCover post={post} priority={!preview} large />
      </div>

      <div className="mt-8">
        <BlogBody body={post.body} />
      </div>

      <p className="mt-10 border-t border-ink/10 pt-6 text-sm text-ink/70">
        This article is general information about traditional Ayurvedic ingredients and home care. It is not medical advice and
        does not replace a doctor. Use any medicine as directed on its label or by your physician.
      </p>
    </>
  );
}
