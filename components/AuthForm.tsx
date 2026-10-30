"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Info, Loader2 } from "lucide-react";
import { safeNext } from "@/lib/redirect";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "password";
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric" | "tel";
  maxLength?: number;
  hint?: string;
};

type Props = {
  title: string;
  subtitle?: string;
  fields: FieldDef[];
  endpoint: string;
  submitLabel: string;
  busyLabel: string;
  /** where to go after success (a ?next= in the URL wins if it is a safe local path) */
  successPath: string;
  footer?: React.ReactNode;
  tone?: "customer" | "admin";
  /** "message": show the server's message instead of redirecting (used by Forgot password) */
  onSuccess?: "redirect" | "message";
  /** extra values sent with the form (e.g. the reset token from the URL) */
  extraBody?: () => Record<string, string>;
  /** shown under the fields, above the button (e.g. "Forgot password?") */
  afterFields?: React.ReactNode;
  /** messages shown at the top when the URL has ?key=1, e.g. { expired: "Please log in again." } */
  urlNotices?: Record<string, string>;
};

const input = "h-12 w-full rounded-xl border border-ink/25 bg-white px-4 text-base focus:border-pack focus:outline-none focus:ring-2 focus:ring-honey/60";

export function AuthForm({
  title,
  subtitle,
  fields,
  endpoint,
  submitLabel,
  busyLabel,
  successPath,
  footer,
  tone = "customer",
  onSuccess = "redirect",
  extraBody,
  afterFields,
  urlNotices,
}: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);
  const [done, setDone] = useState<{ message: string; devNote?: string } | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!urlNotices) return;
    const q = new URLSearchParams(window.location.search);
    const key = Object.keys(urlNotices).find((k) => q.has(k));
    if (key) setNotice(urlNotices[key]);
  }, [urlNotices]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setErrors({});
    setFormError("");
    const data = { ...(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>), ...(extraBody?.() ?? {}) };

    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (out.fields) setErrors(out.fields);
        setFormError(out.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      if (onSuccess === "message") {
        setDone({ message: out.message ?? "Done.", devNote: out.devNote });
        setBusy(false);
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      // full page load so the header and every page see the new login
      window.location.assign(safeNext(next, successPath));
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <div className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-3">
          <Image src="/images/logo.png" alt="" width={40} height={44} className="h-10 w-auto" />
          <span className="font-display text-lg font-bold text-leaf-dark">
            Doy &amp; Joy{tone === "admin" && <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs text-white">Admin</span>}
          </span>
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-1 text-ink/70">{subtitle}</p>}

        {notice && (
          <p className="mt-4 flex gap-2 rounded-xl bg-honey-soft p-3 text-sm text-ink">
            <Info size={18} className="mt-0.5 shrink-0" /> {notice}
          </p>
        )}

        {done ? (
          <div role="status" className="mt-6 space-y-3">
            <p className="flex gap-2 rounded-xl bg-leaf-soft p-4 text-leaf-dark">
              <CheckCircle2 size={20} className="mt-0.5 shrink-0" /> {done.message}
            </p>
            {done.devNote && (
              <p className="rounded-xl border border-dashed border-ink/30 p-3 text-sm text-ink/80">
                <strong>Developer note:</strong> {done.devNote}
              </p>
            )}
          </div>
        ) : (
        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {fields.map((f) => {
            const isPw = f.type === "password";
            return (
              <div key={f.name}>
                <label htmlFor={f.name} className="mb-1 block font-semibold">{f.label}</label>
                <div className="relative">
                  <input
                    id={f.name}
                    name={f.name}
                    type={isPw ? (show ? "text" : "password") : f.type ?? "text"}
                    autoComplete={f.autoComplete}
                    inputMode={f.inputMode}
                    maxLength={f.maxLength}
                    aria-invalid={!!errors[f.name]}
                    aria-describedby={errors[f.name] ? `${f.name}-err` : undefined}
                    className={`${input} ${isPw ? "pr-12" : ""} ${errors[f.name] ? "border-red-500" : ""}`}
                  />
                  {isPw && (
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute inset-y-0 right-0 grid w-12 place-items-center text-ink/70 hover:text-ink"
                      aria-label={show ? "Hide password" : "Show password"}
                    >
                      {show ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  )}
                </div>
                {f.hint && !errors[f.name] && <p className="mt-1 text-sm text-ink/70">{f.hint}</p>}
                {errors[f.name] && <p id={`${f.name}-err`} role="alert" className="mt-1 text-sm text-red-700">{errors[f.name]}</p>}
              </div>
            );
          })}

          {afterFields}

          {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{formError}</p>}

          <button
            type="submit"
            disabled={busy}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-full font-bold transition disabled:opacity-60 ${
              tone === "admin" ? "bg-ink text-white hover:bg-pack" : "bg-pack text-white hover:bg-ink"
            }`}
          >
            {busy && <Loader2 className="animate-spin" size={20} />}
            {busy ? busyLabel : submitLabel}
          </button>
        </form>
        )}

        {footer && <div className="mt-6 text-center text-ink/75">{footer}</div>}
      </div>
      {tone === "customer" && (
        <p className="mt-6 text-center text-sm text-ink/70">
          <Link href="/" className="underline underline-offset-4">Back to home</Link>
        </p>
      )}
    </div>
  );
}
