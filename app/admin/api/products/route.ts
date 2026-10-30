import { NextResponse } from "next/server";
import { adminDbError, guardAdmin } from "@/lib/admin-api";
import { refreshCatalog } from "@/lib/catalog";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { isDuplicateKey } from "@/lib/post-save";
import { toProductDoc } from "@/lib/product-save";
import { fieldErrors, productSchema } from "@/lib/validation";
import { Product } from "@/models/Product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Add a product. */
export async function POST(req: Request) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please check the highlighted fields.", 400, { fields: fieldErrors(parsed.error.issues) });
  try {
    await connectDB();
    const doc = await Product.create(toProductDoc(parsed.data).set);
    refreshCatalog();
    return NextResponse.json({ ok: true, id: String(doc._id) }, { status: 201 });
  } catch (e) {
    if (isDuplicateKey(e)) return jsonError("Another product already uses this web address.", 409, { fields: { slug: "Already used by another product. Change it slightly." } });
    return adminDbError(e, "create product");
  }
}
