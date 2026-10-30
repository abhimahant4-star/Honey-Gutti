import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdmin } from "@/lib/session";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Doy & Joy Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** The admin panel has its own layout: no shop navbar or footer, a sidebar for the tabs instead. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdmin();
  if (!admin) {
    // login page
    return (
      <main id="main" className="min-h-screen bg-slate-100">
        {children}
      </main>
    );
  }
  return <AdminShell name={admin.name || "Admin"}>{children}</AdminShell>;
}
