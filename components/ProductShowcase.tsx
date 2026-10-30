import type { Product } from "@/lib/products";
import { MembersTeaser } from "./MembersTeaser";
import { ShowcaseCard } from "./ShowcaseCard";

/** Featured live products with a Buy button, plus the "log in to see the full range" panel. */
export function ProductShowcase({ live }: { live: Product[] }) {
  const featured = live.filter((p) => p.featured);
  const shown = (featured.length ? featured : live).slice(0, 2);
  return (
    <div className="grid gap-6">
      {shown.map((p) => (
        <ShowcaseCard key={p.slug} product={p} />
      ))}
      <MembersTeaser more={live.length - shown.length} />
    </div>
  );
}
