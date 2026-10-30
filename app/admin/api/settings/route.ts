import { NextResponse } from "next/server";
import { adminDbError, guardAdmin } from "@/lib/admin-api";
import { refreshCatalog } from "@/lib/catalog";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { fieldErrors, settingsSchema } from "@/lib/validation";
import { Setting } from "@/models/Setting";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Save shop settings (one "store" document, created the first time). */
export async function PUT(req: Request) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  const parsed = settingsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return jsonError("Please check the highlighted fields.", 400, { fields: fieldErrors(parsed.error.issues) });
  try {
    await connectDB();
    await Setting.updateOne({ key: "store" }, { $set: parsed.data }, { upsert: true, runValidators: true });
    refreshCatalog();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminDbError(e, "save settings");
  }
}
