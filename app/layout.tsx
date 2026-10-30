import type { Metadata, Viewport } from "next";
import { Baloo_2, Hind } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const display = Baloo_2({ subsets: ["latin", "devanagari"], weight: ["600", "700", "800"], variable: "--font-display", display: "optional" });
const body = Hind({ subsets: ["latin", "devanagari"], weight: ["400", "500", "600", "700"], variable: "--font-body", display: "optional" });

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
        {children}
      </body>
    </html>
  );
}
