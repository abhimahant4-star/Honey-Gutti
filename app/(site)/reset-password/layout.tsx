import type { Metadata } from "next";

// no-referrer: the secret token in this page's address is never sent to other websites
export const metadata: Metadata = { title: "Choose a new password", robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
