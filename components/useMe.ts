"use client";

import { useEffect, useState } from "react";

export type Me = { name: string; email: string; phone: string } | null;

// One request per page load, shared by the header, cart and checkout.
// (Logging in or out always does a full page load, so this never goes stale.)
let pending: Promise<Me> | null = null;
let known: Me | undefined;

function loadMe(): Promise<Me> {
  pending ??= fetch("/api/auth/me", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { user: null }))
    .then((d) => (known = (d.user ?? null) as Me))
    .catch(() => (known = null));
  return pending;
}

/** Logged-in customer (or null). `undefined` while loading. Pages stay static; this runs in the browser. */
export function useMe(): Me | undefined {
  const [me, setMe] = useState<Me | undefined>(known);
  useEffect(() => {
    let alive = true;
    loadMe().then((m) => alive && setMe(m));
    return () => {
      alive = false;
    };
  }, []);
  return me;
}

/** Where guests go to log in before shopping; they come back to `next` afterwards. */
export const loginToShop = (next: string) => `/login?next=${encodeURIComponent(next)}&shop=1`;
