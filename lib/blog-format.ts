/**
 * Blog text format (shared by the admin editor preview and the public pages).
 *
 *   ## Heading             -> heading
 *   - item                 -> bullet list (one line per item)
 *   > text                 -> highlighted note
 *   **bold**               -> bold
 *   [text](https://...)    -> link
 *   blank line             -> new paragraph
 */

export type Block =
  | { type: "h"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "note"; text: string };

export function parseBody(body: string): Block[] {
  const blocks: Block[] = [];
  const lines = body.replace(/\r\n?/g, "\n").split("\n");
  let para: string[] = [];
  let list: string[] = [];
  let note: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    if (list.length) blocks.push({ type: "ul", items: list });
    if (note.length) blocks.push({ type: "note", text: note.join(" ") });
    para = [];
    list = [];
    note = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const h = line.match(/^#{1,3}\s+(.*)$/);
    if (h) {
      flush();
      blocks.push({ type: "h", text: h[1] });
      continue;
    }
    const li = line.match(/^[-*•]\s+(.*)$/);
    if (li) {
      if (para.length || note.length) flush();
      list.push(li[1]);
      continue;
    }
    const q = line.match(/^>\s?(.*)$/);
    if (q) {
      if (para.length || list.length) flush();
      note.push(q[1]);
      continue;
    }
    if (list.length || note.length) flush();
    para.push(line);
  }
  flush();
  return blocks;
}

/** Plain words of the post (for reading time and search snippets). */
export function plainText(body: string): string {
  return body
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*•-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function readingMinutesOf(body: string): number {
  const words = plainText(body).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** "Meet the herbs!" -> "meet-the-herbs" */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/** Only allow safe link targets: our own pages, https/http, mailto, tel. */
export function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^\/(?!\/)/.test(h)) return h;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(h)) return h;
  return null;
}

export const formatPostDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
