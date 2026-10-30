"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Loader2, Lock, UserRound } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useMe } from "@/components/useMe";
import { inr } from "@/lib/format";
import { states } from "@/lib/states";

const field = "h-12 w-full rounded-xl border border-ink/25 bg-white px-4";
type Errors = Record<string, string>;

/** Sends the browser to PayU's secure payment page with the server-signed fields. */
function postToPayU(action: string, form: Record<string, string>) {
  const el = document.createElement("form");
  el.method = "POST";
  el.action = action;
  el.style.display = "none";
  for (const [name, value] of Object.entries(form)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    el.appendChild(input);
  }
  document.body.appendChild(el);
  el.submit();
}

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, setQty } = useCart();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const me = useMe();
  const formRef = useRef<HTMLFormElement>(null);

  // Logged in: fill name, email and mobile (only into empty boxes, never over what was typed)
  useEffect(() => {
    const f = formRef.current;
    if (!me || !f) return;
    const fill = (name: string, value: string) => {
      const el = f.elements.namedItem(name) as HTMLInputElement | null;
      if (el && !el.value && value) el.value = value;
    };
    fill("name", me.name);
    fill("email", me.email);
    fill("phone", me.phone);
  }, [me, items.length]);

  // PayU callback sends people back here with ?payment=error if something went wrong
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("payment") === "error") {
      setFormError("We couldn't confirm your last payment attempt. Your cart is saved, so please try again.");
    }
    // Customer pressed Back on PayU's page: show the form again instead of the spinner
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        setRedirecting(false);
        setBusy(false);
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const f = new FormData(e.currentTarget);
    const v = (k: string) => String(f.get(k) ?? "").trim();
    const customer = {
      name: v("name"), phone: v("phone"), email: v("email"),
      address: v("address"), city: v("city"), state: v("state"), pin: v("pin"),
    };

    const err: Errors = {};
    if (customer.name.length < 2) err.name = "Enter your full name.";
    if (!/^[6-9]\d{9}$/.test(customer.phone)) err.phone = "Enter a 10-digit mobile number.";
    if (!/^\S+@\S+\.\S+$/.test(customer.email)) err.email = "Enter a valid email.";
    if (customer.address.length < 8) err.address = "Enter your full address.";
    if (customer.city.length < 2) err.city = "Enter your city.";
    if (!customer.state) err.state = "Select your state.";
    if (!/^\d{6}$/.test(customer.pin)) err.pin = "Enter a 6-digit PIN code.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setBusy(true);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: items.map((i) => ({ slug: i.slug, qty: i.qty })), customer }),
      });
      const data = await res.json();
      if (res.status === 401) {
        // login expired while on this page: log in again, then come back (the cart is kept)
        window.location.assign(data.loginUrl ?? "/login?next=/checkout&shop=1");
        return;
      }
      if (!res.ok) {
        if (data.fields) setErrors(Object.fromEntries(Object.entries(data.fields).map(([k, m]) => [k, (m as string[])[0]])));
        throw new Error(data.error ?? "Could not start the payment.");
      }

      setRedirecting(true);
      postToPayU(data.action, data.form); // leaves this page; PayU returns to /api/payu/callback
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  if (redirecting) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Loader2 className="mx-auto animate-spin text-pack" size={40} />
        <p className="mt-4 text-lg">Taking you to PayU&apos;s secure payment page…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-ink/80">Add a product to start your order.</p>
        <Link href="/products" className="mt-6 inline-block rounded-full bg-honey px-7 py-3 font-bold text-ink hover:bg-honey-deep">Browse products</Link>
      </div>
    );
  }

  const Err = ({ k }: { k: string }) => (errors[k] ? <p role="alert" className="mt-1 text-sm text-red-700">{errors[k]}</p> : null);

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:py-10 lg:grid-cols-[1fr_380px] lg:gap-10">
      <form ref={formRef} onSubmit={submit} noValidate className="space-y-5 lg:order-first">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Checkout</h1>
        <p className="text-ink/75">Enter your delivery details, then pay online with UPI, card or net banking.</p>
        {me && (
          <p className="flex items-center gap-2 rounded-xl bg-leaf-soft px-4 py-3 text-leaf-dark">
            <UserRound size={18} className="shrink-0" /> Ordering as <strong>{me.name}</strong>. This order will appear in{" "}
            <Link href="/account" className="font-semibold underline underline-offset-4">My account</Link>.
          </p>
        )}

        <div>
          <label htmlFor="name" className="mb-1 block font-semibold">Full name</label>
          <input id="name" name="name" autoComplete="name" className={field} />
          <Err k="name" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-1 block font-semibold">Mobile number</label>
            <input id="phone" name="phone" type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" className={field} />
            <Err k="phone" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block font-semibold">Email <span className="font-normal text-ink/70">(for your payment receipt)</span></label>
            <input id="email" name="email" type="email" autoComplete="email" className={field} />
            <Err k="email" />
          </div>
        </div>
        <div>
          <label htmlFor="address" className="mb-1 block font-semibold">Address</label>
          <textarea id="address" name="address" rows={3} autoComplete="street-address" className="w-full rounded-xl border border-ink/25 bg-white p-4" />
          <Err k="address" />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="city" className="mb-1 block font-semibold">City</label>
            <input id="city" name="city" autoComplete="address-level2" className={field} />
            <Err k="city" />
          </div>
          <div>
            <label htmlFor="state" className="mb-1 block font-semibold">State</label>
            <select id="state" name="state" defaultValue="" autoComplete="address-level1" className={field}>
              <option value="" disabled>Select state</option>
              {states.map((s) => <option key={s}>{s}</option>)}
            </select>
            <Err k="state" />
          </div>
          <div>
            <label htmlFor="pin" className="mb-1 block font-semibold">PIN code</label>
            <input id="pin" name="pin" inputMode="numeric" maxLength={6} autoComplete="postal-code" className={field} />
            <Err k="pin" />
          </div>
        </div>

        {formError && <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">{formError}</p>}

        <button
          type="submit"
          disabled={busy}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-pack text-lg font-bold text-white transition hover:bg-ink disabled:opacity-60"
        >
          {busy ? <Loader2 className="animate-spin" size={22} /> : <Lock size={20} />}
          {busy ? "Starting payment…" : `Pay ${inr(total)} securely`}
        </button>
        <p className="text-center text-sm text-ink/70">Payments are processed securely by PayU. We never see your card or UPI details.</p>
      </form>

      <aside className="h-fit rounded-2xl border border-ink/10 bg-honey-mist p-5 sm:p-6 lg:order-last">
        <h2 className="font-display text-xl font-bold">Order summary</h2>
        <ul className="mt-4 divide-y divide-ink/10">
          {items.map((i) => (
            <li key={i.slug} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold leading-snug">{i.name}</p>
                <label className="text-sm text-ink/70">
                  Qty{" "}
                  <select value={i.qty} onChange={(e) => setQty(i.slug, Number(e.target.value))} className="rounded border border-ink/20 bg-white px-1 py-0.5">
                    {Array.from({ length: 10 }, (_, n) => n + 1).map((n) => <option key={n}>{n}</option>)}
                  </select>
                </label>
              </div>
              <span className="font-semibold">{inr(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-ink/10 pt-4">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Delivery</dt><dd>{shipping === 0 ? "Free" : inr(shipping)}</dd></div>
          <div className="flex justify-between text-xl font-bold"><dt>Total</dt><dd>{inr(total)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}
