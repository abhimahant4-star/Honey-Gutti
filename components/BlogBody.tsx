import { Info } from "lucide-react";
import { parseBody, safeHref } from "@/lib/blog-format";

/** Renders **bold** and [links](url) as React elements. Never renders raw HTML, so posts can't inject code. */
function Inline({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      parts.push(<strong key={k++} className="font-semibold text-ink">{m[1]}</strong>);
    } else {
      const href = safeHref(m[3]);
      const external = href && !href.startsWith("/");
      parts.push(
        href ? (
          <a
            key={k++}
            href={href}
            className="font-semibold text-pack underline underline-offset-4"
            {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})}
          >
            {m[2]}
          </a>
        ) : (
          m[2]
        )
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function BlogBody({ body }: { body: string }) {
  const blocks = parseBody(body);
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.type === "h") return <h2 key={i} className="pt-4 font-display text-2xl font-bold">{b.text}</h2>;
        if (b.type === "ul")
          return (
            <ul key={i} className="list-disc space-y-2 pl-6 text-lg leading-relaxed text-ink/85 marker:text-honey-dark">
              {b.items.map((t, j) => (
                <li key={j}><Inline text={t} /></li>
              ))}
            </ul>
          );
        if (b.type === "note")
          return (
            <p key={i} className="flex gap-3 rounded-xl border border-leaf/30 bg-leaf-soft p-4 text-leaf-dark">
              <Info size={20} className="mt-0.5 shrink-0" aria-hidden />
              <span><Inline text={b.text} /></span>
            </p>
          );
        return <p key={i} className="text-lg leading-relaxed text-ink/85"><Inline text={b.text} /></p>;
      })}
    </div>
  );
}
