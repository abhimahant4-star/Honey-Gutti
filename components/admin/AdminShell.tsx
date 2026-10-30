"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Clock, ExternalLink, LayoutDashboard, Menu, Newspaper, Package, ReceiptText, ShieldCheck, X } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

const tabs = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/coming-soon", label: "Coming soon", icon: Clock },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/blog", label: "Blog", icon: Newspaper },
];

export function AdminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (t: (typeof tabs)[number]) => (t.exact ? path === t.href : path === t.href || path.startsWith(`${t.href}/`));
  const current = tabs.find(active);

  useEffect(() => setOpen(false), [path]); // close the phone menu after choosing a tab

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <span className="rounded-lg bg-white p-1">
          <Image src="/images/logo.png" alt="" width={32} height={35} className="h-8 w-auto" />
        </span>
        <div className="leading-tight">
          <p className="font-display text-lg font-bold text-white">Doy &amp; Joy</p>
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-honey">
            <ShieldCheck size={12} /> Admin panel
          </p>
        </div>
      </div>

      <nav aria-label="Admin" className="flex-1 space-y-1 px-3 py-2">
        {tabs.map((t) => {
          const on = active(t);
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={on ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition ${
                on ? "bg-honey text-slate-900" : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={19} /> {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-white/10 p-4">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white">
          <ExternalLink size={16} /> View website
        </a>
        <p className="truncate text-sm text-slate-400">Signed in as {name}</p>
        <LogoutButton endpoint="/api/auth/admin-logout" redirectTo="/admin/login" className="w-full justify-center border-white/20 text-white hover:bg-white hover:text-slate-900" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-slate-900 lg:block">{sidebar}</aside>

      {/* phone top bar + slide-out sidebar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between bg-slate-900 px-4 text-white lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open admin menu" aria-expanded={open} className="grid h-10 w-10 place-items-center rounded-lg hover:bg-white/10">
          <Menu size={22} />
        </button>
        <p className="font-semibold">{current?.label ?? "Admin"}</p>
        <span className="w-10" />
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <button className="absolute inset-0 bg-slate-900/60" aria-label="Close admin menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-fade-in bg-slate-900">
            <button onClick={() => setOpen(false)} aria-label="Close admin menu" className="absolute right-3 top-4 grid h-9 w-9 place-items-center rounded-lg text-white hover:bg-white/10">
              <X size={20} />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <main id="main" className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}
