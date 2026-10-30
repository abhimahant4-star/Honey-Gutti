import { Leaf } from "lucide-react";
import type { Ingredient } from "@/lib/products";

/**
 * The herbs of a product as printed on the pack, as a compact grid of tiles.
 * Shows the Hindi name on top when the pack has one.
 */
export function IngredientList({ items, className = "", cols = "grid-cols-2 sm:grid-cols-3" }: { items: Ingredient[]; className?: string; cols?: string }) {
  return (
    <ul className={`grid gap-2 ${cols} ${className}`}>
      {items.map((i, idx) => (
        <li key={`${i.latin}-${idx}`} className="flex items-center gap-2.5 rounded-xl border border-ink/10 bg-white px-3 py-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf-dark">
            <Leaf size={15} />
          </span>
          <span className="min-w-0 leading-tight">
            {i.hi ? (
              <>
                <span lang="hi" className="block truncate font-semibold text-ink">{i.hi}</span>
                <span className="block truncate text-xs text-ink/65">{i.latin}</span>
              </>
            ) : (
              <span className="block truncate font-semibold text-ink">{i.latin}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export const insideTitle = (name: string) => `What's in ${name}`;
export const insideText = "The Ayurvedic herbs inside, as printed on the pack.";
