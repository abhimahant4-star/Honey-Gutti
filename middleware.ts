import { NextRequest, NextResponse } from "next/server";

export const config = { matcher: ["/admin/:path*"] };

/** Password-protects /admin with HTTP Basic auth (ADMIN_USER / ADMIN_PASSWORD). */
export function middleware(req: NextRequest) {
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return new NextResponse("Admin is not configured.", { status: 503 });

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const [u, ...rest] = atob(header.slice(6)).split(":");
      if (u === user && rest.join(":") === pass) return NextResponse.next();
    } catch {}
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Doy & Joy admin"' },
  });
}
