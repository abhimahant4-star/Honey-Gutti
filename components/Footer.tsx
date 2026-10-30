import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { policies } from "@/lib/policies";
import { site } from "@/lib/site";

const shopLinks = [
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/#about", label: "About us" },
  { href: "/account", label: "My account" },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:py-12 lg:grid-cols-[1.3fr_0.8fr_1fr_1.3fr] lg:gap-10">
        {/* Brand */}
        <div className="col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4">
            <span className="shrink-0 rounded-xl bg-white p-2">
              <Image src="/images/logo.png" alt="Doy & Joy Group of Company" width={64} height={70} className="h-16 w-auto" />
            </span>
            <div>
              <p className="font-display text-2xl font-bold leading-tight">Doy &amp; Joy</p>
              <p className="text-sm text-white/70">Group of Company</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-white/75">Ayurvedic wellness products, proudly made in India.</p>
          <p className="mt-3 text-sm text-white/60">GSTIN: {site.gstin}</p>
        </div>

        {/* Shop */}
        <nav aria-label="Shop">
          <h2 className="font-display text-lg font-bold text-honey">Shop</h2>
          <ul className="mt-3 space-y-2 text-white/85">
            {shopLinks.map((l) => (
              <li key={l.href}><Link href={l.href} className="hover:text-honey">{l.label}</Link></li>
            ))}
          </ul>
        </nav>

        {/* Policies */}
        <nav aria-label="Policies">
          <h2 className="font-display text-lg font-bold text-honey">Policies</h2>
          <ul className="mt-3 space-y-2 text-white/85">
            {policies.map((x) => (
              <li key={x.slug}><Link href={`/${x.slug}`} className="hover:text-honey">{x.title}</Link></li>
            ))}
          </ul>
        </nav>

        {/* Contact */}
        <div className="col-span-2 lg:col-span-1">
          <h2 className="font-display text-lg font-bold text-honey">Contact</h2>
          <ul className="mt-3 space-y-3 text-white/85">
            <li className="flex gap-3"><MapPin size={18} className="mt-1 shrink-0 text-honey" />{site.address}</li>
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="flex gap-3 hover:text-honey"><Phone size={18} className="mt-1 shrink-0 text-honey" />{site.phone}</a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="flex gap-3 break-all hover:text-honey"><Mail size={18} className="mt-1 shrink-0 text-honey" />{site.email}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15 px-4 py-4 text-center text-xs leading-relaxed text-white/60">
        <p>
          Ayurvedic proprietary medicine. Use as directed on the label or by your physician. Not a substitute for medical advice.
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} {site.legalName}. Mfg. Lic. No. HP-207-AY. Mfg &amp; Mktd by Kamdhenu Ayurvedic Pharmacy, Baddi (HP).
        </p>
      </div>
    </footer>
  );
}
