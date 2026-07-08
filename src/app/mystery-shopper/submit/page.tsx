"use client";

import { Suspense, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

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

const RATING_LABELS = [
  { key: "overallRating",           label: "Overall Experience" },
  { key: "firstImpressionRating",   label: "Welcome & First Impression" },
  { key: "cleanlinessRating",       label: "Cleanliness & Ambiance" },
  { key: "treatmentQualityRating",  label: "Treatment Quality" },
  { key: "staffFriendlinessRating", label: "Staff Friendliness" },
  { key: "productKnowledgeRating",  label: "Product Knowledge" },
  { key: "valueRating",             label: "Value for Money" },
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: "none", border: "none", cursor: "pointer", padding: 2,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={star <= value ? "var(--gold-400)" : "none"} stroke="var(--gold-400)" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

type RatingState = {
  overallRating: number;
  firstImpressionRating: number;
  cleanlinessRating: number;
  treatmentQualityRating: number;
  staffFriendlinessRating: number;
  productKnowledgeRating: number;
  valueRating: number;
};

function SubmitPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const visitId = searchParams.get("id") ?? "";
  const { data: session } = useSession();

  const [ratings, setRatings] = useState<RatingState>({
    overallRating: 0,
    firstImpressionRating: 0,
    cleanlinessRating: 0,
    treatmentQualityRating: 0,
    staffFriendlinessRating: 0,
    productKnowledgeRating: 0,
    valueRating: 0,
  });
  const [form, setForm] = useState({
    receiptUrl: "",
    receiptAmount: "",
    visitedAt: "",
    highlightsFeedback: "",
    improvementFeedback: "",
    staffFeedback: "",
    wouldReturn: null as boolean | null,
  });
  const [done, setDone] = useState(false);

  const submit = trpc.mysteryShoppers.submit.useMutation({
    onSuccess: () => setDone(true),
  });

  const allRated = Object.values(ratings).every((v) => v > 0);
  const canSubmit = form.receiptUrl && form.receiptAmount && form.visitedAt
    && form.highlightsFeedback.length >= 20 && allRated && form.wouldReturn !== null;

  if (!visitId) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--onyx-950)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 24, fontStyle: "italic", color: "var(--cream-400)", marginBottom: 16,
          }}>
            No visit ID found.
          </div>
          <Link href="/mystery-shopper/apply" style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--gold-400)", textDecoration: "none",
          }}>
            Apply first →
          </Link>
        </div>
      </main>
    );
  }

  if (done) {
    return (
      <main style={{ minHeight: "100vh", background: "var(--onyx-950)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 400, textAlign: "center" }}>
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
            color: "var(--gold-400)", marginBottom: 10,
          }}>
            Review Submitted
          </div>
          <h1 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 36, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", lineHeight: 1, marginBottom: 14,
          }}>
            Thank you.
          </h1>
          <p style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 13, color: "var(--cream-400)", lineHeight: 1.7, marginBottom: 28,
          }}>
            Your review has been received. We&apos;ll review your submission and process
            your reimbursement within 3–5 business days.
          </p>
          <Link href="/account" style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--gold-400)", textDecoration: "none",
            padding: "10px 24px",
            border: "1px solid rgba(201,168,92,0.45)",
            borderRadius: 2, display: "inline-block",
          }}>
            Back to Account
          </Link>
        </div>
      </main>
    );
  }

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
          Submit Your Visit
        </div>
        <h1 style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 36, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-100)", lineHeight: 1, marginBottom: 6,
        }}>
          Share your experience.
        </h1>
        <p style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 12, color: "var(--onyx-500)", marginBottom: 32,
        }}>
          Upload your receipt and give us your honest, detailed feedback.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            submit.mutate({
              visitId,
              receiptUrl:              form.receiptUrl,
              receiptAmount:           parseFloat(form.receiptAmount),
              visitedAt:               form.visitedAt,
              highlightsFeedback:      form.highlightsFeedback,
              improvementFeedback:     form.improvementFeedback || undefined,
              staffFeedback:           form.staffFeedback || undefined,
              wouldReturn:             form.wouldReturn!,
              ...ratings,
            });
          }}
          style={{ display: "flex", flexDirection: "column", gap: 20 }}
        >
          {/* Receipt section */}
          <div style={{
            background: "var(--onyx-900)",
            border: "1px solid var(--onyx-700)",
            borderRadius: 2, padding: "20px",
            boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
          }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 14,
            }}>
              Receipt & Visit Details
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--onyx-500)", marginBottom: 6,
                }}>
                  Receipt link (Google Drive, Dropbox, or similar)
                </div>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  value={form.receiptUrl}
                  onChange={(e) => setForm((f) => ({ ...f, receiptUrl: e.target.value }))}
                  required
                  style={inputStyle}
                />
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 10, color: "var(--onyx-600)", marginTop: 5,
                }}>
                  Upload your receipt to Google Drive and share the link (set to "Anyone with the link can view")
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "var(--onyx-500)", marginBottom: 6,
                  }}>
                    Receipt amount (R)
                  </div>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="e.g. 580.00"
                    value={form.receiptAmount}
                    onChange={(e) => setForm((f) => ({ ...f, receiptAmount: e.target.value }))}
                    required
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "var(--onyx-500)", marginBottom: 6,
                  }}>
                    Date of visit
                  </div>
                  <input
                    type="date"
                    value={form.visitedAt}
                    onChange={(e) => setForm((f) => ({ ...f, visitedAt: e.target.value }))}
                    max={new Date().toISOString().slice(0, 10)}
                    required
                    style={{ ...inputStyle, colorScheme: "dark" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ratings */}
          <div style={{
            background: "var(--onyx-900)",
            border: "1px solid var(--onyx-700)",
            borderRadius: 2, padding: "20px",
            boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
          }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 18,
            }}>
              Rate Your Experience
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {RATING_LABELS.map(({ key, label }) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <span style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    fontSize: 16, fontWeight: 300, fontStyle: "italic",
                    color: "var(--cream-300)",
                  }}>
                    {label}
                  </span>
                  <StarRating
                    value={ratings[key as keyof RatingState]}
                    onChange={(v) => setRatings((r) => ({ ...r, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Written feedback */}
          <div style={{
            background: "var(--onyx-900)",
            border: "1px solid var(--onyx-700)",
            borderRadius: 2, padding: "20px",
            boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
          }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 14,
            }}>
              Written Feedback
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--onyx-500)", marginBottom: 6,
                }}>
                  What went well? <span style={{ color: "#e57373" }}>*</span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Describe the highlights of your experience in detail..."
                  value={form.highlightsFeedback}
                  onChange={(e) => setForm((f) => ({ ...f, highlightsFeedback: e.target.value }))}
                  required
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--onyx-500)", marginBottom: 6,
                }}>
                  What could be improved? <span style={{ opacity: 0.5 }}>(optional)</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Any areas where the experience could be elevated..."
                  value={form.improvementFeedback}
                  onChange={(e) => setForm((f) => ({ ...f, improvementFeedback: e.target.value }))}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--onyx-500)", marginBottom: 6,
                }}>
                  Notes on specific staff members <span style={{ opacity: 0.5 }}>(optional)</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Any standout moments with individual team members..."
                  value={form.staffFeedback}
                  onChange={(e) => setForm((f) => ({ ...f, staffFeedback: e.target.value }))}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>

              {/* Would return */}
              <div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--onyx-500)", marginBottom: 10,
                }}>
                  Would you return as a regular client? <span style={{ color: "#e57373" }}>*</span>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {[{ label: "Yes, absolutely", val: true }, { label: "No", val: false }].map(({ label, val }) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, wouldReturn: val }))}
                      style={{
                        flex: 1, padding: "10px",
                        background: "transparent",
                        border: form.wouldReturn === val
                          ? "1px solid rgba(201,168,92,0.8)"
                          : "1px solid var(--onyx-700)",
                        borderRadius: 2, cursor: "pointer",
                        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                        fontSize: 11, letterSpacing: "0.1em",
                        color: form.wouldReturn === val ? "var(--gold-400)" : "var(--onyx-500)",
                        transition: "all 0.15s",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {submit.error && (
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 12, color: "#e57373",
            }}>
              {submit.error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submit.isPending}
            style={{
              width: "100%",
              padding: "15px 20px",
              background: "transparent",
              border: "1px solid rgba(201,168,92,0.55)",
              borderRadius: 2, cursor: (canSubmit && !submit.isPending) ? "pointer" : "default",
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 19, fontWeight: 300, fontStyle: "italic",
              color: "var(--gold-400)",
              boxShadow: "4px 6px 0 rgba(0,0,0,0.6)",
              opacity: (canSubmit && !submit.isPending) ? 1 : 0.4,
            }}
          >
            {submit.isPending ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "var(--onyx-950)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 18, fontStyle: "italic", color: "var(--onyx-600)" }}>Loading…</span>
      </div>
    }>
      <SubmitPageInner />
    </Suspense>
  );
}
