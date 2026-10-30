import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { ProductHighlights } from "@/components/ProductHighlights";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Call, email or message Doy & Joy about Honey Ghutti, your order or anything else. We reply within one working day.",
  alternates: { canonical: "/contact" },
};

const tel = `tel:${site.phone.replace(/\s/g, "")}`;

export default function ContactPage() {
  const cards = [
    { icon: Phone, title: "Call us", text: site.phone, href: tel },
    { icon: Mail, title: "Email us", text: site.email, href: `mailto:${site.email}` },
    { icon: MapPin, title: "Visit us", text: site.address },
  ];

  return (
    <>
      <section className="bg-honey">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <p className="inline-block rounded-full bg-pack px-4 py-1 text-sm font-semibold text-white">We&apos;re here to help</p>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-pack sm:text-5xl">Contact us</h1>
          <p className="mt-3 max-w-xl text-lg font-medium text-ink">
            Questions about Honey Ghutti, your order or delivery? Call, email or send us a message below.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] [&>*]:min-w-0">
        <ul className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {cards.map(({ icon: Icon, title, text, href }) => (
            <li key={title} className="flex gap-4 rounded-2xl border border-ink/10 p-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-leaf-soft text-leaf-dark">
                <Icon size={22} />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold">{title}</h2>
                {href ? (
                  <a href={href} className="break-words text-ink/80 underline-offset-4 hover:text-pack hover:underline">{text}</a>
                ) : (
                  <p className="text-ink/80">{text}</p>
                )}
              </div>
            </li>
          ))}
        </ul>

        <section aria-labelledby="msg-title" className="relative rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
          <h2 id="msg-title" className="font-display text-2xl font-bold">Send us a message</h2>
          <p className="mb-6 mt-1 text-ink/70">We usually reply within one working day.</p>
          <ContactForm />
        </section>
      </div>

      <ProductHighlights />
    </>
  );
}
