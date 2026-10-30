"use client";

import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function ForgotPasswordPage() {
  return (
    <AuthForm
      title="Forgot password?"
      subtitle="Enter the email you signed up with. We'll send you a link to choose a new password."
      endpoint="/api/auth/forgot-password"
      submitLabel="Send reset link"
      busyLabel="Sending…"
      successPath="/login"
      onSuccess="message"
      fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email" }]}
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-pack underline underline-offset-4">Back to log in</Link>
        </>
      }
    />
  );
}
