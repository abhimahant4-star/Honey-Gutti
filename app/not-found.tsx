import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/SiteShell";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-bold">Page not found</h1>
        <p className="mt-2 text-ink/75">The page you are looking for does not exist.</p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-honey px-7 py-3 font-bold text-ink">Go to shop</Link>
      </div>
    </SiteShell>
  );
}
