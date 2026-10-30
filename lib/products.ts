export type Ingredient = { hi: string; latin: string; qty: string };

/**
 * live        = on sale, can be added to the cart
 * coming_soon = shown as a "Coming soon" card, can't be bought yet
 * hidden      = saved in the admin only, not shown on the website
 */
export type ProductStatus = "live" | "coming_soon" | "hidden";
export const PRODUCT_STATUSES: ProductStatus[] = ["live", "coming_soon", "hidden"];
export const statusLabel: Record<ProductStatus, string> = { live: "Live", coming_soon: "Coming soon", hidden: "Hidden" };

/** The shape every page and component uses (database products are turned into this). */
export type Product = {
  id?: string; // database id (missing for the built-in starter product)
  slug: string;
  name: string;
  hindiName?: string;
  tagline: string;
  description: string;
  price: number; // MRP in INR (inclusive of all taxes)
  size: string;
  images: string[]; // /images/... (in /public) or /api/blog-image/<id> (uploaded)
  badges: string[];
  ingredients?: Ingredient[];
  dosage?: string;
  status: ProductStatus;
  featured: boolean; // shown in the big showcase on Home and Products
  sortOrder: number; // smaller numbers come first
};

/** The small part of a product the cart needs in the browser. */
export type CartProduct = { slug: string; name: string; price: number; image?: string };

/**
 * Honey Ghutti, as printed on the pack. The website shows this until products are
 * added in Admin > Products (the "Import Honey Ghutti" button copies it there).
 */
export const starterProducts: Product[] = [
  {
    slug: "honey-ghutti-cough-remedy",
    name: "Honey Ghutti Cough Remedy",
    hindiName: "हनी घुट्टी",
    tagline: "हनी की घुट्टी, खांसी की छुट्टी",
    description:
      "A honey-based Ayurvedic syrup for all types of cough and respiratory disease, fortified with Tulsi, Mulethi and Banaphsa.",
    price: 120,
    size: "100 ml",
    images: ["/images/pack-english.jpg", "/images/pack-hindi.jpg", "/images/pack-info.jpg"],
    badges: ["Honey based", "Fast relief", "Non-drowsy formula"],
    ingredients: [
      { hi: "तुलसी", latin: "Ocimum sanctum", qty: "200 mg" },
      { hi: "वासा", latin: "Adhatoda vasica", qty: "200 mg" },
      { hi: "यष्टीमधु", latin: "Glycyrrhiza glabra", qty: "200 mg" },
      { hi: "सोंठ", latin: "Zingiber officinale", qty: "100 mg" },
      { hi: "कंटकारी", latin: "Solanum xanthocarpum", qty: "100 mg" },
      { hi: "त्रिकटु", latin: "Trikatu", qty: "50 mg" },
      { hi: "नवसार", latin: "Navsar", qty: "200 mg" },
      { hi: "सत पुदीना", latin: "Menthe piperita", qty: "6 mg" },
      { hi: "नीलगिरी", latin: "Eucalyptus globulus", qty: "0.006 ml" },
      { hi: "शहद", latin: "Honey base", qty: "q.s." },
    ],
    dosage: "2 to 3 TSF 3 times with hot water a day or as directed by the Physician.",
    status: "live",
    featured: true,
    sortOrder: 0,
  },
];

/** Honey Ghutti: the hero, highlights and blog sidebar always talk about it. */
export const heroProduct = starterProducts[0];

export const toCartProduct = (p: Product): CartProduct => ({ slug: p.slug, name: p.name, price: p.price, image: p.images[0] });
