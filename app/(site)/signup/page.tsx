"use client";

import { AuthForm } from "@/components/AuthForm";
import { AuthSwitchLink } from "@/components/AuthSwitchLink";

const notices = {
  shop: "Create a free account to see all products, use your cart and buy. You'll go straight back to shopping.",
};

export default function SignupPage() {
  return (
    <AuthForm
      title="Create account"
      subtitle="Shop all products, save your details for faster checkout and track your orders."
      endpoint="/api/auth/signup"
      submitLabel="Create account"
      busyLabel="Creating account…"
      successPath="/products"
      urlNotices={notices}
      fields={[
        { name: "name", label: "Full name", autoComplete: "name" },
        { name: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email" },
        { name: "phone", label: "Mobile number", type: "tel", autoComplete: "tel-national", inputMode: "numeric", maxLength: 10 },
        {
          name: "password",
          label: "Password",
          type: "password",
          autoComplete: "new-password",
          hint: "At least 8 characters, with letters and a number.",
        },
      ]}
      footer={
        <>
          Already have an account? <AuthSwitchLink to="/login">Log in</AuthSwitchLink>
        </>
      }
    />
  );
}
