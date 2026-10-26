import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { asciiSafe, formatAmount, newTxnId, payuConfig, requestHash, siteUrl } from "@/lib/payu";
import { priceCart } from "@/lib/pricing";
import { checkoutSchema } from "@/lib/validation";
import { Order, orderNumber } from "@/models/Order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const fail = (error: string, status = 400, fields?: unknown) => NextResponse.json({ error, fields }, { status });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request.");
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    // { name: ["Enter your full name."], email: [...] } — shown under each input on /checkout
    const fields: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[issue.path.length - 1] ?? "form");
      (fields[k] ??= []).push(issue.message);
    }
    return fail("Please check your details.", 400, fields);
  }

  const priced = priceCart(parsed.data.items); // server-side prices only
  if (!priced.ok) return fail(priced.error);

  let cfg: ReturnType<typeof payuConfig>;
  try {
    cfg = payuConfig();
  } catch (e) {
    console.error(e);
    return fail("Payments are not set up yet.", 500);
  }

  try {
    await connectDB();
    const publicId = randomUUID();
    const txnid = newTxnId();
    const { customer } = parsed.data;

    await Order.create({
      publicId,
      status: "created",
      items: priced.lines,
      customer,
      subtotal: priced.subtotal,
      shipping: priced.shipping,
      total: priced.total,
      txnid,
    });

    const amount = formatAmount(priced.total);
    const productinfo = `Doy and Joy order ${orderNumber(publicId)}`;
    const firstname = asciiSafe(customer.name, 60, "Customer");
    const email = customer.email;
    const callback = `${siteUrl()}/api/payu/callback`;

    const form: Record<string, string> = {
      key: cfg.key,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone: customer.phone,
      surl: callback,
      furl: callback,
      hash: requestHash({ key: cfg.key, txnid, amount, productinfo, firstname, email }, cfg.salt),
    };

    return NextResponse.json({ publicId, action: cfg.paymentUrl, form });
  } catch (e) {
    console.error("create-order failed", e);
    return fail("Could not start the payment. Please try again.", 500);
  }
}
