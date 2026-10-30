"use client";

import { AuthForm } from "@/components/AuthForm";

export default function AdminLoginPage() {
  return (
    <AuthForm
      tone="admin"
      title="Admin login"
      subtitle="For the shop owner only."
      endpoint="/api/auth/admin-login"
      submitLabel="Log in"
      busyLabel="Checking…"
      successPath="/admin"
      fields={[
        { name: "username", label: "Username", autoComplete: "username" },
        { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
      ]}
    />
  );
}
