import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { Product as ProductModel, type ProductLean } from "@/models/Product";
import { DEFAULT_SETTINGS, Setting, type StoreSettings } from "@/models/Setting";
import { connectDB, isDbConfigured } from "./db";
import { starterProducts, type Product } from "./products";

/** Turns a database row into the plain object pages use (safe to pass to the browser). */
export function toProduct(d: ProductLean): Product {
  return {
    id: String(d._id),
    slug: d.slug,
    name: d.name,
    hindiName: d.hindiName || undefined,
    tagline: d.tagline,
    description: d.description,
    price: d.price,
    size: d.size,
    images: d.images ?? [],
    badges: d.badges ?? [],
    ingredients: d.ingredients?.length ? d.ingredients.map(({ hi, latin, qty }) => ({ hi: hi ?? "", latin, qty: qty ?? "" })) : undefined,
    dosage: d.dosage || undefined,
    status: d.status,
    featured: !!d.featured,
    sortOrder: d.sortOrder ?? 0,
  };
}

export async function readSettings(): Promise<StoreSettings> {
  const s = (await Setting.findOne({ key: "store" }).lean()) as Partial<StoreSettings> | null;
  return {
    comingSoonLimit: s?.comingSoonLimit ?? DEFAULT_SETTINGS.comingSoonLimit,
    comingSoonTitle: s?.comingSoonTitle || DEFAULT_SETTINGS.comingSoonTitle,
  };
}

type Loaded = { products: Product[]; settings: StoreSettings; empty: boolean };

// Cached for 5 minutes, and cleared at once whenever the admin saves (refreshCatalog).
// Errors are thrown (not cached), so a short database outage doesn't stick.
const loadCatalog = unstable_cache(
  async (): Promise<Loaded> => {
    await connectDB();
    const [rows, total, settings] = await Promise.all([
      ProductModel.find({ status: { $in: ["live", "coming_soon"] } })
        .sort({ sortOrder: 1, createdAt: -1 })
        .limit(200)
        .lean(),
      ProductModel.estimatedDocumentCount(),
      readSettings(),
    ]);
    return { products: (rows as unknown as ProductLean[]).map(toProduct), settings, empty: total === 0 };
  },
  ["catalog-v1"],
  { tags: ["catalog"], revalidate: 300 }
);

export type Catalog = {
  live: Product[]; // can be bought
  comingSoon: Product[]; // every "Coming soon" product
  comingSoonShown: Product[]; // the ones the website shows (limited in Admin > Settings)
  settings: StoreSettings;
};

/** Public catalog. Never throws: without a database, the website shows Honey Ghutti only. */
export async function getCatalog(): Promise<Catalog> {
  let products = starterProducts;
  let settings = DEFAULT_SETTINGS;
  if (isDbConfigured()) {
    try {
      const c = await loadCatalog();
      settings = c.settings;
      if (!c.empty) products = c.products; // nothing added in the admin yet: keep the starter product
    } catch (e) {
      console.error("catalog: could not load products", e);
    }
  }
  const live = products.filter((p) => p.status === "live");
  const comingSoon = products.filter((p) => p.status === "coming_soon");
  return { live, comingSoon, comingSoonShown: comingSoon.slice(0, settings.comingSoonLimit), settings };
}

/** A product page: live or coming soon. Hidden products don't exist for visitors. */
export async function getPublicProduct(slug: string): Promise<Product | undefined> {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return undefined;
  const c = await getCatalog();
  return [...c.live, ...c.comingSoon].find((p) => p.slug === slug);
}

/**
 * Checkout prices: read fresh from the database (never from the cache or the browser).
 * Returns only the products asked for.
 */
export async function findProductsForCheckout(slugs: string[]): Promise<Product[]> {
  await connectDB();
  if ((await ProductModel.estimatedDocumentCount()) === 0) return starterProducts.filter((p) => slugs.includes(p.slug));
  const rows = (await ProductModel.find({ slug: { $in: slugs } }).lean()) as unknown as ProductLean[];
  return rows.map(toProduct);
}

/** Call after the admin changes products or settings: every page shows the new data. */
export function refreshCatalog() {
  revalidateTag("catalog");
  revalidatePath("/", "layout");
}
