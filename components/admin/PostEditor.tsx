"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Bold, Eye, Heading2, ImagePlus, Link2, List, Loader2, MessageSquareQuote, PenLine, Trash2, X } from "lucide-react";
import { PostArticle } from "@/components/PostArticle";
import { slugify } from "@/lib/blog-format";
import { shrinkImage } from "@/lib/shrink-image";

export type EditorPost = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  body: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  tone: "honey" | "leaf" | "pack";
  status: "draft" | "published";
  publishedAt?: string; // YYYY-MM-DD
};

const todayIST = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const field = "w-full rounded-xl border border-ink/25 bg-white px-4 py-3 text-base focus:border-pack focus:outline-none focus:ring-2 focus:ring-honey/60";
const label = "mb-1 block font-semibold";

export function PostEditor({ initial }: { initial?: EditorPost }) {
  const router = useRouter();
  const isNew = !initial?.id;
  const [p, setP] = useState<EditorPost>(
    initial ?? { title: "", slug: "", description: "", body: "", tags: [], tone: "honey", status: "draft", publishedAt: todayIST() }
  );
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "upload" | "delete">("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dirty, setDirty] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const pendingSelection = useRef<[number, number] | null>(null);

  // After a toolbar insert, put the cursor/selection in place before the browser paints,
  // so the very next key the person types lands in the text box.
  useLayoutEffect(() => {
    const ta = bodyRef.current;
    const sel = pendingSelection.current;
    if (!ta || !sel) return;
    pendingSelection.current = null;
    ta.focus();
    ta.setSelectionRange(sel[0], sel[1]);
  }, [p.body]);

  // "?saved=1" after creating a post
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("saved")) setSaved(initial?.status === "published" ? "Published." : "Saved as draft.");
  }, [initial?.status]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof EditorPost>(k: K, v: EditorPost[K]) => {
    setP((old) => ({ ...old, [k]: v }));
    setDirty(true);
    setSaved("");
  };

  const onTitle = (v: string) => {
    setP((old) => ({ ...old, title: v, slug: slugTouched ? old.slug : slugify(v) }));
    setDirty(true);
    setSaved("");
  };

  /** Toolbar: wraps the selected text or inserts an example at the cursor. */
  function insert(kind: "h" | "ul" | "b" | "link" | "note") {
    const ta = bodyRef.current;
    if (!ta) return;
    const { selectionStart: s, selectionEnd: e, value } = ta;
    const sel = value.slice(s, e);
    const before = value.slice(0, s);
    const nl = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    let text = "";
    let cursorFrom = 0;
    let cursorTo = 0;
    if (kind === "b") {
      text = `**${sel || "bold text"}**`;
      cursorFrom = 2;
      cursorTo = text.length - 2;
    } else if (kind === "link") {
      text = `[${sel || "link text"}](https://)`;
      cursorFrom = text.length - 9;
      cursorTo = text.length - 1;
    } else {
      const sample = { h: "## Heading", ul: `- ${sel || "First point"}\n- Second point`, note: `> ${sel || "Important note"}` }[kind];
      text = `${nl}${sample}\n\n`;
      cursorFrom = nl.length + (kind === "h" ? 3 : 2);
      cursorTo = kind === "ul" ? text.length - 2 : nl.length + sample.length;
    }
    const next = value.slice(0, s) + text + value.slice(e);
    pendingSelection.current = [s + cursorFrom, s + cursorTo];
    ta.focus();
    set("body", next);
  }

  async function upload(file: File | undefined) {
    if (!file) return;
    setErrors((x) => ({ ...x, image: "" }));
    setBusy("upload");
    try {
      const { blob, width, height } = await shrinkImage(file);
      const fd = new FormData();
      fd.append("file", blob, "cover");
      fd.append("width", String(width));
      fd.append("height", String(height));
      const res = await fetch("/admin/api/upload", { method: "POST", body: fd });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error ?? "Upload failed.");
      set("image", out.url);
      if (!p.imageAlt) set("imageAlt", p.title);
    } catch (e) {
      setErrors((x) => ({ ...x, image: e instanceof Error ? e.message : "Upload failed." }));
    } finally {
      setBusy("");
    }
  }

  async function save(status: "draft" | "published") {
    setBusy("save");
    setErrors({});
    setFormError("");
    setSaved("");
    const tags = tagsText.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = { ...p, tags, status, image: p.image ?? "", imageAlt: p.imageAlt ?? "", publishedAt: p.publishedAt ?? "" };
    try {
      const res = await fetch(isNew ? "/admin/api/posts" : `/admin/api/posts/${p.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (out.fields) setErrors(out.fields);
        setFormError(out.error ?? "Could not save. Please try again.");
        if (res.status === 401) setFormError("Your admin login has expired. Open a new tab, log in again, then come back and save.");
        return;
      }
      setDirty(false);
      setP((old) => ({ ...old, status, tags }));
      if (isNew) {
        router.replace(`/admin/blog/${out.id}?saved=1`);
        router.refresh();
      } else {
        setSaved(status === "published" ? "Published. The website shows the new version now." : "Saved as draft (not visible on the website).");
        router.refresh();
      }
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setBusy("");
    }
  }

  async function remove() {
    if (!p.id) return;
    setBusy("delete");
    const res = await fetch(`/admin/api/posts/${p.id}`, { method: "DELETE" });
    if (res.ok) {
      setDirty(false);
      router.push("/admin/blog?deleted=1");
      router.refresh();
    } else {
      const out = await res.json().catch(() => ({}));
      setFormError(out.error ?? "Could not delete.");
      setBusy("");
      setConfirmDelete(false);
    }
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p role="alert" className="mt-1 text-sm text-red-700">{errors[k]}</p> : null);
  const preview = {
    ...p,
    tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
    author: "Doy & Joy Team",
    date: new Date(`${p.publishedAt || todayIST()}T10:00:00+05:30`).toISOString(),
  };
  const tool = "inline-flex h-9 items-center gap-1 rounded-lg border border-ink/15 bg-white px-2.5 text-sm font-semibold hover:bg-honey-soft";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/blog" className="text-sm font-semibold text-pack hover:underline">← All posts</Link>
          <h1 className="mt-1 font-display text-3xl font-bold">{isNew ? "New blog post" : "Edit blog post"}</h1>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${p.status === "published" ? "bg-leaf-soft text-leaf-dark" : "bg-honey-soft text-ink"}`}>
          {p.status === "published" ? "Published" : "Draft"}
        </span>
      </div>

      {saved && (
        <p role="status" className="mt-4 rounded-xl bg-leaf-soft p-3 text-leaf-dark">
          ✓ {saved}{" "}
          {p.status === "published" && p.slug && (
            <a href={`/blog/${p.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold underline">View on website</a>
          )}
        </p>
      )}

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="title" className={label}>Title</label>
          <input id="title" value={p.title} onChange={(e) => onTitle(e.target.value)} maxLength={120} className={`${field} text-lg font-semibold`} placeholder="e.g. 5 benefits of Tulsi in winter" />
          <Err k="title" />
        </div>

        <div>
          <label htmlFor="slug" className={label}>Web address</label>
          <div className="flex items-center rounded-xl border border-ink/25 bg-white pl-4 focus-within:border-pack focus-within:ring-2 focus-within:ring-honey/60">
            <span className="shrink-0 text-ink/60">/blog/</span>
            <input
              id="slug"
              value={p.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
              }}
              className="w-full rounded-xl bg-transparent px-1 py-3 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-sm text-ink/70">Made from the title automatically. Avoid changing it after publishing (old links would stop working).</p>
          <Err k="slug" />
        </div>

        <div>
          <label htmlFor="description" className={label}>Short summary</label>
          <textarea id="description" rows={2} value={p.description} onChange={(e) => set("description", e.target.value)} maxLength={220} className={field} placeholder="1–2 sentences. Shown on the blog page and in Google results." />
          <p className="mt-1 text-right text-xs text-ink/70">{p.description.length}/220</p>
          <Err k="description" />
        </div>

        <div className="rounded-2xl border border-ink/10 p-4">
          <p className={label}>Cover photo <span className="font-normal text-ink/70">(optional)</span></p>
          {p.image ? (
            <div className="flex flex-wrap items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="h-28 w-44 rounded-lg object-cover" />
              <div className="flex-1 space-y-2">
                <label htmlFor="imageAlt" className="block text-sm font-semibold">Photo description (for blind readers and Google)</label>
                <input id="imageAlt" value={p.imageAlt ?? ""} onChange={(e) => set("imageAlt", e.target.value)} maxLength={150} className={field} />
                <button type="button" onClick={() => set("image", undefined)} className="inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline">
                  <X size={16} /> Remove photo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <label className={`${tool} h-11 cursor-pointer px-4`}>
                {busy === "upload" ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                {busy === "upload" ? "Uploading…" : "Upload photo"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy === "upload"} onChange={(e) => upload(e.target.files?.[0])} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                Or colour cover:
                <select value={p.tone} onChange={(e) => set("tone", e.target.value as EditorPost["tone"])} className="rounded-lg border border-ink/25 bg-white px-2 py-1.5">
                  <option value="honey">Honey yellow</option>
                  <option value="leaf">Leaf green</option>
                  <option value="pack">Pack blue</option>
                </select>
              </label>
            </div>
          )}
          <Err k="image" />
        </div>

        <div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <p className={label}>Article</p>
            <div role="tablist" className="flex rounded-lg border border-ink/15 p-0.5 text-sm font-semibold">
              <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")} className={`flex items-center gap-1 rounded-md px-3 py-1.5 ${tab === "write" ? "bg-ink text-white" : ""}`}>
                <PenLine size={16} /> Write
              </button>
              <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")} className={`flex items-center gap-1 rounded-md px-3 py-1.5 ${tab === "preview" ? "bg-ink text-white" : ""}`}>
                <Eye size={16} /> Preview
              </button>
            </div>
          </div>

          {tab === "write" ? (
            <>
              <div className="mt-2 flex flex-wrap gap-2" aria-label="Formatting">
                {/* onMouseDown keeps the cursor in the text box while clicking a button */}
                <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => insert("h")}><Heading2 size={16} /> Heading</button>
                <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => insert("ul")}><List size={16} /> List</button>
                <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => insert("b")}><Bold size={16} /> Bold</button>
                <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => insert("link")}><Link2 size={16} /> Link</button>
                <button type="button" className={tool} onMouseDown={(e) => e.preventDefault()} onClick={() => insert("note")}><MessageSquareQuote size={16} /> Note</button>
              </div>
              <textarea
                id="body"
                ref={bodyRef}
                rows={18}
                value={p.body}
                onChange={(e) => set("body", e.target.value)}
                className={`${field} mt-2 font-mono text-sm leading-relaxed`}
                placeholder={"Write your article here.\n\nLeave an empty line between paragraphs.\nUse the buttons above for headings, lists, bold text, links and notes."}
              />
              <details className="mt-1 text-sm text-ink/75">
                <summary className="cursor-pointer font-semibold">How formatting works</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li><code>## Heading</code> makes a heading</li>
                  <li>Lines starting with <code>- </code> make a bullet list</li>
                  <li><code>**words**</code> makes <strong>bold</strong> text</li>
                  <li><code>[text](https://example.com)</code> makes a link</li>
                  <li>A line starting with <code>&gt; </code> makes a highlighted green note</li>
                  <li>An empty line starts a new paragraph</li>
                </ul>
              </details>
            </>
          ) : (
            <div className="mt-2 rounded-2xl border border-dashed border-ink/25 p-4 sm:p-8">
              <PostArticle post={preview} preview />
            </div>
          )}
          <Err k="body" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tags" className={label}>Tags <span className="font-normal text-ink/70">(comma separated)</span></label>
            <input id="tags" value={tagsText} onChange={(e) => { setTagsText(e.target.value); setDirty(true); }} className={field} placeholder="Ayurveda, Home care" />
            <Err k="tags" />
          </div>
          <div>
            <label htmlFor="publishedAt" className={label}>Date shown on the post</label>
            <input id="publishedAt" type="date" value={p.publishedAt ?? ""} onChange={(e) => set("publishedAt", e.target.value)} className={field} />
            <Err k="publishedAt" />
          </div>
        </div>

        {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{formError}</p>}

        <div className="flex flex-wrap items-center gap-3 border-t border-ink/10 pt-5">
          <button type="button" disabled={!!busy} onClick={() => save("published")} className="inline-flex h-12 items-center gap-2 rounded-full bg-pack px-6 font-bold text-white hover:bg-ink disabled:opacity-60">
            {busy === "save" && <Loader2 size={18} className="animate-spin" />}
            {p.status === "published" && !isNew ? "Update post" : "Publish"}
          </button>
          <button type="button" disabled={!!busy} onClick={() => save("draft")} className="h-12 rounded-full border-2 border-ink px-6 font-bold hover:bg-ink hover:text-white disabled:opacity-60">
            {p.status === "published" && !isNew ? "Unpublish (make draft)" : "Save draft"}
          </button>
          {!isNew &&
            (confirmDelete ? (
              <span className="ml-auto flex items-center gap-2">
                <span className="text-sm font-semibold text-red-800">Delete this post for good?</span>
                <button type="button" disabled={!!busy} onClick={remove} className="rounded-full bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800">
                  {busy === "delete" ? "Deleting…" : "Yes, delete"}
                </button>
                <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold">Cancel</button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-red-700 hover:underline">
                <Trash2 size={16} /> Delete post
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
