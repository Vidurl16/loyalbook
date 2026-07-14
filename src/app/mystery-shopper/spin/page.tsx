"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { brand } from "@/lib/brand";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID ?? "";

type Stage = "enter" | "verify" | "consent" | "result";

const card: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #efdcd8",
  borderRadius: 2,
  padding: 24,
  boxShadow: "0 10px 30px rgba(35,33,34,0.07)",
};
const input: React.CSSProperties = {
  width: "100%", background: "#ffffff", border: "1px solid #efdcd8",
  borderRadius: 2, padding: "13px 16px", color: "#232122",
  fontFamily: "var(--font-abel), Abel, sans-serif", fontSize: 14, outline: "none",
  boxSizing: "border-box", marginBottom: 10,
};
const btn: React.CSSProperties = {
  width: "100%", padding: "14px 20px", background: "#232122",
  border: "1px solid #232122", borderRadius: 2, cursor: "pointer",
  fontFamily: "var(--font-abel), Abel, sans-serif", fontSize: 13, textTransform: "uppercase",
  letterSpacing: "0.14em", color: "#ffffff",
};
const label = { fontFamily: "var(--font-abel), Abel, sans-serif", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase" as const, color: "#c98d82", marginBottom: 10 };

export default function MysteryShopperSpinPage() {
  const [stage, setStage] = useState<Stage>("enter");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [consentReview, setConsentReview] = useState(false);
  const [consentPhoto, setConsentPhoto] = useState(false);
  const [prize, setPrize] = useState<{ prize: string; win: boolean } | null>(null);
  const [error, setError] = useState("");

  const enter = trpc.mysteryShopper.enter.useMutation({
    onSuccess: () => { setError(""); setStage("verify"); },
    onError: (e) => setError(e.message),
  });
  const verify = trpc.mysteryShopper.verify.useMutation({
    onSuccess: () => { setError(""); setStage("consent"); },
    onError: (e) => setError(e.message),
  });
  const spin = trpc.mysteryShopper.spin.useMutation({
    onSuccess: (r) => { setError(""); setPrize(r); setStage("result"); },
    onError: (e) => setError(e.message),
  });

  return (
    <main style={{ minHeight: "100vh", background: "#faf6f5", padding: "0 20px 60px" }}>
      <nav style={{ display: "flex", alignItems: "center", height: 52, marginBottom: 8 }}>
        <Link href="/mystery-shopper" style={{ fontFamily: "var(--font-marcellus), Marcellus, serif", fontSize: 18, color: "#232122", textDecoration: "none" }}>
          ← {brand.name}
        </Link>
      </nav>

      <div style={{ maxWidth: 440, margin: "0 auto" }}>
        <div style={label as React.CSSProperties}>Secret Shopper</div>
        <h1 style={{ fontFamily: "var(--font-marcellus), Marcellus, serif", fontSize: 34, fontWeight: 400, color: "#232122", lineHeight: 1.05, marginBottom: 20 }}>
          {stage === "result" ? "Your result" : "Enter to be our secret shopper"}
        </h1>

        {stage === "enter" && (
          <div style={card}>
            <p style={{ fontFamily: "var(--font-abel), Abel, sans-serif", fontSize: 14, color: "#4a4547", lineHeight: 1.6, marginBottom: 18 }}>
              Enter for a chance to be chosen. If selected, you&apos;ll visit like any other client, then share an honest review — please don&apos;t tell our staff you&apos;re the secret shopper.
            </p>
            <input style={input} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <input style={input} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input style={input} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {error && <div style={{ color: "#d41d7f", fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <button
              style={{ ...btn, opacity: enter.isPending ? 0.6 : 1 }}
              disabled={enter.isPending || !name || !email}
              onClick={() => enter.mutate({ spaId: SPA_ID, name, email, phone: phone || undefined })}
            >
              {enter.isPending ? "Sending code…" : "Continue"}
            </button>
          </div>
        )}

        {stage === "verify" && (
          <div style={card}>
            <p style={{ fontFamily: "var(--font-abel), Abel, sans-serif", fontSize: 14, color: "#4a4547", lineHeight: 1.6, marginBottom: 18 }}>
              We&apos;ve emailed a 6-digit code to <strong style={{ color: "#232122" }}>{email}</strong>. Enter it below.
            </p>
            <input style={{ ...input, letterSpacing: "0.4em", textAlign: "center", fontSize: 20 }} placeholder="______" value={code} onChange={(e) => setCode(e.target.value)} maxLength={6} />
            {error && <div style={{ color: "#d41d7f", fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <button
              style={{ ...btn, opacity: verify.isPending ? 0.6 : 1 }}
              disabled={verify.isPending || code.length < 4}
              onClick={() => verify.mutate({ spaId: SPA_ID, email, code })}
            >
              {verify.isPending ? "Verifying…" : "Verify"}
            </button>
          </div>
        )}

        {stage === "consent" && (
          <div style={card}>
            <p style={{ fontFamily: "var(--font-abel), Abel, sans-serif", fontSize: 14, color: "#4a4547", lineHeight: 1.6, marginBottom: 18 }}>
              Before you spin, please agree to the terms:
            </p>
            {[
              { checked: consentReview, set: setConsentReview, text: "If selected, I agree to leave an honest review of my treatment and service." },
              { checked: consentPhoto, set: setConsentPhoto, text: `I give permission for my photo to be shared internally with the ${brand.name} team.` },
            ].map((c, i) => (
              <label key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={c.checked} onChange={(e) => c.set(e.target.checked)} style={{ marginTop: 3, accentColor: "#fe329c", width: 16, height: 16, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-abel), Abel, sans-serif", fontSize: 13, color: "#4a4547", lineHeight: 1.5 }}>{c.text}</span>
              </label>
            ))}
            {error && <div style={{ color: "#d41d7f", fontSize: 12, marginBottom: 10 }}>{error}</div>}
            <button
              style={{ ...btn, opacity: spin.isPending || !consentReview || !consentPhoto ? 0.5 : 1 }}
              disabled={spin.isPending || !consentReview || !consentPhoto}
              onClick={() => spin.mutate({ spaId: SPA_ID, email, consentReview, consentPhoto })}
            >
              {spin.isPending ? "Spinning…" : "Spin the wheel"}
            </button>
          </div>
        )}

        {stage === "result" && prize && (
          <div style={{ ...card, textAlign: "center", padding: "40px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12, color: "#fe329c" }}>{prize.win ? "✦" : "—"}</div>
            <div style={{ ...(label as React.CSSProperties), textAlign: "center" }}>{prize.win ? "You won" : "This time"}</div>
            <div style={{ fontFamily: "var(--font-marcellus), Marcellus, serif", fontSize: 26, fontWeight: 400, color: "#fe329c", lineHeight: 1.2, margin: "6px 0 18px" }}>
              {prize.prize}
            </div>
            {prize.win && (
              <p style={{ fontFamily: "var(--font-abel), Abel, sans-serif", fontSize: 13, color: "#4a4547", lineHeight: 1.6 }}>
                We&apos;ll be in touch by email. Book your visit, keep it discreet, and remember your honest review afterwards.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
