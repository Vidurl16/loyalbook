"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AuthFrame, GoogleButton, OrDivider } from "@/components/auth/AuthFrame";
import { brand } from "@/lib/brand";

const PERKS = [
  "Points on every completed treatment",
  "A birthday bonus in your month",
  "Rebooking rewards",
  "Points become Rand-value vouchers",
];

const FIELDS = [
  { field: "name", type: "text", placeholder: "Full name", autoComplete: "name", required: true },
  { field: "email", type: "email", placeholder: "Email address", autoComplete: "email", required: true },
  { field: "phone", type: "tel", placeholder: "Phone (optional)", autoComplete: "tel", required: false },
  { field: "password", type: "password", placeholder: "Password", autoComplete: "new-password", required: true },
] as const;

function SignUpForm() {
  const callbackUrl = useSearchParams().get("callbackUrl") ?? "/account";
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", marketingOptIn: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "We couldn't create your account. Please try again.");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, callbackUrl });
  }

  const signInHref = callbackUrl !== "/account" ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";

  return (
    <>
      <form onSubmit={submit} className="flex flex-col gap-3">
        {FIELDS.map((f) => (
          <input
            key={f.field}
            type={f.type}
            required={f.required}
            autoComplete={f.autoComplete}
            placeholder={f.placeholder}
            value={form[f.field]}
            onChange={(e) => setForm((s) => ({ ...s, [f.field]: e.target.value }))}
            className="field"
          />
        ))}
        <label className="mt-1 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-ink-soft">
          <input
            type="checkbox"
            checked={form.marketingOptIn}
            onChange={(e) => setForm((s) => ({ ...s, marketingOptIn: e.target.checked }))}
            className="mt-1 h-4 w-4 shrink-0 accent-pink"
          />
          Email me offers, news and reminders from {brand.name}. Unsubscribe any time.
        </label>
        {error && <p className="text-[13px] text-pink-dark">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-2 w-full">
          {loading ? "Creating your account…" : "Join free"}
        </button>
      </form>
      <OrDivider />
      <GoogleButton label="Sign up with Google" onClick={() => signIn("google", { callbackUrl })} />
      <p className="mt-6 text-center text-[13px] text-muted">
        Already a member?{" "}
        <Link href={signInHref} className="text-pink-dark underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function SignUpPage() {
  return (
    <AuthFrame
      title="Join free"
      lede="Start earning from your very first treatment."
      aside={
        <>
          <p className="eyebrow mb-5">Member benefits</p>
          <ul className="space-y-4">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-3 font-display text-[18px] leading-snug text-ink-soft">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink" />
                {p}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <Suspense>
        <SignUpForm />
      </Suspense>
    </AuthFrame>
  );
}
