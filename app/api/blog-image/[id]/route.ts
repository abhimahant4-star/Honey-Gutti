import { connectDB, isDbConfigured } from "@/lib/db";
import { BlogImage } from "@/models/BlogImage";

export const runtime = "nodejs";

/** Serves blog photos. Each upload gets a new id, so browsers may cache them forever. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!/^[a-f0-9]{24}$/.test(params.id) || !isDbConfigured()) return new Response("Not found", { status: 404 });
  try {
    await connectDB();
    const img = await BlogImage.findById(params.id); // not .lean(): keeps `data` as a Buffer
    if (!img) return new Response("Not found", { status: 404 });
    const bytes = Buffer.from(img.data as Buffer);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": img.contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch {
    return new Response("Not available", { status: 503 });
  }
}
