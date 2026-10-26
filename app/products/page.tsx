import type { Metadata } from "next";
import { Shop } from "@/components/Shop";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop Ayurvedic products",
  description: "Shop Honey Ghutti and other Ayurvedic wellness products from Doy & Joy. Secure online payment and delivery across India.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold">All products</h1>
      <p className="mt-2 text-ink/75">{products.length} Ayurvedic products from Doy &amp; Joy.</p>
      <Shop products={products} />
    </div>
  );
}
