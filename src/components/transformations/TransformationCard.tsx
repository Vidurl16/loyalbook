"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { ParticleBurst } from "./ParticleBurst";

export interface TransformationData {
  id: string;
  category: string;
  service: string;
  therapist: string;
  description?: string | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  rating?: number | null;
  appointmentDate?: Date | string;
  beforePhotoIndex?: number;
  afterPhotoIndex?: number;
}

interface TransformationCardProps {
  item: TransformationData;
  featured?: boolean;
  sliderHeight?: number;
}

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div style={{
      position: "absolute",
      bottom: visible ? 52 : 32,
      left: "50%", transform: "translateX(-50%)",
      background: "var(--onyx-800)",
      border: "1px solid rgba(201,168,92,0.38)",
      borderRadius: 100,
      padding: "9px 18px",
      display: "flex", alignItems: "center", gap: 8,
      whiteSpace: "nowrap",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.2s ease, bottom 0.22s cubic-bezier(0.16,1,0.3,1)",
      pointerEvents: "none", zIndex: 200,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold-400)" }} />
      <span style={{
        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
        fontSize: 14, fontStyle: "italic", fontWeight: 300,
        color: "var(--cream-100)", letterSpacing: "0.04em",
      }}>
        {message}
      </span>
    </div>
  );
}

export function TransformationCard({
  item,
  featured = false,
  sliderHeight = 240,
}: TransformationCardProps) {
  const [burst, setBurst] = useState(0);
  const [published, setPublished] = useState(false);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [breathe, setBreathe] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!featured) return;
    const t = setTimeout(() => { setBurst((b) => b + 1); setBreathe(true); }, 700);
    return () => clearTimeout(t);
  }, [featured]);

  function showToast(msg: string) {
    setToast({ msg, show: true });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
  }

  function handlePublish() {
    if (published) return;
    setPublished(true);
    setBurst((b) => b + 1);
    setBreathe(false);
    showToast("Your moment is live ✦");
  }

  function handleSave() {
    if (saved) return;
    setSaved(true);
    showToast("Cherished in your journey");
  }

  const dateLabel = item.appointmentDate
    ? new Date(item.appointmentDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })
    : "Today";

  return (
    <div
      ref={cardRef}
      style={{
        position: "relative",
        background: "var(--onyx-950)",
        border: "1px solid var(--onyx-700)",
        borderRadius: 2,
        overflow: "hidden",
        marginBottom: 20,
      }}
    >
      {featured && <ParticleBurst trigger={burst} />}

      {/* Before / After slider */}
      <BeforeAfterSlider
        height={sliderHeight}
        beforeImageUrl={item.beforeImageUrl}
        afterImageUrl={item.afterImageUrl}
        beforePhotoIndex={item.beforePhotoIndex ?? 0}
        afterPhotoIndex={item.afterPhotoIndex ?? 1}
      />

      {/* Separator line */}
      <div style={{ height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,92,0.12) 40%,rgba(201,168,92,0.12) 60%,transparent)" }} />

      {/* Service info */}
      <div style={{ padding: "14px 20px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: 1 }}>
          {/* Category pill */}
          <div style={{
            display: "inline-block",
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--gold-400)",
            background: "rgba(14,12,10,0.78)",
            padding: "3px 8px", borderRadius: 2,
            border: "1px solid rgba(201,168,92,0.28)",
            marginBottom: 8,
          }}>
            {item.category}
          </div>
          <h2 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 22, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", lineHeight: 1.1, marginBottom: 5,
          }}>
            {item.service}
          </h2>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--cream-400)",
          }}>
            {item.therapist}&nbsp;·&nbsp;{dateLabel}
          </div>
        </div>

        {/* Rating */}
        {item.rating != null && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, paddingTop: 2, flexShrink: 0 }}>
            <div style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 26, fontWeight: 300, color: "var(--gold-400)", lineHeight: 1, letterSpacing: "-0.01em",
            }}>
              {item.rating}
              <span style={{ fontSize: 13, color: "var(--gold-500)", fontWeight: 300 }}>&thinsp;/&thinsp;10</span>
            </div>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} width="7" height="7" viewBox="0 0 10 10">
                  <polygon points="5,0 6.2,3.6 10,3.6 7,5.9 8.1,9.5 5,7.3 1.9,9.5 3,5.9 0,3.6 3.8,3.6" fill="var(--gold-400)" opacity="0.8" />
                </svg>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Separator */}
      <div style={{ margin: "14px 20px", height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-600) 20%,var(--onyx-600) 80%,transparent)" }} />

      {/* Post Your Moment CTA */}
      <div style={{ padding: "0 20px", marginBottom: 10 }}>
        <button
          onClick={handlePublish}
          style={{
            width: "100%", padding: "17px 20px",
            background: "transparent",
            border: published ? "1px solid var(--onyx-600)" : "1px solid rgba(201,168,92,0.58)",
            borderRadius: 2,
            cursor: published ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: published ? "2px 3px 0 rgba(0,0,0,0.5)" : "4px 6px 0 rgba(0,0,0,0.65)",
            animation: breathe && !published ? "transformBreathe 2.8s ease-in-out infinite" : "none",
            transition: "all 0.38s cubic-bezier(0.16,1,0.3,1)",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.03) 0%,transparent 55%)", pointerEvents: "none" }} />
          {published ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 22, height: 1, background: "var(--onyx-600)" }} />
              <span style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontSize: 17, fontWeight: 300, fontStyle: "italic", letterSpacing: "0.08em", color: "var(--cream-400)" }}>
                Your moment is live
              </span>
              <div style={{ width: 22, height: 1, background: "var(--onyx-600)" }} />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 16 }}>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,92,0.4))" }} />
              <span style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontSize: 21, fontWeight: 300, fontStyle: "italic", letterSpacing: "0.1em", color: "var(--gold-400)", whiteSpace: "nowrap" }}>
                Post Your Moment
              </span>
              <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(201,168,92,0.4),transparent)" }} />
            </div>
          )}
        </button>
        {!published && (
          <div style={{ textAlign: "center", marginTop: 7, fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--onyx-500)" }}>
            Watermarked · Instagram Ready
          </div>
        )}
      </div>

      {/* Add to My Journey */}
      <div style={{ padding: "0 20px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-600))" }} />
          <span style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--onyx-500)" }}>Treatment History</span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,var(--onyx-600),transparent)" }} />
        </div>

        <button
          onClick={handleSave}
          style={{
            width: "100%", padding: "16px 20px",
            background: saved ? "rgba(201,168,92,0.05)" : "transparent",
            border: `1px solid ${saved ? "rgba(201,168,92,0.38)" : "var(--onyx-600)"}`,
            borderRadius: 2, cursor: saved ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "2px 3px 0 rgba(0,0,0,0.5)",
            transition: "all 0.38s cubic-bezier(0.16,1,0.3,1)",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(255,255,255,0.025) 0%,transparent 50%)", pointerEvents: "none" }} />
          {saved ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 18, height: 1, background: "rgba(201,168,92,0.3)" }} />
              <span style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 300, fontStyle: "italic", letterSpacing: "0.07em", color: "var(--gold-400)" }}>Cherished in your journey</span>
              <div style={{ width: 18, height: 1, background: "rgba(201,168,92,0.3)" }} />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 18, height: 1, background: "rgba(85,79,70,0.55)" }} />
              <span style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontSize: 18, fontWeight: 300, fontStyle: "italic", letterSpacing: "0.07em", color: "var(--cream-400)" }}>Add to My Journey</span>
              <div style={{ width: 18, height: 1, background: "rgba(85,79,70,0.55)" }} />
            </div>
          )}
        </button>
      </div>

      {/* Journey tease — appears after save */}
      {saved && (
        <Link href="/account" style={{ textDecoration: "none" }}>
          <div style={{
            margin: "0 20px 14px",
            padding: "11px 16px",
            background: "var(--onyx-800)",
            border: "1px solid var(--onyx-600)",
            borderLeft: "2px solid rgba(201,168,92,0.42)",
            borderRadius: 2,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--gold-400)", marginBottom: 4 }}>Your History</div>
              <div style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 300, fontStyle: "italic", color: "var(--cream-300)", letterSpacing: "0.03em" }}>View your full story</div>
            </div>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 5l7 7-7 7" stroke="var(--onyx-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Link>
      )}

      {/* Book This Look footer */}
      <div style={{ borderTop: "1px solid var(--onyx-700)", padding: "12px 20px" }}>
        <Link
          href={`/book?category=${encodeURIComponent(item.category)}`}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "100%", padding: "13px 20px",
            background: "transparent",
            border: "1px solid rgba(201,168,92,0.35)",
            borderRadius: 2, cursor: "pointer",
            boxShadow: "4px 6px 0 rgba(0,0,0,0.6)",
            textDecoration: "none",
            transition: "transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) translateX(-1px)";
            (e.currentTarget as HTMLElement).style.boxShadow = "6px 10px 0 rgba(0,0,0,0.7)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "none";
            (e.currentTarget as HTMLElement).style.boxShadow = "4px 6px 0 rgba(0,0,0,0.6)";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 14 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,92,0.42))" }} />
            <span style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontSize: 17, fontWeight: 300, fontStyle: "italic", letterSpacing: "0.1em", color: "var(--gold-400)", whiteSpace: "nowrap" }}>
              Book This Look
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(201,168,92,0.42),transparent)" }} />
          </div>
        </Link>
      </div>

      {featured && <Toast message={toast.msg} visible={toast.show} />}

      <style>{`
        @keyframes transformBreathe {
          0%, 100% { box-shadow: 4px 6px 0px rgba(0,0,0,0.65), 0 0 0px rgba(201,168,92,0); }
          50%       { box-shadow: 4px 6px 0px rgba(0,0,0,0.65), 0 0 22px rgba(201,168,92,0.22); }
        }
      `}</style>
    </div>
  );
}
