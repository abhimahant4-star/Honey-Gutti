"use client";

import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";
import { AuthSwitchLink } from "@/components/AuthSwitchLink";

const notices = {
  expired: "You've been logged out (for example, your password was changed). Please log in again.",
  shop: "Please log in to see all products, use your cart and buy. New here? Creating an account takes a minute.",
};

export default function LoginPage() {
  return (
    <AuthForm
      title="Log in"
      subtitle="Welcome back! Log in to shop, see your orders and check out faster."
      endpoint="/api/auth/login"
      submitLabel="Log in"
      busyLabel="Logging in…"
      successPath="/products"
      urlNotices={notices}
      fields={[
        { name: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email" },
        { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
      ]}
      afterFields={
        <p className="-mt-1 text-right text-sm">
          <Link href="/forgot-password" className="font-semibold text-pack underline underline-offset-4">Forgot password?</Link>
        </p>
      }
      footer={
        <>
          New here? <AuthSwitchLink to="/signup">Create an account</AuthSwitchLink>
        </>
      }
    />
  );
}
