import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { hmacHex, safeEqual } from "@/lib/razorpay";
import { Order } from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay calls this server-to-server, so orders are still marked paid
 * if the customer closes the tab before returning to the site.
 */
export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });

  const raw = await req.text(); // signature is computed on the raw body
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!sig || !safeEqual(hmacHex(secret, raw), sig)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    const evt = JSON.parse(raw);
    const pay = evt?.payload?.payment?.entity;
    const razorpayOrderId: string | undefined = pay?.order_id ?? evt?.payload?.order?.entity?.id;
    if (!razorpayOrderId) return NextResponse.json({ ok: true });

    await connectDB();
    if (evt.event === "payment.captured" || evt.event === "order.paid") {
      await Order.updateOne(
        { razorpayOrderId, status: { $ne: "paid" } },
        { $set: { status: "paid", razorpayPaymentId: pay?.id, paidAt: new Date() } }
      );
    } else if (evt.event === "payment.failed") {
      await Order.updateOne({ razorpayOrderId, status: "created" }, { $set: { status: "failed" } });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("webhook failed", e);
    return NextResponse.json({ error: "Webhook error." }, { status: 500 }); // Razorpay retries on non-2xx
  }
}
