import { inr } from "@/lib/format";
import { getCatalog } from "@/lib/catalog";
import { heroProduct } from "@/lib/products";
import { site } from "@/lib/site";
import { WhatsInside } from "./WhatsInside";

/**
 * The same "about the product" block at the bottom of Home, Products and Contact:
 * what's inside each product (one tab per product), how to use it, and how ordering works.
 */
export async function ProductHighlights({ showInside = true }: { showInside?: boolean }) {
  const { live } = await getCatalog();
  const listed = live.filter((p) => p.ingredients?.length);
  const withHerbs = listed.length ? listed : [heroProduct];
  return (
    <>
      {showInside && <WhatsInside products={withHerbs} />}

      <section aria-labelledby="ordering-title" className="mx-auto max-w-6xl px-4 py-16">
        <h2 id="ordering-title" className="font-display text-3xl font-bold sm:text-4xl">How ordering works</h2>
        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            ["Log in or sign up", "Create a free account in a minute. It saves your details and keeps all your orders in one place."],
            ["Fill your cart", "See every product, add what you need and enter where to deliver."],
            ["Pay securely online", `Pay with UPI, card or net banking. Delivery is free above ${inr(site.freeShippingAbove)}, otherwise ${inr(site.shippingFee)}.`],
          ].map(([t, d], i) => (
            <li key={t} className="rounded-2xl border border-ink/10 p-6">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-honey font-bold text-ink">{i + 1}</span>
              <h3 className="mt-4 font-display text-xl font-bold">{t}</h3>
              <p className="mt-1 text-ink/75">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
