export type Ingredient = { hi: string; latin: string; qty: string };

export type Product = {
  slug: string;
  name: string;
  hindiName?: string;
  tagline: string;
  description: string;
  price: number; // MRP in INR (inclusive of all taxes)
  size: string;
  images: string[]; // paths under /public
  badges: string[];
  ingredients?: Ingredient[];
  dosage?: string;
  /** true = dummy entry. Replace with real details, then delete this flag. */
  placeholder?: boolean;
};

/* ------------------------------------------------------------------
 * EDIT THIS FILE to change products. Only Honey Ghutti has real data
 * (taken from the pack). The other four are placeholders.
 * ------------------------------------------------------------------ */
export const products: Product[] = [
  {
    slug: "honey-ghutti-cough-remedy",
    name: "Honey Ghutti Cough Remedy",
    hindiName: "हनी घुट्टी",
    tagline: "हनी की घुट्टी, खांसी की छुट्टी",
    description:
      "A honey-based Ayurvedic syrup for all types of cough and respiratory disease, fortified with Tulsi, Mulethi and Banaphsa.",
    price: 120, // TODO: confirm MRP
    size: "100 ml", // TODO: confirm bottle size
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
  },
  ...[2, 3, 4, 5].map<Product>((n) => ({
    slug: `product-${n}`,
    name: `Product ${n} (add name)`,
    tagline: "Details coming soon",
    description: "Replace this placeholder with the real product description.",
    price: 150,
    size: "100 ml",
    images: [],
    badges: ["Ayurvedic"],
    placeholder: true,
  })),
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
