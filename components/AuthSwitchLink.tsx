"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { safeNext } from "@/lib/redirect";

/** "Create an account" / "Log in" link that keeps ?next= (and ?shop=), so the visitor still ends up where they were going. */
export function AuthSwitchLink({ to, children }: { to: "/login" | "/signup"; children: React.ReactNode }) {
  const [href, setHref] = useState<string>(to);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const out = new URLSearchParams();
    const next = q.get("next");
    if (next) out.set("next", safeNext(next, "/account"));
    if (q.has("shop")) out.set("shop", "1");
    const s = out.toString();
    setHref(s ? `${to}?${s}` : to);
  }, [to]);
  return (
    <Link href={href} className="font-semibold text-pack underline underline-offset-4">
      {children}
    </Link>
  );
}
