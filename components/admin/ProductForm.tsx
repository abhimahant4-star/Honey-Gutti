"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Clock, EyeOff, ImagePlus, Loader2, Plus, Rocket, Star, Trash2, X } from "lucide-react";
import { slugify } from "@/lib/blog-format";
import type { Ingredient, ProductStatus } from "@/lib/products";
import { shrinkImage } from "@/lib/shrink-image";
import { btnPrimary, btnSecondary, card, field, label } from "./ui";

export type FormProduct = {
  id?: string;
  name: string;
  slug: string;
  hindiName: string;
  tagline: string;
  description: string;
  price: string;
  size: string;
  images: string[];
  badges: string[];
  ingredients: Ingredient[];
  dosage: string;
  status: ProductStatus;
  featured: boolean;
  sortOrder: string;
};

const blank = (status: ProductStatus): FormProduct => ({
  name: "",
  slug: "",
  hindiName: "",
  tagline: "",
  description: "",
  price: "",
  size: "100 ml",
  images: [],
  badges: ["Ayurvedic"],
  ingredients: [],
  dosage: "",
  status,
  featured: false,
  sortOrder: "0",
});

const statusChoices: { value: ProductStatus; title: string; text: string; icon: typeof Rocket }[] = [
  { value: "live", title: "Live", text: "On sale. Customers can add it to the cart.", icon: Rocket },
  { value: "coming_soon", title: "Coming soon", text: "Shown as a Coming soon card. Can't be bought yet.", icon: Clock },
  { value: "hidden", title: "Hidden", text: "Not on the website. Only you can see it here.", icon: EyeOff },
];

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-sm text-red-700">{msg}</p> : null;
}

export function ProductForm({ initial, defaultStatus = "live" }: { initial?: FormProduct; defaultStatus?: ProductStatus }) {
  const router = useRouter();
  const isNew = !initial?.id;
  const [p, setP] = useState<FormProduct>(initial ?? blank(defaultStatus));
  const [badgesText, setBadgesText] = useState(p.badges.join(", "));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "upload" | "delete">("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("saved")) setSaved("Product added.");
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof FormProduct>(k: K, v: FormProduct[K]) => {
    setP((old) => ({ ...old, [k]: v }));
    setDirty(true);
    setSaved("");
  };

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setErrors((x) => ({ ...x, images: "" }));
    setBusy("upload");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files).slice(0, 8 - p.images.length)) {
        const { blob, width, height } = await shrinkImage(file);
        const fd = new FormData();
        fd.append("file", blob, "product");
        fd.append("width", String(width));
        fd.append("height", String(height));
        const res = await fetch("/admin/api/upload", { method: "POST", body: fd });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(out.error ?? "Upload failed.");
        urls.push(out.url);
      }
      setP((old) => ({ ...old, images: [...old.images, ...urls] }));
      setDirty(true);
    } catch (e) {
      setErrors((x) => ({ ...x, images: e instanceof Error ? e.message : "Upload failed." }));
    } finally {
      setBusy("");
    }
  }

  const moveImage = (i: number, by: -1 | 1) => {
    const imgs = [...p.images];
    const j = i + by;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    set("images", imgs);
  };

  const setIngredient = (i: number, k: keyof Ingredient, v: string) =>
    set("ingredients", p.ingredients.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));

  async function save() {
    setBusy("save");
    setErrors({});
    setFormError("");
    const payload = {
      ...p,
      price: Number(p.price),
      sortOrder: Number(p.sortOrder || 0),
      badges: badgesText.split(",").map((b) => b.trim()).filter(Boolean),
      ingredients: p.ingredients.filter((i) => i.latin.trim() || i.hi.trim()),
    };
    try {
      const res = await fetch(isNew ? "/admin/api/products" : `/admin/api/products/${p.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors(out.fields ?? {});
        setFormError(out.error ?? "Could not save. Please try again.");
        setBusy("");
        return;
      }
      setDirty(false);
      if (isNew) {
        window.location.assign(`/admin/products/${out.id}?saved=1`);
        return;
      }
      setSaved("Saved. The website is updated.");
      setBusy("");
      router.refresh();
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setBusy("");
    }
  }

  async function remove() {
    setBusy("delete");
    const res = await fetch(`/admin/api/products/${p.id}`, { method: "DELETE" }).catch(() => null);
    if (res?.ok) {
      setDirty(false);
      window.location.assign("/admin/products?deleted=1");
      return;
    }
    const out = await res?.json().catch(() => ({}));
    setFormError(out?.error ?? "Could not delete. Please try again.");
    setBusy("");
    setConfirmDelete(false);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      noValidate
    >
      <div className="min-w-0 space-y-6">
        {/* Basics */}
        <section className={`${card} space-y-4 p-5 sm:p-6`}>
          <h2 className="font-display text-xl font-bold">Product details</h2>
          <div>
            <label htmlFor="name" className={label}>Name</label>
            <input
              id="name"
              value={p.name}
              onChange={(e) => {
                const v = e.target.value;
                setP((old) => ({ ...old, name: v, slug: slugTouched ? old.slug : slugify(v) }));
                setDirty(true);
                setSaved("");
              }}
              className={field}
              placeholder="e.g. Honey Ghutti Cough Remedy"
            />
            <Err msg={errors.name} />
          </div>
          <div>
            <label htmlFor="slug" className={label}>Web address</label>
            <div className="flex items-center gap-1 rounded-xl border border-slate-300 bg-slate-50 pl-3.5 focus-within:ring-2 focus-within:ring-honey/60">
              <span className="shrink-0 text-slate-500">/products/</span>
              <input
                id="slug"
                value={p.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
                }}
                className="min-w-0 flex-1 rounded-r-xl bg-white px-2 py-2.5 focus:outline-none"
              />
            </div>
            <Err msg={errors.slug} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="hindiName" className={label}>Hindi name <span className="font-normal text-slate-500">(optional)</span></label>
              <input id="hindiName" lang="hi" value={p.hindiName} onChange={(e) => set("hindiName", e.target.value)} className={field} placeholder="हनी घुट्टी" />
              <Err msg={errors.hindiName} />
            </div>
            <div>
              <label htmlFor="tagline" className={label}>Tagline</label>
              <input id="tagline" value={p.tagline} onChange={(e) => set("tagline", e.target.value)} className={field} placeholder="One short line under the name" />
              <Err msg={errors.tagline} />
            </div>
          </div>
          <div>
            <label htmlFor="description" className={label}>Description</label>
            <textarea id="description" rows={4} value={p.description} onChange={(e) => set("description", e.target.value)} className={field} />
            <Err msg={errors.description} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="price" className={label}>Price (₹, incl. taxes)</label>
              <input id="price" inputMode="numeric" value={p.price} onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))} className={field} placeholder="120" />
              <Err msg={errors.price} />
            </div>
            <div>
              <label htmlFor="size" className={label}>Pack size</label>
              <input id="size" value={p.size} onChange={(e) => set("size", e.target.value)} className={field} placeholder="100 ml" />
              <Err msg={errors.size} />
            </div>
            <div>
              <label htmlFor="badges" className={label}>Badges</label>
              <input
                id="badges"
                value={badgesText}
                onChange={(e) => {
                  setBadgesText(e.target.value);
                  setDirty(true);
                  setSaved("");
                }}
                className={field}
                placeholder="Honey based, Non-drowsy"
              />
              <p className="mt-1 text-xs text-slate-500">Separate with commas.</p>
              <Err msg={errors.badges} />
            </div>
          </div>
        </section>

        {/* Photos */}
        <section className={`${card} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold">Photos</h2>
              <p className="text-sm text-slate-600">The first photo is the main one. Up to 8 photos; they are shrunk automatically.</p>
            </div>
            <label className={`${btnSecondary} cursor-pointer ${p.images.length >= 8 || busy === "upload" ? "pointer-events-none opacity-60" : ""}`}>
              {busy === "upload" ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
              {busy === "upload" ? "Uploading…" : "Add photos"}
              <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
            </label>
          </div>
          <Err msg={errors.images} />
          {p.images.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">No photos yet. The website shows a branded “Image coming soon” pack until you add one.</p>
          ) : (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {p.images.map((src, i) => (
                <li key={src} className="relative rounded-xl border border-slate-200 bg-honey-mist p-2">
                  <Image src={src} alt="" width={160} height={200} className="mx-auto h-36 w-auto object-contain" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded bg-slate-900 px-1.5 py-0.5 text-xs font-semibold text-white">Main</span>}
                  <div className="mt-2 flex justify-between">
                    <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Move photo left" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white disabled:opacity-30"><ArrowLeft size={16} /></button>
                    <button type="button" onClick={() => set("images", p.images.filter((x) => x !== src))} aria-label="Remove photo" className="grid h-8 w-8 place-items-center rounded-lg text-red-700 hover:bg-white"><X size={16} /></button>
                    <button type="button" onClick={() => moveImage(i, 1)} disabled={i === p.images.length - 1} aria-label="Move photo right" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white disabled:opacity-30"><ArrowRight size={16} /></button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Composition & dosage */}
        <section className={`${card} space-y-4 p-5 sm:p-6`}>
          <div>
            <h2 className="font-display text-xl font-bold">Composition &amp; dosage <span className="text-base font-normal text-slate-500">(optional)</span></h2>
            <p className="text-sm text-slate-600">Shown on the product page as printed on the pack.</p>
          </div>
          {p.ingredients.length > 0 && (
            <div className="space-y-2">
              <div className="hidden grid-cols-[1fr_1.4fr_36px] gap-2 text-xs font-semibold text-slate-500 sm:grid">
                <span>Hindi</span><span>Name</span><span />
              </div>
              {p.ingredients.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_1.4fr_36px] gap-2">
                  <input aria-label={`Ingredient ${i + 1} Hindi name`} lang="hi" value={row.hi} onChange={(e) => setIngredient(i, "hi", e.target.value)} className={field} placeholder="तुलसी" />
                  <input aria-label={`Ingredient ${i + 1} name`} value={row.latin} onChange={(e) => setIngredient(i, "latin", e.target.value)} className={field} placeholder="Ocimum sanctum" />
                  <button type="button" onClick={() => set("ingredients", p.ingredients.filter((_, idx) => idx !== i))} aria-label={`Remove ingredient ${i + 1}`} className="grid h-11 w-9 place-items-center rounded-lg text-red-700 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Err msg={errors.latin} />
          <button type="button" onClick={() => set("ingredients", [...p.ingredients, { hi: "", latin: "", qty: "" }])} className="inline-flex items-center gap-1 font-semibold text-pack hover:underline">
            <Plus size={16} /> Add ingredient
          </button>
          <div>
            <label htmlFor="dosage" className={label}>Dosage</label>
            <textarea id="dosage" rows={2} value={p.dosage} onChange={(e) => set("dosage", e.target.value)} className={field} placeholder="2 to 3 TSF 3 times a day with hot water" />
            <Err msg={errors.dosage} />
          </div>
        </section>
      </div>

      {/* Sidebar: status and save */}
      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className={`${card} p-5`}>
          <h2 className="font-display text-lg font-bold">Show on website as</h2>
          <fieldset className="mt-3 space-y-2">
            <legend className="sr-only">Status</legend>
            {statusChoices.map((c) => {
              const Icon = c.icon;
              const on = p.status === c.value;
              return (
                <label key={c.value} className={`flex cursor-pointer gap-3 rounded-xl border-2 p-3 transition ${on ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}>
                  <input type="radio" name="status" value={c.value} checked={on} onChange={() => set("status", c.value)} className="sr-only" />
                  <Icon size={20} className={on ? "text-slate-900" : "text-slate-400"} />
                  <span>
                    <span className="block font-semibold">{c.title}</span>
                    <span className="block text-sm text-slate-600">{c.text}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl bg-amber-50 p-3">
            <input type="checkbox" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} className="mt-1 h-4 w-4 accent-slate-900" />
            <span>
              <span className="flex items-center gap-1 font-semibold"><Star size={15} className="text-amber-600" /> Featured</span>
              <span className="block text-sm text-slate-600">Big card on Home and Products (first 2 featured live products).</span>
            </span>
          </label>

          <div className="mt-4">
            <label htmlFor="sortOrder" className={label}>Position</label>
            <input id="sortOrder" inputMode="numeric" value={p.sortOrder} onChange={(e) => set("sortOrder", e.target.value.replace(/[^\d]/g, ""))} className={field} />
            <p className="mt-1 text-xs text-slate-500">Smaller numbers come first (0, 1, 2 …).</p>
            <Err msg={errors.sortOrder} />
          </div>
        </section>

        <section className={`${card} space-y-3 p-5`}>
          {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{formError}</p>}
          {saved && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">✓ {saved}</p>}
          <button type="submit" disabled={busy !== ""} className={`${btnPrimary} w-full`}>
            {busy === "save" && <Loader2 size={18} className="animate-spin" />}
            {isNew ? "Add product" : "Save changes"}
          </button>
          {!isNew && p.status !== "hidden" && (
            <a href={`/products/${initial?.slug}`} target="_blank" rel="noopener noreferrer" className={`${btnSecondary} w-full`}>View on website</a>
          )}
          <Link href="/admin/products" className="block text-center text-sm font-semibold text-slate-600 hover:underline">Back to products</Link>
        </section>

        {!isNew && (
          <section className={`${card} p-5`}>
            {confirmDelete ? (
              <div className="space-y-3">
                <p className="text-sm">Delete <strong>{p.name}</strong> for good? Orders already placed keep their details.</p>
                <div className="flex gap-2">
                  <button type="button" onClick={remove} disabled={busy !== ""} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-red-700 font-semibold text-white hover:bg-red-800 disabled:opacity-60">
                    {busy === "delete" && <Loader2 size={16} className="animate-spin" />} Delete
                  </button>
                  <button type="button" onClick={() => setConfirmDelete(false)} className="h-10 flex-1 rounded-xl border border-slate-300 font-semibold">Cancel</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:underline">
                <Trash2 size={16} /> Delete product
              </button>
            )}
          </section>
        )}
      </div>
    </form>
  );
}
