import Link from "next/link";

const FONT_BODY = "var(--font-abel), Abel, sans-serif";
const FONT_DISPLAY = "var(--font-marcellus), Marcellus, serif";

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
      background: "#ffffff",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Check mark */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            border: "1.5px solid #e8bab3",
            background: "#f7eae7",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 12l5 5L19 7" stroke="#fe329c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: 9, letterSpacing: "0.32em", textTransform: "uppercase",
            color: "#d41d7f", marginBottom: 8,
          }}>
            Booking Confirmed
          </div>
          <h1 style={{
            fontFamily: FONT_DISPLAY,
            fontSize: 40, fontWeight: 400,
            color: "#232122", lineHeight: 1.1, marginBottom: 12,
          }}>
            See you soon.
          </h1>
          <p style={{
            fontFamily: FONT_BODY,
            fontSize: 15, fontWeight: 400, color: "#4a4547",
            lineHeight: 1.7, letterSpacing: "0.02em",
          }}>
            A confirmation has been sent. We look forward to welcoming you.
          </p>
        </div>

        {/* Points earned notice */}
        {earnedPoints > 0 && (
          <div style={{
            background: "#f7eae7",
            border: "1px solid #e8bab3",
            borderLeft: "2px solid #fe329c",
            borderRadius: 2, padding: "14px 18px",
            display: "flex", alignItems: "center", gap: 14,
            marginBottom: 16,
          }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fe329c" }} />
            </div>
            <div>
              <div style={{
                fontFamily: FONT_BODY,
                fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase",
                color: "#c98d82", marginBottom: 3,
              }}>
                Points Incoming
              </div>
              <div style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 16, fontWeight: 400,
                color: "#232122",
              }}>
                ~{earnedPoints} points credited once your treatment is complete
              </div>
            </div>
          </div>
        )}

        {/* Prepare notice */}
        <div style={{
          background: "#faf6f5",
          border: "1px solid #efdcd8",
          borderRadius: 2, padding: "14px 18px",
          marginBottom: 28,
        }}>
          <div style={{
            fontFamily: FONT_BODY,
            fontSize: 9, letterSpacing: "0.24em", textTransform: "uppercase",
            color: "#8d8e8f", marginBottom: 10,
          }}>
            Before your visit
          </div>
          {[
            "Arrive 10 minutes early for a relaxed check-in",
            "Avoid heavy meals 1–2 hours before your treatment",
            "Remove makeup before facial appointments if possible",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 2 ? 8 : 0 }}>
              <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#e8bab3", marginTop: 8, flexShrink: 0 }} />
              <span style={{
                fontFamily: FONT_BODY,
                fontSize: 14, fontWeight: 400, color: "#4a4547", lineHeight: 1.6,
              }}>
                {tip}
              </span>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: "#efdcd8", marginBottom: 20 }} />

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Link href="/account/bookings" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "15px 20px",
            background: "#232122",
            border: "1px solid #232122",
            borderRadius: 2, textDecoration: "none",
            fontFamily: FONT_BODY,
            fontSize: 13, fontWeight: 400,
            letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#ffffff",
          }}>
            View my bookings
          </Link>
          <Link href="/book" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "13px 20px",
            background: "transparent",
            border: "1px solid #fe329c",
            borderRadius: 2, textDecoration: "none",
            fontFamily: FONT_BODY,
            fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#d41d7f",
          }}>
            Book Another Treatment
          </Link>
          <Link href="/" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "10px 20px",
            textDecoration: "none",
            fontFamily: FONT_BODY,
            fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#8d8e8f",
          }}>
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
