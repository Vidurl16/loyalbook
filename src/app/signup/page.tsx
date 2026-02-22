"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, callbackUrl: "/account" });
  }

  return (
    <main className="min-h-screen flex" style={{ background: "var(--background)" }}>
      <div className="hidden lg:flex flex-col justify-between w-96 bg-gradient-to-b from-rose-600 to-teal-800 p-12 text-white">
        <Link href="/" className="font-display text-2xl font-bold">LoyalBook</Link>
        <div>
          <div className="space-y-4 text-sm">
            {["✨ Earn points on every treatment", "🎂 Birthday bonus points", "🔁 Rebooking rewards", "💎 Unlock exclusive tiers"].map((perk) => (
              <div key={perk} className="flex items-center gap-2">{perk}</div>
            ))}
          </div>
        </div>
        <div className="text-rose-200 text-xs">© {new Date().getFullYear()} LoyalBook</div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10 w-full max-w-md">
        <Link href="/" className="font-display text-xl font-bold text-teal-700 block mb-8 lg:hidden">LoyalBook</Link>
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-1">Create your account</h1>
        <p className="text-stone-400 text-sm mb-6">Start earning rewards from your very first treatment</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {(["name", "email", "phone", "password"] as const).map((field) => (
            <input
              key={field}
              type={field === "email" ? "email" : field === "password" ? "password" : "text"}
              placeholder={field === "name" ? "Full name" : field === "email" ? "Email address" : field === "phone" ? "Phone (optional)" : "Password"}
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              required={field !== "phone"}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 bg-stone-50 text-stone-800"
            />
          ))}
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-700 text-white py-3 rounded-xl hover:bg-teal-800 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? "Creating account…" : "Join LoyalBook — it's free"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-600 hover:underline">Sign in</Link>
        </p>
      </div>
      </div>
    </main>
  );
}
