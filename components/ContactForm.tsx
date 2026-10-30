"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useMe } from "./useMe";

const input = "h-12 w-full rounded-xl border border-ink/25 bg-white px-4 text-base focus:border-pack focus:outline-none focus:ring-2 focus:ring-honey/60";

export function ContactForm() {
  const me = useMe();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ message: string; devNote?: string } | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setErrors({});
    setFormError("");
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (out.fields) setErrors(out.fields);
        setFormError(out.error ?? "Something went wrong. Please try again.");
      } else {
        setDone({ message: out.message, devNote: out.devNote });
      }
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <div role="status" className="space-y-3">
        <p className="flex gap-2 rounded-xl bg-leaf-soft p-4 text-leaf-dark">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> {done.message}
        </p>
        {done.devNote && (
          <p className="rounded-xl border border-dashed border-ink/30 p-3 text-sm text-ink/80"><strong>Developer note:</strong> {done.devNote}</p>
        )}
      </div>
    );
  }

  const Err = ({ k }: { k: string }) =>
    errors[k] ? <p id={`${k}-err`} role="alert" className="mt-1 text-sm text-red-700">{errors[k]}</p> : null;
  const bad = (k: string) => (errors[k] ? "border-red-500" : "");

  return (
    // key: remount once the login is known so the boxes get the account's details
    <form key={me ? "me" : "guest"} onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1 block font-semibold">Your name</label>
          <input id="c-name" name="name" autoComplete="name" defaultValue={me?.name} aria-invalid={!!errors.name} className={`${input} ${bad("name")}`} />
          <Err k="name" />
        </div>
        <div>
          <label htmlFor="c-phone" className="mb-1 block font-semibold">
            Mobile <span className="font-normal text-ink/70">(optional)</span>
          </label>
          <input id="c-phone" name="phone" type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" defaultValue={me?.phone} aria-invalid={!!errors.phone} className={`${input} ${bad("phone")}`} />
          <Err k="phone" />
        </div>
      </div>
      <div>
        <label htmlFor="c-email" className="mb-1 block font-semibold">Email</label>
        <input id="c-email" name="email" type="email" autoComplete="email" inputMode="email" defaultValue={me?.email} aria-invalid={!!errors.email} className={`${input} ${bad("email")}`} />
        <Err k="email" />
      </div>
      <div>
        <label htmlFor="c-message" className="mb-1 block font-semibold">Message</label>
        <textarea id="c-message" name="message" rows={5} maxLength={2000} aria-invalid={!!errors.message} placeholder="Ask about a product, an order or anything else." className={`w-full rounded-xl border border-ink/25 bg-white p-4 text-base focus:border-pack focus:outline-none focus:ring-2 focus:ring-honey/60 ${bad("message")}`} />
        <Err k="message" />
      </div>
      {/* honeypot: hidden from people, filled in by spam bots */}
      <div aria-hidden="true" className="absolute left-[-10000px] h-0 w-0 overflow-hidden">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{formError}</p>}

      <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-pack font-bold text-white transition hover:bg-ink disabled:opacity-60 sm:w-auto sm:px-8">
        {busy ? <Loader2 className="animate-spin" size={20} /> : <Send size={18} />}
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
