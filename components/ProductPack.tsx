import Image from "next/image";
import type { Product } from "@/lib/products";

/** Shows the pack artwork, or a branded stand-in when no image exists yet. */
export function ProductPack({
  product,
  src,
  priority = false,
  sizes = "(min-width:1024px) 25vw, 50vw",
}: {
  product: Product;
  src?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const img = src ?? product.images[0];
  if (!img) {
    return (
      <div
        role="img"
        aria-label={`${product.name} (image coming soon)`}
        className="flex aspect-[2/5] h-full max-h-full flex-col items-center justify-between rounded-sm bg-gradient-to-b from-pack to-ink p-4 text-center text-white shadow-pack"
      >
        <span className="text-[10px] opacity-80">Doy &amp; Joy</span>
        <span className="font-display text-xl font-bold leading-tight">{product.name.replace(" (add name)", "")}</span>
        <span className="rounded bg-honey px-2 py-1 text-xs font-semibold text-ink">Image coming soon</span>
      </div>
    );
  }
  return (
    <Image
      src={img}
      alt={`${product.name} pack`}
      width={376}
      height={920}
      sizes={sizes}
      priority={priority}
      className="h-full w-auto rounded-sm object-contain shadow-pack"
    />
  );
}
