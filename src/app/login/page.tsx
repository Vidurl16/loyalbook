"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/account");
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--onyx-800)",
    border: "1px solid var(--onyx-700)",
    borderRadius: 2,
    padding: "14px 16px",
    color: "var(--cream-100)",
    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
    fontSize: 14,
    letterSpacing: "0.02em",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  return (
    <main style={{ minHeight: "100vh", display: "flex", background: "var(--onyx-950)" }}>

      {/* Left editorial panel */}
      <div style={{
        display: "none",
        width: 360, flexShrink: 0,
        background: "var(--onyx-900)",
        borderRight: "1px solid var(--onyx-700)",
        padding: "52px 44px",
        flexDirection: "column", justifyContent: "space-between",
      }}
        className="lg-panel"
      >
        <Link href="/" style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 20, fontWeight: 300, fontStyle: "italic",
          color: "var(--gold-400)", textDecoration: "none",
        }}>
          Perfect 10
        </Link>

        <div>
          <div style={{ width: 28, height: 1, background: "var(--gold-400)", opacity: 0.5, marginBottom: 28 }} />
          <blockquote style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 26, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", lineHeight: 1.35, letterSpacing: "0.02em",
            marginBottom: 20,
          }}>
            &ldquo;The ritual of self-care begins with showing up.&rdquo;
          </blockquote>
          <p style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--gold-400)",
          }}>
            Ballito · La Lucia
          </p>
        </div>

        <div style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 8, letterSpacing: "0.18em",
          color: "var(--onyx-500)",
        }}>
          © {new Date().getFullYear()} Perfect 10
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 400 }}>

          <Link href="/" style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 20, fontWeight: 300, fontStyle: "italic",
            color: "var(--gold-400)", textDecoration: "none",
            display: "block", marginBottom: 36,
          }}>
            Perfect 10
          </Link>

          <h1 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 32, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", marginBottom: 4, lineHeight: 1,
          }}>
            Welcome back
          </h1>
          <p style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 12, letterSpacing: "0.08em",
            color: "var(--onyx-500)", marginBottom: 32,
          }}>
            Sign in to manage your bookings & rewards
          </p>

          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/account" })}
            style={{
              width: "100%",
              background: "var(--onyx-800)",
              border: "1px solid var(--onyx-700)",
              borderRadius: 2, padding: "13px 20px",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              cursor: "pointer",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 12, letterSpacing: "0.14em",
              color: "var(--cream-300)",
              marginBottom: 20,
              boxSizing: "border-box",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: "var(--onyx-700)" }} />
            <span style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--onyx-500)",
            }}>
              or
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--onyx-700)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
            {error && (
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 12, color: "#e57373", letterSpacing: "0.04em",
              }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "15px 20px", marginTop: 6,
                background: "transparent",
                border: "1px solid rgba(201,168,92,0.55)",
                borderRadius: 2, cursor: loading ? "default" : "pointer",
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 19, fontWeight: 300, fontStyle: "italic",
                letterSpacing: "0.08em", color: "var(--gold-400)",
                boxShadow: "4px 6px 0 rgba(0,0,0,0.65)",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.22s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p style={{
            textAlign: "center", marginTop: 24,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 12, letterSpacing: "0.06em", color: "var(--onyx-500)",
          }}>
            No account?{" "}
            <Link href="/signup" style={{ color: "var(--gold-400)", textDecoration: "none" }}>
              Join free
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
