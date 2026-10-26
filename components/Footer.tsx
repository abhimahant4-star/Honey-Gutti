import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { policies } from "@/lib/policies";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer id="contact" className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-white p-1.5">
              <Image src="/images/logo.png" alt="Doy & Joy" width={44} height={48} className="h-11 w-auto" />
            </span>
            <span className="font-display text-2xl font-bold">Doy &amp; Joy</span>
          </div>
          <p className="mt-4 max-w-xs text-white/75">Ayurvedic wellness products, proudly made in India.</p>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-honey">Contact</h3>
          <ul className="mt-3 space-y-3 text-white/85">
            <li className="flex gap-3"><MapPin size={18} className="mt-1 shrink-0" />{site.address}</li>
            <li className="flex gap-3"><Phone size={18} className="mt-1 shrink-0" />{site.phone}</li>
            <li className="flex gap-3"><Mail size={18} className="mt-1 shrink-0" />{site.email}</li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg font-bold text-honey">Shop</h3>
          <ul className="mt-3 space-y-2 text-white/85">
            <li><Link href="/products" className="hover:text-honey">All products</Link></li>
          </ul>
          <h3 className="mt-6 font-display text-lg font-bold text-honey">Policies</h3>
          <ul className="mt-3 space-y-2 text-white/85">
            {policies.map((x) => (
              <li key={x.slug}><Link href={`/${x.slug}`} className="hover:text-honey">{x.title}</Link></li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-white/60">GSTIN: {site.gstin}</p>
        </div>
      </div>

      <div className="border-t border-white/15 px-4 py-5 text-center text-xs text-white/60">
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
