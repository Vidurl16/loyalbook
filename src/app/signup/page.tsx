"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { brand } from "@/lib/brand";

const PERKS = [
  "10 points earned per R100 spent",
  "Birthday bonus on your special month",
  "Rebooking rewards within 8 weeks",
  "Turn points into Rand-value vouchers",
];

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", marketingOptIn: true });
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#ffffff",
    border: "1px solid #efdcd8",
    borderRadius: 2,
    padding: "14px 16px",
    color: "#232122",
    fontFamily: "var(--font-abel), Abel, sans-serif",
    fontSize: 14,
    letterSpacing: "0.02em",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", background: "#ffffff" }}>

      {/* Left editorial panel */}
      <div
        style={{
          display: "none",
          width: 360, flexShrink: 0,
          background: "#faf6f5",
          borderRight: "1px solid #efdcd8",
          padding: "52px 44px",
          flexDirection: "column", justifyContent: "space-between",
        }}
        className="lg-panel"
      >
        <Link href="/" style={{ display: "block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={brand.logoUrl} alt={brand.name} style={{ width: 150, height: "auto", display: "block" }} />
        </Link>

        <div>
          <div style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "#c98d82", marginBottom: 14,
          }}>
            Loyalty Club Benefits
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {PERKS.map((perk, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fe329c", marginTop: 6, flexShrink: 0 }} />
                <span style={{
                  fontFamily: "var(--font-marcellus), Marcellus, serif",
                  fontSize: 17, fontWeight: 400,
                  color: "#4a4547", lineHeight: 1.4,
                }}>
                  {perk}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          fontFamily: "var(--font-abel), Abel, sans-serif",
          fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "#8d8e8f",
        }}>
          © {new Date().getFullYear()} {brand.name}
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          <Link href="/" style={{ display: "block", marginBottom: 36 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logoUrl} alt={brand.name} style={{ width: 160, height: "auto", display: "block" }} />
          </Link>

          <h1 style={{
            fontFamily: "var(--font-marcellus), Marcellus, serif",
            fontSize: 32, fontWeight: 400,
            color: "#232122", marginBottom: 4, lineHeight: 1,
          }}>
            Create your account
          </h1>
          <p style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 13, letterSpacing: "0.08em",
            color: "#8d8e8f", marginBottom: 32,
          }}>
            Start earning rewards from your very first treatment
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {([
              { field: "name",     type: "text",     placeholder: "Full name" },
              { field: "email",    type: "email",    placeholder: "Email address" },
              { field: "phone",    type: "text",     placeholder: "Phone (optional)" },
              { field: "password", type: "password", placeholder: "Password" },
            ] as const).map(({ field, type, placeholder }) => (
              <input
                key={field}
                type={type}
                placeholder={placeholder}
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required={field !== "phone"}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#fe329c")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#efdcd8")}
              />
            ))}
            <label style={{
              display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer",
              marginTop: 4, padding: "2px 0",
            }}>
              <input
                type="checkbox"
                checked={form.marketingOptIn}
                onChange={(e) => setForm((f) => ({ ...f, marketingOptIn: e.target.checked }))}
                style={{ marginTop: 3, accentColor: "#fe329c", width: 15, height: 15, flexShrink: 0 }}
              />
              <span style={{
                fontFamily: "var(--font-abel), Abel, sans-serif",
                fontSize: 12, letterSpacing: "0.03em", lineHeight: 1.5,
                color: "#4a4547",
              }}>
                Email me offers, news and reminders from {brand.name}. You can unsubscribe any time.
              </span>
            </label>
            {error && (
              <div style={{
                fontFamily: "var(--font-abel), Abel, sans-serif",
                fontSize: 12, color: "#d41d7f", letterSpacing: "0.04em",
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "15px 20px", marginTop: 6,
                background: "#232122",
                border: "1px solid #232122",
                borderRadius: 2, cursor: loading ? "default" : "pointer",
                fontFamily: "var(--font-abel), Abel, sans-serif",
                fontSize: 13, fontWeight: 400, textTransform: "uppercase",
                letterSpacing: "0.14em", color: "#ffffff",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Creating account…" : "Join the Club"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "#efdcd8" }} />
            <span style={{
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#8d8e8f",
            }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: "#efdcd8" }} />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            style={{
              width: "100%",
              background: "#ffffff",
              border: "1px solid #efdcd8",
              borderRadius: 2, padding: "13px 20px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              cursor: "pointer",
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "#4a4547",
              boxSizing: "border-box",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          <p style={{
            textAlign: "center", marginTop: 24,
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 13, letterSpacing: "0.06em", color: "#8d8e8f",
          }}>
            Already a member?{" "}
            <Link href="/login" style={{ color: "#fe329c", textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-panel { display: flex !important; }
        }
      `}</style>
    </main>
  );
}
