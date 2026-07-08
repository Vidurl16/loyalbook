import Link from "next/link";

export default async function BookConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; pts?: string }>;
}) {
  const params = await searchParams;
  const earnedPoints = Number(params.pts ?? 0);

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px",
      background: "var(--onyx-950)",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Gold check mark */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
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

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 8, letterSpacing: "0.32em", textTransform: "uppercase",
            color: "var(--gold-400)", marginBottom: 8,
          }}>
            Booking Confirmed
          </div>
          <h1 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 40, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", lineHeight: 1, marginBottom: 12,
          }}>
            See you soon.
          </h1>
          <p style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 16, fontWeight: 300, color: "var(--cream-400)",
            lineHeight: 1.7, letterSpacing: "0.02em",
          }}>
            A confirmation has been sent. We look forward to welcoming you.
          </p>
        </div>

        {/* Points earned notice */}
        {earnedPoints > 0 && (
          <div style={{
            background: "var(--onyx-900)",
            border: "1px solid rgba(201,168,92,0.32)",
            borderLeft: "2px solid var(--gold-400)",
            borderRadius: 2, padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 14,
            marginBottom: 16,
            boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
          }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold-400)" }} />
            </div>
            <div>
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase",
                color: "var(--gold-400)", marginBottom: 3,
              }}>
                Points Incoming
              </div>
              <div style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 16, fontWeight: 300, fontStyle: "italic",
                color: "var(--cream-200)",
              }}>
                ~{earnedPoints} points credited once your treatment is complete
              </div>
            </div>
          </div>
        )}

        {/* Prepare notice */}
        <div style={{
          background: "var(--onyx-900)",
          border: "1px solid var(--onyx-700)",
          borderRadius: 2, padding: "14px 18px",
          marginBottom: 28,
          boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
        }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase",
            color: "var(--onyx-500)", marginBottom: 10,
          }}>
            Before your visit
          </div>
          {[
            "Arrive 10 minutes early for a relaxed check-in",
            "Avoid heavy meals 1–2 hours before your treatment",
            "Remove makeup before facial appointments if possible",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--onyx-600)", marginTop: 7, flexShrink: 0 }} />
              <span style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 14, fontWeight: 300, color: "var(--cream-400)", lineHeight: 1.6,
              }}>
                {tip}
              </span>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-600) 20%,var(--onyx-600) 80%,transparent)", marginBottom: 20 }} />

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/account/journey" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "15px 20px",
            background: "transparent",
            border: "1px solid rgba(201,168,92,0.55)",
            borderRadius: 2, textDecoration: "none",
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 19, fontWeight: 300, fontStyle: "italic",
            color: "var(--gold-400)",
            boxShadow: "4px 6px 0 rgba(0,0,0,0.6)",
          }}>
            View My Journey
          </Link>
          <Link href="/book" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "13px 20px",
            background: "transparent",
            border: "1px solid var(--onyx-700)",
            borderRadius: 2, textDecoration: "none",
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--cream-400)",
          }}>
            Book Another Treatment
          </Link>
          <Link href="/" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "10px 20px",
            textDecoration: "none",
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--onyx-500)",
          }}>
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
