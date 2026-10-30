"use client";

import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

const token = () => (typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("token") ?? "");

export default function ResetPasswordPage() {
  return (
    <AuthForm
      title="Choose a new password"
      subtitle="After saving, you'll be logged in here and logged out on your other devices."
      endpoint="/api/auth/reset-password"
      submitLabel="Save new password"
      busyLabel="Saving…"
      successPath="/account"
      extraBody={() => ({ token: token() })}
      fields={[
        {
          name: "password",
          label: "New password",
          type: "password",
          autoComplete: "new-password",
          hint: "At least 8 characters, with letters and a number.",
        },
        { name: "confirm", label: "Confirm new password", type: "password", autoComplete: "new-password" },
      ]}
      footer={
        <>
          Link not working?{" "}
          <Link href="/forgot-password" className="font-semibold text-pack underline underline-offset-4">Get a new link</Link>
        </>
      }
    />
  );
}
