import Link from "next/link";

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
    <main style={{ minHeight: "100vh", background: "var(--onyx-950)" }}>

      {/* Hero */}
      <div style={{ padding: "72px 24px 56px", maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 8, letterSpacing: "0.34em", textTransform: "uppercase",
          color: "var(--gold-400)", marginBottom: 16,
        }}>
          Mystery Shopper Programme
        </div>
        <h1 style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 48, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-100)", lineHeight: 1.05, marginBottom: 20,
        }}>
          Experience Perfect 10.<br />Tell us how it felt.
        </h1>
        <p style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 14, letterSpacing: "0.04em", lineHeight: 1.7,
          color: "var(--cream-400)", marginBottom: 36, maxWidth: 480, margin: "0 auto 36px",
        }}>
          We&apos;re always looking to raise the bar. Mystery shoppers visit our salons as regular clients,
          evaluate the full experience, and get reimbursed for their treatment.
        </p>
        <Link href="/mystery-shopper/apply" style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 20, fontWeight: 300, fontStyle: "italic",
          color: "var(--gold-400)", textDecoration: "none",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          padding: "14px 36px",
          border: "1px solid rgba(201,168,92,0.55)",
          borderRadius: 2,
          boxShadow: "4px 6px 0 rgba(0,0,0,0.65)",
        }}>
          Apply to be a Mystery Shopper
        </Link>
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-700) 20%,var(--onyx-700) 80%,transparent)", margin: "0 24px 56px" }} />

      {/* How it works */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 56px" }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "var(--gold-400)", marginBottom: 28, textAlign: "center",
        }}>
          How It Works
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} style={{
              background: "var(--onyx-900)",
              border: "1px solid var(--onyx-700)",
              borderRadius: 2, padding: "20px 24px",
              display: "flex", gap: 20, alignItems: "flex-start",
              boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
            }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
                color: "var(--gold-400)", flexShrink: 0, marginTop: 2, width: 24,
              }}>
                {item.step}
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 20, fontWeight: 300, fontStyle: "italic",
                  color: "var(--cream-100)", marginBottom: 4,
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 13, color: "var(--cream-400)", lineHeight: 1.6,
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
          background: "var(--onyx-900)",
          border: "1px solid var(--onyx-700)",
          borderRadius: 2, padding: "28px 28px",
          boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
        }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--onyx-500)", marginBottom: 18,
          }}>
            What You&apos;ll Evaluate
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {WHAT_WE_EVALUATE.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--gold-400)", flexShrink: 0 }} />
                <span style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 16, fontWeight: 300, fontStyle: "italic",
                  color: "var(--cream-300)",
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Link href="/mystery-shopper/apply" style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--gold-400)", textDecoration: "none",
              display: "inline-block",
              padding: "10px 22px",
              border: "1px solid rgba(201,168,92,0.45)",
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
