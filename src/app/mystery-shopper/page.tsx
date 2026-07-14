import Link from "next/link";
import { brand } from "@/lib/brand";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Apply",
    desc: "Sign up as a mystery shopper and tell us which treatment you'd like to evaluate.",
  },
  {
    step: "02",
    title: "Visit",
    desc: "Book and enjoy your treatment at the salon. Keep your receipt — you'll need it.",
  },
  {
    step: "03",
    title: "Review",
    desc: "Upload your receipt and fill out a detailed experience report after your visit.",
  },
  {
    step: "04",
    title: "Get Reimbursed",
    desc: "Once approved, we'll reimburse the cost of your treatment. Simple as that.",
  },
];

const WHAT_WE_EVALUATE = [
  "Welcome & first impression",
  "Cleanliness and ambiance",
  "Treatment quality",
  "Staff friendliness & professionalism",
  "Product knowledge",
  "Overall value for money",
];

export default function MysteryShopperLandingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#ffffff" }}>

      {/* Hero */}
      <div style={{ padding: "72px 24px 56px", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          fontFamily: "var(--font-abel), Abel, sans-serif",
          fontSize: 11, letterSpacing: "0.34em", textTransform: "uppercase",
          color: "#c98d82", marginBottom: 16,
        }}>
          Mystery Shopper Programme
        </div>
        <h1 style={{
          fontFamily: "var(--font-marcellus), Marcellus, serif",
          fontSize: 48, fontWeight: 400,
          color: "#232122", lineHeight: 1.05, marginBottom: 20,
        }}>
          Experience {brand.name}.<br />Tell us how it felt.
        </h1>
        <p style={{
          fontFamily: "var(--font-abel), Abel, sans-serif",
          fontSize: 15, letterSpacing: "0.04em", lineHeight: 1.7,
          color: "#4a4547", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px",
        }}>
          We&apos;re always looking to raise the bar. Mystery shoppers visit our salons as regular clients,
          evaluate the full experience, and get reimbursed for their treatment.
        </p>
        <Link href="/mystery-shopper/apply" style={{
          fontFamily: "var(--font-abel), Abel, sans-serif",
          fontSize: 13, fontWeight: 400, textTransform: "uppercase",
          color: "#ffffff", textDecoration: "none",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          padding: "14px 36px", letterSpacing: "0.14em",
          background: "#232122",
          border: "1px solid #232122",
          borderRadius: 2,
        }}>
          Apply to be a Mystery Shopper
        </Link>
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: "#efdcd8", margin: "0 24px 56px" }} />

      {/* How it works */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{
          fontFamily: "var(--font-abel), Abel, sans-serif",
          fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "#c98d82", marginBottom: 28, textAlign: "center",
        }}>
          How It Works
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} style={{
              background: "#ffffff",
              border: "1px solid #efdcd8",
              borderRadius: 2, padding: "20px 24px",
              display: "flex", gap: 20, alignItems: "flex-start",
              boxShadow: "0 10px 30px rgba(35,33,34,0.07)",
            }}>
              <div style={{
                fontFamily: "var(--font-abel), Abel, sans-serif",
                fontSize: 12, fontWeight: 400, letterSpacing: "0.12em",
                color: "#fe329c", flexShrink: 0, marginTop: 2, width: 24,
              }}>
                {item.step}
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--font-marcellus), Marcellus, serif",
                  fontSize: 20, fontWeight: 400,
                  color: "#232122", marginBottom: 4,
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontFamily: "var(--font-abel), Abel, sans-serif",
                  fontSize: 14, color: "#4a4547", lineHeight: 1.6,
                }}>
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* What we evaluate */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 72px" }}>
        <div style={{
          background: "#faf6f5",
          border: "1px solid #efdcd8",
          borderRadius: 2, padding: "28px 28px",
        }}>
          <div style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "#8d8e8f", marginBottom: 18,
          }}>
            What You&apos;ll Evaluate
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {WHAT_WE_EVALUATE.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#fe329c", flexShrink: 0 }} />
                <span style={{
                  fontFamily: "var(--font-marcellus), Marcellus, serif",
                  fontSize: 16, fontWeight: 400,
                  color: "#4a4547",
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link href="/mystery-shopper/apply" style={{
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#fe329c", textDecoration: "none",
              display: "inline-block",
              padding: "10px 22px",
              background: "transparent",
              border: "1px solid #fe329c",
              borderRadius: 2,
            }}>
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
