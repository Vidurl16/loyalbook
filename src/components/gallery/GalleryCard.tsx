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
        background: "#ffffff",
        border: "1px solid #efdcd8",
        boxShadow: hovered
          ? "0 14px 36px rgba(35,33,34,0.12)"
          : "0 10px 30px rgba(35,33,34,0.07)",
        transform: hovered ? "translateY(-4px)" : "none",
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
          fontFamily: "var(--font-abel), Abel, sans-serif",
          fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#c98d82",
          background: "rgba(255,255,255,0.92)",
          padding: "3px 8px", borderRadius: 2,
          border: "1px solid #efdcd8",
          zIndex: 5,
        }}>
          {item.category}
        </div>

        {/* "Book This Look" hover reveal */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "10px 10px 9px",
          background: "rgba(255,255,255,0.94)",
          borderTop: "1px solid #efdcd8",
          transform: hovered ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.22s cubic-bezier(0.16,1,0.3,1)",
          display: "flex", alignItems: "center", gap: 8,
          zIndex: 5,
        }}>
          <div style={{ flex: 1, height: 1, background: "#e8bab3" }} />
          <span style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 10, fontWeight: 400,
            letterSpacing: "0.16em", textTransform: "uppercase",
            color: "#fe329c", whiteSpace: "nowrap",
          }}>
            Book This Look
          </span>
          <div style={{ flex: 1, height: 1, background: "#e8bab3" }} />
        </div>
      </div>

      {/* Caption strip */}
      <div style={{ padding: "9px 11px 10px", borderTop: "1px solid #efdcd8", position: "relative", background: "#ffffff" }}>
        <div style={{
          fontFamily: "var(--font-marcellus), Marcellus, serif",
          fontSize: 14, fontWeight: 400,
          color: "#232122", lineHeight: 1.2, marginBottom: 4,
        }}>
          {item.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#8d8e8f",
          }}>
            {item.therapist}
          </div>
          <div style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 15, fontWeight: 400, color: "#fe329c", letterSpacing: "-0.01em",
          }}>
            <sup style={{ fontSize: 9, color: "#d41d7f", verticalAlign: "super" }}>R</sup>
            {item.price}
          </div>
        </div>
      </div>
    </div>
  );
}
