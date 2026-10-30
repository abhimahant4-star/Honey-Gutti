/**
 * The family tagline, written by Mrs. Kamlesh Arora.
 *  - "full":    the four lines with the credit (home page, product pages)
 *  - "compact": two short lines with the credit (product cards)
 *  - "hero":    on the yellow banner at the top of the home page
 */
const lines = ["जो पीवे सो", "राजी हो जावे", "जो खावे सो", "राजी हो जावे"];

export function MotherTagline({ variant = "full", className = "" }: { variant?: "full" | "compact" | "hero"; className?: string }) {
  if (variant === "hero") {
    return (
      <figure className={`border-l-4 border-pack pl-4 ${className}`}>
        <blockquote lang="hi" className="font-display text-xl font-bold leading-snug text-pack sm:text-2xl">
          <p>जो पीवे सो राजी हो जावे,</p>
          <p>जो खावे सो राजी हो जावे</p>
        </blockquote>
        <figcaption className="mt-1 text-sm font-medium text-ink/80">
          Written by our loving mother, <span className="font-bold text-ink">Mrs. Kamlesh Arora</span>
        </figcaption>
      </figure>
    );
  }
  if (variant === "compact") {
    return (
      <figure className={`rounded-xl bg-honey-mist px-3 py-2 ${className}`}>
        <blockquote lang="hi" className="font-display text-sm font-bold leading-snug text-pack">
          <p>जो पीवे सो राजी हो जावे,</p>
          <p>जो खावे सो राजी हो जावे</p>
        </blockquote>
        <figcaption className="mt-0.5 text-xs text-ink/65">— Mrs. Kamlesh Arora</figcaption>
      </figure>
    );
  }
  return (
    <figure className={`rounded-2xl border border-honey/60 bg-honey-mist p-5 sm:p-6 ${className}`}>
      <blockquote lang="hi" className="font-display text-2xl font-bold leading-tight text-pack sm:text-3xl">
        {lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </blockquote>
      <figcaption className="mt-3 text-ink/75">
        Written by our loving mother, <span className="font-semibold text-ink">Mrs. Kamlesh Arora</span>
      </figcaption>
    </figure>
  );
}
