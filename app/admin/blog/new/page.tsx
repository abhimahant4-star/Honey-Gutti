import { redirect } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { getAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  if (!(await getAdmin())) redirect("/admin/login?next=/admin/blog/new");
  return <PostEditor />;
}
