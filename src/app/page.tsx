import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
      style={{ background: "#0e0c0a" }}
    >
      {/* Subtle background texture — fine diagonal lines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(201,168,92,0.02) 40px, rgba(201,168,92,0.02) 41px)",
        }}
      />

      {/* Top gold rule */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "2px", background: "#c9a85c" }}
      />

      {/* Wordmark */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p
          style={{
            fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.35em",
            color: "#c9a85c",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}
        >
          Ballito &nbsp;·&nbsp; La Lucia
        </p>

        <h1
          style={{
            fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
            fontSize: "clamp(52px, 12vw, 96px)",
            fontWeight: 300,
            color: "#f5f0e8",
            letterSpacing: "-0.01em",
            lineHeight: 1,
            margin: 0,
          }}
        >
          Perfect 10
        </h1>

        {/* Animated gold divider */}
        <div
          className="my-8"
          style={{ position: "relative", width: "180px", height: "1px" }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(90deg, transparent, #c9a85c, transparent)",
              animation: "shimmer 3s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "-2px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "5px",
              height: "5px",
              background: "#c9a85c",
              borderRadius: "1px",
              rotate: "45deg",
            }}
          />
        </div>

        <p
          style={{
            fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
            fontSize: "clamp(18px, 4vw, 24px)",
            fontWeight: 300,
            fontStyle: "italic",
            color: "#8a6f3e",
            letterSpacing: "0.02em",
            marginBottom: "48px",
          }}
        >
          Where every visit is a 10.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/gallery"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#c9a85c",
              color: "#0e0c0a",
              fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "14px 32px",
              borderRadius: "2px",
              textDecoration: "none",
              minWidth: "200px",
              justifyContent: "center",
            }}
          >
            Explore The Gallery
          </Link>

          <Link
            href="/book"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "transparent",
              color: "#c9a85c",
              fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "13px 32px",
              borderRadius: "2px",
              border: "1px solid #c9a85c",
              textDecoration: "none",
              minWidth: "200px",
              justifyContent: "center",
            }}
          >
            Book a Treatment
          </Link>
        </div>
      </div>

      {/* Bottom gold rule */}
      <div
        className="absolute bottom-16 left-0 right-0 flex items-center px-8 gap-4"
      >
        <div style={{ flex: 1, height: "1px", background: "#1a1714" }} />
        <p
          style={{
            fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "#2a2420",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Est. KwaZulu-Natal
        </p>
        <div style={{ flex: 1, height: "1px", background: "#1a1714" }} />
      </div>

    </main>
  );
}
