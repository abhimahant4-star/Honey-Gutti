import type { Metadata, Viewport } from "next";
import { Baloo_2, Hind } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/site";

const display = Baloo_2({ subsets: ["latin", "devanagari"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });
const body = Hind({ subsets: ["latin", "devanagari"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "swap" });

const title = "Honey Ghutti Cough Remedy | Doy & Joy Ayurvedic Cough Syrup";
const description =
  "Buy Honey Ghutti, a honey-based Ayurvedic cough syrup with Tulsi, Mulethi and Banaphsa. Non-drowsy formula. Pay online with UPI or card and get it delivered across India.";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s | Doy & Joy" },
  description,
  applicationName: site.name,
  keywords: ["Honey Ghutti", "Ayurvedic cough syrup", "honey cough syrup", "non drowsy cough syrup", "Tulsi Mulethi syrup", "Doy & Joy", "हनी घुट्टी"],
  openGraph: { type: "website", siteName: site.name, locale: "en_IN", title, description },
  twitter: { card: "summary_large_image", title, description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#FFC20E" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-[60] focus:rounded focus:bg-white focus:px-3 focus:py-2">
          Skip to content
        </a>
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
        <CartProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
