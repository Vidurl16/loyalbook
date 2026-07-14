import Link from "next/link";
import { brand } from "@/lib/brand";

export default function HomePage() {
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden"
      style={{ background: "#ffffff" }}
    >
      {/* Paint-drip accent bar — echoes the logo's colourful drips */}
      <div className="absolute top-0 left-0 right-0 flex" style={{ height: "3px" }}>
        <div style={{ flex: 1, background: "#fe329c" }} />
        <div style={{ flex: 1, background: "#e8bab3" }} />
        <div style={{ flex: 1, background: "#232122" }} />
        <div style={{ flex: 1, background: "#e8bab3" }} />
        <div style={{ flex: 1, background: "#fe329c" }} />
      </div>

      {/* Soft blush wash behind the hero */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(560px, 92vw)",
          height: "320px",
          background: "#faf6f5",
          borderRadius: "4px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p
          style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: "11px",
            letterSpacing: "0.35em",
            color: "#c98d82",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          Durban North · KwaZulu-Natal
        </p>

        {/* Logo wordmark — plain img so a remote NEXT_PUBLIC_BRAND_LOGO needs no image-domain config */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={brand.logoUrl}
          alt={brand.name}
          style={{ width: "min(300px, 72vw)", height: "auto", marginBottom: "8px" }}
        />

        {/* Divider with shimmer */}
        <div className="my-7" style={{ position: "relative", width: "180px", height: "1px" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#e8bab3",
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
              background: "#fe329c",
              borderRadius: "1px",
              rotate: "45deg",
            }}
          />
        </div>

        <p
          className="font-script"
          style={{
            fontSize: "clamp(20px, 4.5vw, 26px)",
            color: "#4a4547",
            marginBottom: "44px",
          }}
        >
          Where beauty comes alive
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/book"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "#232122",
              color: "#ffffff",
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: "12px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              padding: "14px 32px",
              borderRadius: "2px",
              border: "1px solid #232122",
              textDecoration: "none",
              minWidth: "200px",
              justifyContent: "center",
            }}
          >
            Book a Treatment
          </Link>

          <Link
            href="/gallery"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "transparent",
              color: "#fe329c",
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: "12px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              padding: "13px 32px",
              borderRadius: "2px",
              border: "1px solid #fe329c",
              textDecoration: "none",
              minWidth: "200px",
              justifyContent: "center",
            }}
          >
            Explore The Gallery
          </Link>
        </div>

        {/* Loyalty nudge */}
        <p
          style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: "12px",
            letterSpacing: "0.08em",
            color: "#8d8e8f",
            marginTop: "28px",
          }}
        >
          Members earn points on every visit —{" "}
          <Link href="/signup" style={{ color: "#fe329c", textDecoration: "none" }}>
            join free
          </Link>
        </p>
      </div>

      {/* Bottom rule */}
      <div className="absolute bottom-16 left-0 right-0 flex items-center px-8 gap-4">
        <div style={{ flex: 1, height: "1px", background: "#efdcd8" }} />
        <p
          style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "#c98d82",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          34 Beachway Place · Durban North
        </p>
        <div style={{ flex: 1, height: "1px", background: "#efdcd8" }} />
      </div>
    </main>
  );
}
