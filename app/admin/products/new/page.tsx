import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { AdminPage, PageHeader } from "@/components/admin/ui";
import { PRODUCT_STATUSES, type ProductStatus } from "@/lib/products";
import { getAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Add product" };
export const dynamic = "force-dynamic";

export default async function NewProduct({ searchParams }: { searchParams: { status?: string } }) {
  if (!(await getAdmin())) redirect("/admin/login?next=/admin/products/new");
  const status = PRODUCT_STATUSES.includes(searchParams.status as ProductStatus) ? (searchParams.status as ProductStatus) : "live";
  return (
    <AdminPage>
      <PageHeader title="Add product" text="Fill in the details, add photos and choose how it shows on the website." />
      <ProductForm defaultStatus={status} />
    </AdminPage>
  );
}
