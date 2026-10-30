import type { Metadata } from "next";
import { ProductHighlights } from "@/components/ProductHighlights";
import { ProductShowcase } from "@/components/ProductShowcase";
import { Shop } from "@/components/Shop";
import { ComingSoonSection } from "@/components/ComingSoonSection";
import { getCatalog } from "@/lib/catalog";
import { getCustomer } from "@/lib/session";

export const metadata: Metadata = {
  title: "Products",
  description: "Honey Ghutti and other Ayurvedic wellness products from Doy & Joy. Secure online payment and delivery across India.",
  alternates: { canonical: "/products" },
};

export const dynamic = "force-dynamic"; // guests and logged-in customers see different versions

/** Guests: the showcase and a sign-up invite. Logged-in customers: every product, search, sort and add to cart. */
export default async function ProductsPage() {
  const [me, catalog] = await Promise.all([getCustomer(), getCatalog()]);
  const { live } = catalog;
  return (
    <>
      <section className="bg-honey">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <p className="inline-block rounded-full bg-pack px-4 py-1 text-sm font-semibold text-white">Honey based · Ayurvedic</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-pack sm:text-5xl">Products</h1>
          <p className="mt-3 max-w-xl text-lg font-medium text-ink">
            {me
              ? `${live.length} Ayurvedic product${live.length === 1 ? "" : "s"} from Doy & Joy. Add what you need to your cart and pay securely online.`
              : "Ayurvedic remedies made on a pure honey base. Log in or create a free account to see the full range and order."}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {me ? <Shop products={live} /> : <ProductShowcase live={live} />}
        <ComingSoonSection catalog={catalog} className="mt-14" />
      </div>

      <ProductHighlights />
    </>
  );
}
