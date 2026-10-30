import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, CUSTOMER_COOKIE, verifySession } from "@/lib/auth";
import { safeNext } from "@/lib/redirect";

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin",
    "/account/:path*",
    "/account",
    "/products/:path*",
    "/cart",
    "/checkout",
    "/checkout/:path*",
    "/login",
    "/signup",
  ],
};

/** Shopping pages: guests see the landing page only, and must log in to browse all products, use the cart and buy. */
const SHOP = ["/products", "/cart", "/checkout"];
const isShop = (p: string) => SHOP.some((s) => p === s || p.startsWith(`${s}/`));

/**
 * Authorization gate:
 *  - /admin/*                 needs a valid ADMIN session (customers are sent to /admin/login)
 *  - /account/*               needs a valid CUSTOMER session
 *  - /products                public (showcase for guests, full shop when logged in)
 *  - /products/*, /cart, /checkout needs a valid CUSTOMER session (guests go to /login, then come back)
 *  - /login, /signup          skip straight to where the visitor was going if already logged in
 * Pages and APIs also re-check the session on the server, so this is not the only lock.
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const to = (path: string) => NextResponse.redirect(new URL(path, req.url));

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const admin = await verifySession(req.cookies.get(ADMIN_COOKIE)?.value, "admin");
    if (pathname === "/admin/login") return admin ? to("/admin") : noStore(NextResponse.next());
    if (!admin && pathname.startsWith("/admin/api/")) {
      return NextResponse.json({ error: "Please log in as admin again." }, { status: 401 });
    }
    if (!admin) return to(`/admin/login?next=${encodeURIComponent(pathname + search)}`);
    return noStore(NextResponse.next());
  }

  const customer = await verifySession(req.cookies.get(CUSTOMER_COOKIE)?.value, "customer");

  if (pathname === "/login" || pathname === "/signup") {
    return customer ? to(safeNext(req.nextUrl.searchParams.get("next"), "/account")) : NextResponse.next();
  }

  // /products itself is public: guests see a showcase there, logged-in customers the full shop
  if (pathname === "/products") return noStore(NextResponse.next());

  // /account, /products/<product>, /cart, /checkout
  if (!customer) {
    const shop = isShop(pathname) ? "&shop=1" : "";
    return to(`/login?next=${encodeURIComponent(pathname + search)}${shop}`);
  }
  return noStore(NextResponse.next());
}

function noStore(res: NextResponse) {
  res.headers.set("Cache-Control", "no-store");
  return res;
}
