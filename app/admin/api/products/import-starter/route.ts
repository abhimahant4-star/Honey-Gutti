import { NextResponse } from "next/server";
import { adminDbError, guardAdmin } from "@/lib/admin-api";
import { refreshCatalog } from "@/lib/catalog";
import { connectDB } from "@/lib/db";
import { starterProducts } from "@/lib/products";
import { Product } from "@/models/Product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Copies Honey Ghutti into the database so it can be edited (skips it if it's already there). */
export async function POST(req: Request) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  try {
    await connectDB();
    let added = 0;
    for (const p of starterProducts) {
      if (await Product.exists({ slug: p.slug })) continue;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...doc } = p;
      await Product.create(doc);
      added++;
    }
    refreshCatalog();
    return NextResponse.json({ ok: true, added });
  } catch (e) {
    return adminDbError(e, "import starter products");
  }
}
