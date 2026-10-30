import { NextResponse } from "next/server";
import { clearSessionCookie, getCustomer, getCustomerChecked } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Who is logged in (customer). Used by the header, cart and checkout. */
export async function GET() {
  let s: Awaited<ReturnType<typeof getCustomerChecked>>;
  try {
    s = await getCustomerChecked(); // also catches deleted accounts and logins older than a password reset
  } catch {
    s = await getCustomer(); // database unreachable: fall back to the signed cookie
  }
  const res = NextResponse.json(
    { user: s && s !== "stale" ? { name: s.name, email: s.email ?? "", phone: s.phone ?? "" } : null },
    { headers: { "Cache-Control": "no-store" } }
  );
  if (s === "stale") clearSessionCookie(res, "customer");
  return res;
}
