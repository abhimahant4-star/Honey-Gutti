import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hmacHex, safeEqual } from "@/lib/razorpay";
import { verifySchema } from "@/lib/validation";
import { Order } from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Called by the browser right after Razorpay reports success. The signature proves the payment is real. */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Payments are not set up yet." }, { status: 500 });

  const parsed = verifySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { publicId, razorpay_order_id: oid, razorpay_payment_id: pid, razorpay_signature: sig } = parsed.data;

  if (!safeEqual(hmacHex(secret, `${oid}|${pid}`), sig)) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  try {
    await connectDB();
    const exists = await Order.exists({ publicId, razorpayOrderId: oid });
    if (!exists) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    await Order.updateOne(
      { publicId, razorpayOrderId: oid, status: { $ne: "paid" } },
      { $set: { status: "paid", razorpayPaymentId: pid, paidAt: new Date() } }
    );
    return NextResponse.json({ ok: true, publicId });
  } catch (e) {
    console.error("verify failed", e);
    return NextResponse.json({ error: "Could not confirm the order." }, { status: 500 });
  }
}
