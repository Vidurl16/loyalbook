"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { CategoryFilter } from "@/components/gallery/CategoryFilter";
import { TransformationCard, type TransformationData } from "@/components/transformations/TransformationCard";

const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID ?? "";

const DEMO_TRANSFORMATIONS: TransformationData[] = [
  {
    id: "t0", category: "Nails",   service: "Noir Sculptural Set",
    therapist: "Valentina R.", rating: 10,
    appointmentDate: new Date(), beforePhotoIndex: 10, afterPhotoIndex: 0,
    description: "Long-form gel sculpture in matte obsidian with champagne foil accents.",
  },
  {
    id: "t1", category: "Facials", service: "Luminous Lift Facial",
    therapist: "Sofia K.", rating: 10,
    appointmentDate: new Date(Date.now() - 86400000), beforePhotoIndex: 2, afterPhotoIndex: 7,
    description: "Peptide infusion mask and high-frequency sculpting. Your skin, re-lit.",
  },
  {
    id: "t2", category: "Massage", service: "Warm Marble Stone",
    therapist: "Leila K.", rating: 10,
    appointmentDate: new Date(Date.now() - 172800000), beforePhotoIndex: 5, afterPhotoIndex: 9,
    description: "Heated black marble stones and warm oil poured along the spine.",
  },
  {
    id: "t3", category: "Lashes",  service: "Lash Lift & Tint",
    therapist: "Elena V.", rating: 10,
    appointmentDate: new Date(Date.now() - 259200000), beforePhotoIndex: 3, afterPhotoIndex: 8,
    description: "Keratin wave lift and jet-black botanical tint. Open-eye effect that lasts 8 weeks.",
  },
  {
    id: "t4", category: "Nails",   service: "Ivory Gel French",
    therapist: "Valentina R.", rating: 10,
    appointmentDate: new Date(Date.now() - 604800000), beforePhotoIndex: 6, afterPhotoIndex: 1,
    description: "Sheer ivory gel base with a whisper-thin white tip. The original. Perfected.",
  },
  {
    id: "t5", category: "Waxing",  service: "Full Body Silhouette",
    therapist: "Inès M.", rating: 10,
    appointmentDate: new Date(Date.now() - 864000000), beforePhotoIndex: 4, afterPhotoIndex: 11,
    description: "Head-to-toe waxing ritual using warm honey wax. Skin left impossibly smooth.",
  },
];

export default function TransformationsPage() {
  const [filter, setFilter] = useState("All");

  const { data: liveItems } = trpc.transformations.list.useQuery(
    { locationId: LOCATION_ID, category: filter },
    { enabled: !!LOCATION_ID, retry: false }
  );

  const items: TransformationData[] = (() => {
    if (liveItems && liveItems.length > 0) return liveItems as TransformationData[];
    if (filter === "All") return DEMO_TRANSFORMATIONS;
    return DEMO_TRANSFORMATIONS.filter((i) => i.category === filter);
  })();

  const [featured, ...rest] = items;

  return (
    <main style={{ minHeight: "100vh", background: "var(--onyx-950)" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "var(--onyx-950)",
        borderBottom: "1px solid var(--onyx-700)",
        padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 52,
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 18, fontWeight: 300, fontStyle: "italic",
          color: "var(--gold-400)", textDecoration: "none", letterSpacing: "0.04em",
        }}>
          Perfect 10
        </Link>
        <Link href="/book" style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--cream-400)", textDecoration: "none",
          padding: "6px 14px",
          border: "1px solid var(--onyx-600)",
          borderRadius: 2,
        }}>
          Book
        </Link>
      </nav>

      {/* Header */}
      <div style={{ padding: "40px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--gold-400)", fontWeight: 500, marginBottom: 6,
          }}>
            This is your moment
          </div>
          <h1 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(32px, 9vw, 48px)", fontWeight: 300, lineHeight: 0.95,
            letterSpacing: "0.01em",
          }}>
            <em style={{ fontStyle: "italic", color: "var(--cream-200)" }}>Transformation</em>{" "}
            <em style={{ fontStyle: "italic", color: "var(--gold-400)" }}>Hub</em>
          </h1>
        </div>

        {/* Sparkle button */}
        <button style={{
          width: 34, height: 34, borderRadius: 2,
          background: "transparent", border: "1px solid var(--onyx-600)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", flexShrink: 0, marginBottom: 4,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
              stroke="var(--onyx-500)" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Editorial caption */}
      <p style={{
        padding: "10px 20px 0",
        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
        fontSize: 15, fontWeight: 300, fontStyle: "italic",
        color: "var(--cream-400)", lineHeight: 1.7, letterSpacing: "0.01em",
      }}>
        Every result tells a story. Drag the slider to see the before and after.
      </p>

      {/* Filter bar */}
      <div style={{ padding: "14px 20px 0" }}>
        <div style={{ borderBottom: "1px solid var(--onyx-700)", paddingBottom: 10 }}>
          <CategoryFilter active={filter} onChange={setFilter} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px 48px" }}>
        {items.length === 0 ? (
          <div style={{ padding: "52px 32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 32, height: 1, background: "var(--gold-400)", opacity: 0.3, marginBottom: 24 }} />
            <h2 style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 300, fontStyle: "italic", color: "var(--cream-200)", textAlign: "center", marginBottom: 14 }}>
              Coming Soon
            </h2>
            <p style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontSize: 15, fontWeight: 300, color: "var(--cream-400)", lineHeight: 1.75, textAlign: "center", maxWidth: 260 }}>
              Our artists are preparing something extraordinary.
            </p>
            <div style={{ width: 32, height: 1, background: "var(--gold-400)", opacity: 0.3, marginTop: 24 }} />
          </div>
        ) : (
          <>
            {/* Featured — full experience with particles + breathe */}
            {featured && (
              <>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
                  color: "var(--onyx-500)", marginBottom: 10,
                }}>
                  Featured
                </div>
                <TransformationCard item={featured} featured sliderHeight={272} />
              </>
            )}

            {/* Remaining — compact */}
            {rest.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 16px" }}>
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-600))" }} />
                  <span style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--onyx-500)" }}>More Transformations</span>
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,var(--onyx-600),transparent)" }} />
                </div>
                {rest.map((item) => (
                  <TransformationCard key={item.id} item={item} sliderHeight={200} />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
