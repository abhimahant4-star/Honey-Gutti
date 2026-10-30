import { NextResponse } from "next/server";
import { adminDbError, guardAdmin } from "@/lib/admin-api";
import { refreshCatalog } from "@/lib/catalog";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { deleteImageIfUnused, isDuplicateKey } from "@/lib/post-save";
import { toProductDoc, validId } from "@/lib/product-save";
import { fieldErrors, productPatchSchema, productSchema } from "@/lib/validation";
import { Product } from "@/models/Product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

/** Save the whole product (edit form). */
export async function PUT(req: Request, { params }: Ctx) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  if (!validId(params.id)) return jsonError("Product not found.", 404);
  const parsed = productSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please check the highlighted fields.", 400, { fields: fieldErrors(parsed.error.issues) });
  try {
    await connectDB();
    const old = (await Product.findById(params.id).select("images").lean()) as { images?: string[] } | null;
    if (!old) return jsonError("This product no longer exists.", 404);
    const { set, unset } = toProductDoc(parsed.data);
    await Product.updateOne({ _id: params.id }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) }, { runValidators: true });
    for (const img of old.images ?? []) if (!set.images.includes(img)) await deleteImageIfUnused(img);
    refreshCatalog();
    return NextResponse.json({ ok: true, id: params.id });
  } catch (e) {
    if (isDuplicateKey(e)) return jsonError("Another product already uses this web address.", 409, { fields: { slug: "Already used by another product. Change it slightly." } });
    return adminDbError(e, "update product");
  }
}

/** Quick change from the list: status, featured or order. */
export async function PATCH(req: Request, { params }: Ctx) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  if (!validId(params.id)) return jsonError("Product not found.", 404);
  const parsed = productPatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Invalid change.", 400);
  try {
    await connectDB();
    const res = await Product.updateOne({ _id: params.id }, { $set: parsed.data }, { runValidators: true });
    if (!res.matchedCount) return jsonError("This product no longer exists.", 404);
    refreshCatalog();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminDbError(e, "change product");
  }
}

/** Delete a product (and its uploaded photos, unless something else uses them). */
export async function DELETE(req: Request, { params }: Ctx) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  if (!validId(params.id)) return jsonError("Product not found.", 404);
  try {
    await connectDB();
    const old = (await Product.findByIdAndDelete(params.id).lean()) as { images?: string[] } | null;
    if (!old) return jsonError("This product no longer exists.", 404);
    for (const img of old.images ?? []) await deleteImageIfUnused(img);
    refreshCatalog();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminDbError(e, "delete product");
  }
}
