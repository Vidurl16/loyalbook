"use client";

import { useState } from "react";
import { GalleryPhoto } from "./GalleryPhoto";

export interface GalleryItemData {
  id: string;
  category: string;
  title: string;
  therapist: string;
  price: number;
  durationMins: number;
  description?: string | null;
  imageUrl?: string | null;
  isTall: boolean;
  sortOrder: number;
}

interface GalleryCardProps {
  item: GalleryItemData;
  index: number;
  onTap: (item: GalleryItemData) => void;
}

export function GalleryCard({ item, index, onTap }: GalleryCardProps) {
  const [hovered, setHovered] = useState(false);
  const photoH = item.isTall ? 200 : 148;

  return (
    <div
      onClick={() => onTap(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        background: "var(--onyx-800)",
        boxShadow: hovered
          ? "8px 12px 0 rgba(0,0,0,0.85), 0 0 0 1px rgba(201,168,92,0.28)"
          : "6px 9px 0 rgba(0,0,0,0.72), 0 0 0 1px rgba(201,168,92,0.10)",
        transform: hovered ? "translateY(-4px) translateX(-2px)" : "none",
        transition: "transform 0.26s cubic-bezier(0.16,1,0.3,1), box-shadow 0.26s ease",
      }}
    >
      {/* Photo */}
      <div style={{ height: photoH, position: "relative", overflow: "hidden" }}>
        <div style={{
          width: "100%", height: "100%",
          transform: hovered ? "scale(1.035)" : "scale(1)",
          transition: "transform 0.55s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <GalleryPhoto index={index} imageUrl={item.imageUrl} />
        </div>

        {/* Category pill */}
        <div style={{
          position: "absolute", top: 8, left: 8,
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "var(--gold-400)",
          background: "rgba(14,12,10,0.78)",
          padding: "3px 8px", borderRadius: 2,
          border: "1px solid rgba(201,168,92,0.28)",
          zIndex: 5,
        }}>
          {item.category}
        </div>

        {/* "Book This Look" hover reveal */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 10px 9px",
          transform: hovered ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.22s cubic-bezier(0.16,1,0.3,1)",
          display: "flex", alignItems: "center", gap: 8,
          zIndex: 5,
        }}>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(201,168,92,0.4))" }} />
          <span style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 13, fontStyle: "italic", fontWeight: 300,
            letterSpacing: "0.1em", color: "var(--gold-400)", whiteSpace: "nowrap",
          }}>
            Book This Look
          </span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(201,168,92,0.4),transparent)" }} />
        </div>
      </div>

      {/* Caption strip */}
      <div style={{ padding: "9px 11px 10px", borderTop: "1px solid var(--onyx-700)", position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 20,
          background: "linear-gradient(180deg,rgba(255,255,255,0.025) 0%,transparent 100%)",
          pointerEvents: "none",
        }} />
        <div style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 14, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-100)", lineHeight: 1.2, marginBottom: 4,
        }}>
          {item.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--cream-400)",
          }}>
            {item.therapist}
          </div>
          <div style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 15, fontWeight: 300, color: "var(--gold-400)", letterSpacing: "-0.01em",
          }}>
            <sup style={{ fontSize: 9, color: "var(--gold-500)", verticalAlign: "super" }}>R</sup>
            {item.price}
          </div>
        </div>
      </div>
    </div>
  );
}
