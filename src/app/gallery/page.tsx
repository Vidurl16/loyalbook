"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CategoryFilter } from "@/components/gallery/CategoryFilter";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryOverlay } from "@/components/gallery/GalleryOverlay";
import type { GalleryItemData } from "@/components/gallery/GalleryCard";
import Link from "next/link";

const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID ?? "";

const DEMO_ITEMS: GalleryItemData[] = [
  { id: "d0",  category: "Nails",   title: "Noir Sculptural Set",   therapist: "Valentina R.", price: 185, durationMins: 75,  isTall: true,  sortOrder: 0,  imageUrl: null, description: "Long-form gel sculpture in matte obsidian with champagne foil accents. Precision filing, cuticle care, and editorial finish." },
  { id: "d1",  category: "Nails",   title: "Champagne Foil Tips",   therapist: "Mara D.",      price: 145, durationMins: 60,  isTall: false, sortOrder: 1,  imageUrl: null, description: "Classic French architecture with 24k foil tape detail. Soft gel overlay, refined and luminous." },
  { id: "d2",  category: "Facials", title: "Luminous Lift Facial",  therapist: "Sofia K.",     price: 220, durationMins: 90,  isTall: true,  sortOrder: 2,  imageUrl: null, description: "Deep-tissue lymphatic drainage, peptide infusion mask, and high-frequency sculpting. Your skin, re-lit." },
  { id: "d3",  category: "Lashes",  title: "Lash Lift & Tint",      therapist: "Elena V.",     price: 110, durationMins: 60,  isTall: false, sortOrder: 3,  imageUrl: null, description: "Keratin wave lift and jet-black botanical tint. Open-eye effect that lasts 8 weeks." },
  { id: "d4",  category: "Waxing",  title: "Full Body Silhouette",  therapist: "Inès M.",      price: 165, durationMins: 80,  isTall: false, sortOrder: 4,  imageUrl: null, description: "Head-to-toe waxing ritual using warm honey wax. Skin left impossibly smooth." },
  { id: "d5",  category: "Massage", title: "Warm Marble Stone",     therapist: "Leila K.",     price: 195, durationMins: 90,  isTall: true,  sortOrder: 5,  imageUrl: null, description: "Heated black marble stones and warm oil poured along the spine. Deeply restorative." },
  { id: "d6",  category: "Nails",   title: "Ivory Gel French",      therapist: "Valentina R.", price: 130, durationMins: 60,  isTall: false, sortOrder: 6,  imageUrl: null, description: "Sheer ivory gel base with a whisper-thin white tip. The original. Perfected." },
  { id: "d7",  category: "Facials", title: "Amber Radiance",        therapist: "Sofia K.",     price: 195, durationMins: 75,  isTall: true,  sortOrder: 7,  imageUrl: null, description: "Jojoba microdermabrasion, hyaluronic plumping serum, and a warming amber mask." },
  { id: "d8",  category: "Lashes",  title: "Volume Fan Set",        therapist: "Elena V.",     price: 175, durationMins: 120, isTall: false, sortOrder: 8,  imageUrl: null, description: "Russian volume fans, 3D to 6D. Handmade from mink-finish silk. Weightless yet dramatic." },
  { id: "d9",  category: "Massage", title: "Bronze Body Ritual",    therapist: "Leila K.",     price: 240, durationMins: 110, isTall: true,  sortOrder: 9,  imageUrl: null, description: "Full body exfoliation, warm oil immersion, and a bronze sheen finishing oil." },
  { id: "d10", category: "Nails",   title: "Obsidian Matte Set",    therapist: "Mara D.",      price: 155, durationMins: 70,  isTall: false, sortOrder: 10, imageUrl: null, description: "Matte black gel sculpt with geometric negative space and gold leaf detail." },
  { id: "d11", category: "Waxing",  title: "Intimate Wax Ritual",   therapist: "Inès M.",      price: 85,  durationMins: 45,  isTall: false, sortOrder: 11, imageUrl: null, description: "Brazilian wax using comfort cream. Followed by a calming rosewater compress." },
];

const CATEGORIES = ["All", "Nails", "Facials", "Lashes", "Waxing", "Massage"];

function EmptyState({ filter }: { filter: string }) {
  return (
    <div style={{ padding: "52px 32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 32, height: 1, background: "var(--gold-400)", opacity: 0.3, marginBottom: 24 }} />
      <div style={{
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase",
        color: "var(--gold-400)", marginBottom: 10,
      }}>
        {filter}
      </div>
      <h2 style={{
        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
        fontSize: 28, fontWeight: 300, fontStyle: "italic",
        color: "var(--cream-200)", lineHeight: 1.1, textAlign: "center", marginBottom: 14,
      }}>
        Coming Soon
      </h2>
      <p style={{
        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
        fontSize: 15, fontWeight: 300, color: "var(--cream-400)",
        lineHeight: 1.75, textAlign: "center", maxWidth: 260,
      }}>
        Our artists are preparing something extraordinary for this collection.
      </p>
      <div style={{ width: 32, height: 1, background: "var(--gold-400)", opacity: 0.3, marginTop: 24 }} />
    </div>
  );
}

export default function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState<GalleryItemData | null>(null);
  const [expandedIndex, setExpandedIndex] = useState(0);

  const { data: liveItems } = trpc.gallery.list.useQuery(
    { locationId: LOCATION_ID, category: filter },
    { enabled: !!LOCATION_ID, retry: false }
  );

  const items: GalleryItemData[] = (() => {
    if (liveItems && liveItems.length > 0) return liveItems as GalleryItemData[];
    if (filter === "All") return DEMO_ITEMS;
    const filtered = DEMO_ITEMS.filter((i) => i.category === filter);
    return filtered;
  })();

  function handleTap(item: GalleryItemData) {
    const idx = items.findIndex((i) => i.id === item.id);
    setExpandedIndex(idx >= 0 ? idx : 0);
    setExpanded(item);
  }

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
      <div style={{ padding: "40px 20px 0" }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "var(--gold-400)", marginBottom: 6,
        }}>
          Perfect 10
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8, marginBottom: 14 }}>
          <h1 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(34px, 9vw, 48px)", fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", lineHeight: 1, letterSpacing: "0.01em",
          }}>
            The Gallery
          </h1>
          <button style={{
            width: 32, height: 32, flexShrink: 0, borderRadius: 2,
            background: "transparent", border: "1px solid var(--onyx-600)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginBottom: 4,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="var(--onyx-500)" strokeWidth="1.6" />
              <path d="M15.5 15.5L21 21" stroke="var(--onyx-500)" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <p style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 15, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-400)", lineHeight: 1.7, letterSpacing: "0.01em",
          marginBottom: 14,
        }}>
          Every image here is a result. Tap any look to meet the artist behind it.
        </p>

        {/* Filter bar */}
        <div style={{ borderBottom: "1px solid var(--onyx-700)", paddingBottom: 10 }}>
          <CategoryFilter active={filter} onChange={setFilter} />
        </div>
      </div>

      {/* Grid or empty state */}
      {items.length > 0 ? (
        <GalleryGrid items={items} onTap={handleTap} />
      ) : (
        <EmptyState filter={filter} />
      )}

      {/* Expanded overlay */}
      {expanded && (
        <GalleryOverlay
          item={expanded}
          index={expandedIndex}
          onClose={() => setExpanded(null)}
        />
      )}
    </main>
  );
}
