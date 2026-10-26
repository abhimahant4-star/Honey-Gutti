import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPolicy, policies } from "@/lib/policies";

export const dynamicParams = false;

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPolicy(params.slug);
  return p ? { title: p.title, description: p.description, alternates: { canonical: `/${p.slug}` } } : {};
}

export default function PolicyPage({ params }: { params: { slug: string } }) {
  const p = getPolicy(params.slug);
  if (!p) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{p.title}</h1>
      <p className="mt-1 text-sm text-ink/60">Last updated: 26 October 2026</p>
      {p.sections.map((s) => (
        <section key={s.h} className="mt-8">
          <h2 className="font-display text-xl font-bold">{s.h}</h2>
          {s.p.map((t) => (
            <p key={t} className="mt-2 text-lg leading-relaxed text-ink/85">{t}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
