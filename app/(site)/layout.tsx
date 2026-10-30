import { JsonLd } from "@/components/JsonLd";
import { SiteShell } from "@/components/SiteShell";
import { site } from "@/lib/site";

/** The public website: navbar, footer and cart around every page (the admin has its own layout). */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${site.url}/#org`,
              name: site.name,
              legalName: site.legalName,
              url: site.url,
              logo: `${site.url}/images/logo.png`,
              slogan: "Because real needs need real solutions.",
              foundingDate: "2024",
              founder: [
                { "@type": "Person", name: "Naveen Kumar Arora" },
                { "@type": "Person", name: "Dr. Anjusha Sharma" },
              ],
              address: {
                "@type": "PostalAddress",
                streetAddress: "Flat 405, E-2 Tower, Savitry Greens 1 Society, VIP Road",
                addressLocality: "Zirakpur",
                addressRegion: "Punjab",
                postalCode: "140603",
                addressCountry: "IN",
              },
              contactPoint: { "@type": "ContactPoint", telephone: site.phone, email: site.email, contactType: "customer support", areaServed: "IN", availableLanguage: ["en", "hi"] },
            },
            { "@type": "WebSite", "@id": `${site.url}/#website`, url: site.url, name: site.name, inLanguage: "en-IN", publisher: { "@id": `${site.url}/#org` } },
          ],
        }}
      />
      <SiteShell>{children}</SiteShell>
    </>
  );
}
