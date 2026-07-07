"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID!;
const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--onyx-800)",
  border: "1px solid var(--onyx-700)",
  borderRadius: 2,
  padding: "13px 16px",
  color: "var(--cream-100)",
  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
  fontSize: 14,
  letterSpacing: "0.02em",
  outline: "none",
  boxSizing: "border-box" as const,
};

export default function MysteryShopperApplyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    serviceToEvaluate: "",
    plannedVisitDate: "",
    preVisitNotes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [visitId, setVisitId] = useState("");

  const { data: services } = trpc.services.list.useQuery({ spaId: SPA_ID });

  const apply = trpc.mysteryShoppers.register.useMutation({
    onSuccess: (data) => {
      setVisitId(data.id);
      setSubmitted(true);
    },
  });

  if (status === "unauthenticated") {
    return (
      <main style={{ minHeight: "100vh", background: "var(--onyx-950)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 400, textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 28, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", marginBottom: 12,
          }}>
            Sign in to apply
          </div>
          <p style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 13, color: "var(--onyx-500)", marginBottom: 24,
          }}>
            You need an account to become a mystery shopper.
          </p>
          <Link href="/login" style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--gold-400)", textDecoration: "none",
            padding: "10px 24px",
            border: "1px solid rgba(201,168,92,0.45)",
            borderRadius: 2, display: "inline-block",
          }}>
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--onyx-950)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          {/* Gold check */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              border: "1.5px solid rgba(201,168,92,0.55)",
              background: "var(--onyx-900)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "4px 6px 0 rgba(0,0,0,0.6)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M5 12l5 5L19 7" stroke="var(--gold-400)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 8, letterSpacing: "0.32em", textTransform: "uppercase",
            color: "var(--gold-400)", marginBottom: 8,
          }}>
            Application Received
          </div>
          <h1 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 36, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", lineHeight: 1, marginBottom: 14,
          }}>
            You&apos;re on the list.
          </h1>
          <p style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 13, color: "var(--cream-400)", lineHeight: 1.7, marginBottom: 32,
          }}>
            Go ahead and book your treatment at the salon. Once you&apos;ve visited,
            come back here to submit your receipt and experience review.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href={`/mystery-shopper/submit?id=${visitId}`} style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 19, fontWeight: 300, fontStyle: "italic",
              color: "var(--gold-400)", textDecoration: "none",
              padding: "14px 24px",
              border: "1px solid rgba(201,168,92,0.55)",
              borderRadius: 2, display: "block", textAlign: "center",
              boxShadow: "4px 6px 0 rgba(0,0,0,0.6)",
            }}>
              Submit My Visit Later
            </Link>
            <Link href="/book" style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--cream-400)", textDecoration: "none",
              padding: "12px 24px",
              border: "1px solid var(--onyx-700)",
              borderRadius: 2, display: "block", textAlign: "center",
            }}>
              Book a Treatment
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const categories = Array.from(new Set(services?.map((s) => s.category) ?? []));

  return (
    <main style={{ minHeight: "100vh", background: "var(--onyx-950)" }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "var(--onyx-950)",
        borderBottom: "1px solid var(--onyx-800)",
        padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/mystery-shopper" style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--onyx-500)", textDecoration: "none",
        }}>
          ← Mystery Shopper
        </Link>
      </nav>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 80px" }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
          color: "var(--gold-400)", marginBottom: 8,
        }}>
          Mystery Shopper Programme
        </div>
        <h1 style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 36, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-100)", lineHeight: 1, marginBottom: 6,
        }}>
          Apply to evaluate us.
        </h1>
        <p style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 12, letterSpacing: "0.06em",
          color: "var(--onyx-500)", marginBottom: 32,
        }}>
          Tell us a little about your planned visit. You can fill in the full review after.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!LOCATION_ID) return;
            apply.mutate({
              locationId: LOCATION_ID,
              serviceToEvaluate: form.serviceToEvaluate || undefined,
              plannedVisitDate:  form.plannedVisitDate || undefined,
              preVisitNotes:     form.preVisitNotes || undefined,
            });
          }}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Service to evaluate */}
          <div>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--onyx-500)", marginBottom: 8,
            }}>
              Which treatment category will you evaluate?
            </div>
            <select
              value={form.serviceToEvaluate}
              onChange={(e) => setForm((f) => ({ ...f, serviceToEvaluate: e.target.value }))}
              style={{ ...inputStyle, colorScheme: "dark" }}
            >
              <option value="">— Select a category (optional) —</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Planned visit date */}
          <div>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--onyx-500)", marginBottom: 8,
            }}>
              Planned visit date <span style={{ opacity: 0.5 }}>(optional)</span>
            </div>
            <input
              type="date"
              value={form.plannedVisitDate}
              onChange={(e) => setForm((f) => ({ ...f, plannedVisitDate: e.target.value }))}
              min={new Date().toISOString().slice(0, 10)}
              style={{ ...inputStyle, colorScheme: "dark" }}
            />
          </div>

          {/* Pre-visit notes */}
          <div>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--onyx-500)", marginBottom: 8,
            }}>
              Any notes before your visit? <span style={{ opacity: 0.5 }}>(optional)</span>
            </div>
            <textarea
              rows={3}
              placeholder="e.g. first time visiting, interested in evaluating the welcome experience..."
              value={form.preVisitNotes}
              onChange={(e) => setForm((f) => ({ ...f, preVisitNotes: e.target.value }))}
              style={{ ...inputStyle, resize: "none" }}
            />
          </div>

          {apply.error && (
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 12, color: "#e57373",
            }}>
              {apply.error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={apply.isPending}
            style={{
              width: "100%", marginTop: 8,
              padding: "15px 20px",
              background: "transparent",
              border: "1px solid rgba(201,168,92,0.55)",
              borderRadius: 2, cursor: apply.isPending ? "default" : "pointer",
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 19, fontWeight: 300, fontStyle: "italic",
              color: "var(--gold-400)",
              boxShadow: "4px 6px 0 rgba(0,0,0,0.6)",
              opacity: apply.isPending ? 0.5 : 1,
            }}
          >
            {apply.isPending ? "Submitting…" : "Submit Application"}
          </button>
        </form>
      </div>
    </main>
  );
}
