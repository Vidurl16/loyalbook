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
      <div className="hidden lg:flex flex-col justify-between w-96 bg-gradient-to-b from-stone-900 to-stone-800 p-12 text-white">
        <Link href="/" className="font-display text-2xl font-bold">Perfect 10</Link>
        <div>
          <div className="space-y-4 text-sm">
            {["✨ Earn points on every treatment", "🎂 Birthday bonus points", "🔁 Rebooking rewards", "💎 Unlock exclusive tiers"].map((perk) => (
              <div key={perk} className="flex items-center gap-2">{perk}</div>
            ))}
          </div>
        </div>
        <div className="text-rose-200 text-xs">© {new Date().getFullYear()} Perfect 10</div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-10 w-full max-w-md">
        <Link href="/" className="font-display text-xl font-bold text-teal-700 block mb-8 lg:hidden">Perfect 10</Link>
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
            {loading ? "Creating account…" : "Create Account — it's free"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
          <div className="relative flex justify-center text-xs text-stone-400 bg-white px-3">or continue with</div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/account" })}
          className="w-full flex items-center justify-center gap-3 border border-stone-200 rounded-xl px-4 py-3 hover:bg-stone-50 transition-colors text-stone-700 font-medium text-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign up with Google
        </button>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-600 hover:underline">Sign in</Link>
        </p>
      </div>
      </div>
    </main>
  );
}
