import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { connectDB, isDbConfigured } from "@/lib/db";
import { asciiSafe, formatAmount, newTxnId, payuConfig, requestHash, siteUrl } from "@/lib/payu";
import { priceCart } from "@/lib/pricing";
import { getCustomer, getCustomerChecked } from "@/lib/session";
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

  // no login cookie at all: ask to log in before anything else
  if (!(await getCustomer())) {
    return NextResponse.json(
      { error: "Please log in to place your order.", loginUrl: "/login?next=/checkout&shop=1" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }
  if (!isDbConfigured()) return fail("Online ordering is not available yet. Please try again soon.", 503);

  // Buying needs an account: only a valid, current customer login may place an order.
  let account: Awaited<ReturnType<typeof getCustomerChecked>>;
  try {
    account = await getCustomerChecked();
  } catch (e) {
    console.error("create-order: login check failed", e);
    return fail("Could not check your login. Please try again.", 503);
  }
  if (!account || account === "stale") {
    const login = "/login?next=/checkout&shop=1";
    return NextResponse.json(
      {
        error: "Please log in to place your order.",
        // an outdated login cookie is cleared first, otherwise /login would send the visitor straight back here
        loginUrl: account === "stale" ? `/api/auth/logout?next=${encodeURIComponent(login)}` : login,
      },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }

  let priced: Awaited<ReturnType<typeof priceCart>>;
  try {
    priced = await priceCart(parsed.data.items); // server-side prices from the database only
  } catch (e) {
    console.error("create-order: could not load prices", e);
    return fail("Could not load prices. Please try again.", 503);
  }
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
      userId: account.sub,
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
