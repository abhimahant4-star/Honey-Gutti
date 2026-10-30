import { NextResponse } from "next/server";
import { adminDbError, guardAdmin } from "@/lib/admin-api";
import { connectDB } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { BlogImage } from "@/models/BlogImage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024; // photos are shrunk in the browser first, usually to 100–400 KB
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

/** Check the file really is the image type it claims (first bytes), not just its name. */
function sniff(b: Buffer): string | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  return null;
}

export async function POST(req: Request) {
  const blocked = await guardAdmin(req);
  if (blocked) return blocked;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob)) return jsonError("Choose a photo to upload.", 400);
  if (file.size > MAX_BYTES) return jsonError("This photo is too large (max 3 MB).", 413);
  const data = Buffer.from(await file.arrayBuffer());
  const type = sniff(data);
  if (!type || !TYPES.has(type)) return jsonError("Please upload a JPG, PNG or WebP photo.", 415);
  try {
    await connectDB();
    const img = await BlogImage.create({
      data,
      contentType: type,
      size: data.length,
      width: Number(form?.get("width")) || undefined,
      height: Number(form?.get("height")) || undefined,
    });
    return NextResponse.json({ ok: true, url: `/api/blog-image/${img._id}` }, { status: 201 });
  } catch (e) {
    return adminDbError(e, "upload");
  }
}
