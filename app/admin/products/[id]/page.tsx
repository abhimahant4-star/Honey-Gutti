import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DatabaseNotice } from "@/components/DatabaseNotice";
import { ProductForm, type FormProduct } from "@/components/admin/ProductForm";
import { AdminPage, PageHeader, StatusBadge } from "@/components/admin/ui";
import { toProduct } from "@/lib/catalog";
import { connectDB, isDbConfigured } from "@/lib/db";
import { validId } from "@/lib/product-save";
import { getAdmin } from "@/lib/session";
import { Product as ProductModel, type ProductLean } from "@/models/Product";

export const metadata: Metadata = { title: "Edit product" };
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function EditProduct({ params }: { params: { id: string } }) {
  if (!(await getAdmin())) redirect(`/admin/login?next=/admin/products/${encodeURIComponent(params.id)}`);
  if (!validId(params.id)) notFound();
  if (!isDbConfigured()) return <DatabaseNotice reason="not-configured" />;
  let row: ProductLean | null;
  try {
    await connectDB();
    row = (await ProductModel.findById(params.id).lean()) as unknown as ProductLean | null;
  } catch (e) {
    console.error("admin product: database error", e);
    return <DatabaseNotice reason="unreachable" />;
  }
  if (!row) notFound();
  const p = toProduct(row);
  const initial: FormProduct = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    hindiName: p.hindiName ?? "",
    tagline: p.tagline,
    description: p.description,
    price: String(p.price),
    size: p.size,
    images: p.images,
    badges: p.badges,
    ingredients: p.ingredients ?? [],
    dosage: p.dosage ?? "",
    status: p.status,
    featured: p.featured,
    sortOrder: String(p.sortOrder),
  };
  return (
    <AdminPage>
      <PageHeader title={p.name}>
        <StatusBadge status={p.status} />
      </PageHeader>
      <ProductForm initial={initial} />
    </AdminPage>
  );
}
