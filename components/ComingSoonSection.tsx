import type { Catalog } from "@/lib/catalog";
import { ProductCard } from "./ProductCard";

/** "Coming soon" cards. How many show, and the heading, are set in Admin > Coming soon. */
export function ComingSoonSection({ catalog, className = "" }: { catalog: Catalog; className?: string }) {
  const list = catalog.comingSoonShown;
  if (list.length === 0) return null;
  return (
    <section aria-labelledby="coming-soon-title" className={className}>
      <h2 id="coming-soon-title" className="font-display text-3xl font-bold sm:text-4xl">{catalog.settings.comingSoonTitle}</h2>
      <p className="mt-2 max-w-2xl text-ink/75">New Ayurvedic products on their way. Check back soon.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
