import Image from "next/image";
import Link from "next/link";
import { BookOpen, Leaf, Sprout } from "lucide-react";
import { formatPostDate, readingMinutesOf } from "@/lib/blog-format";
import type { PostView } from "@/lib/blog";

const tones = {
  honey: "from-honey to-honey-deep text-ink",
  leaf: "from-leaf to-leaf-dark text-white",
  pack: "from-pack to-ink text-white",
} as const;
const icons = { honey: BookOpen, leaf: Leaf, pack: Sprout } as const;

/** Cover: uploaded photo, the product pack photo, or a coloured panel in the brand colours. */
export function PostCover({ post, priority = false, large = false }: { post: Pick<PostView, "image" | "imageAlt" | "tone" | "title">; priority?: boolean; large?: boolean }) {
  const h = large ? "h-56 sm:h-80" : "h-44 sm:h-48";
  const Icon = icons[post.tone] ?? BookOpen;
  if (post.image?.startsWith("/images/pack-")) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-b from-honey-soft to-honey-mist ${h}`}>
        <Image src={post.image} alt={post.imageAlt ?? ""} width={376} height={920} priority={priority} sizes={large ? "160px" : "100px"} className="h-[85%] w-auto rounded-sm object-contain shadow-pack" />
      </div>
    );
  }
  if (post.image) {
    return (
      <div className={`relative overflow-hidden bg-honey-mist ${h}`}>
        <Image
          src={post.image}
          alt={post.imageAlt ?? ""}
          fill
          priority={priority}
          sizes={large ? "(min-width: 768px) 768px, 100vw" : "(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"}
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br ${tones[post.tone] ?? tones.honey} ${h}`}>
      <Icon size={large ? 72 : 52} strokeWidth={1.5} aria-hidden className="opacity-90" />
    </div>
  );
}

export function PostCard({ post, headingLevel = "h2" }: { post: PostView; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white transition-shadow hover:shadow-lg">
      <Link href={`/blog/${post.slug}`} tabIndex={-1} aria-hidden>
        <PostCover post={post} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full bg-leaf-soft px-2.5 py-0.5 text-xs font-semibold text-leaf-dark">{t}</span>
            ))}
          </div>
        )}
        <H className="font-display text-xl font-bold leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-pack hover:underline hover:underline-offset-4">
            {post.title}
          </Link>
        </H>
        <p className="text-ink/75">{post.description}</p>
        <p className="mt-auto pt-2 text-sm text-ink/70">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time> · {readingMinutesOf(post.body)} min read
        </p>
      </div>
    </article>
  );
}
