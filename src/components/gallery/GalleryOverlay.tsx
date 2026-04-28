"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GalleryPhoto } from "./GalleryPhoto";
import type { GalleryItemData } from "./GalleryCard";

interface GalleryOverlayProps {
  item: GalleryItemData;
  index: number;
  onClose: () => void;
}

export function GalleryOverlay({ item, index, onClose }: GalleryOverlayProps) {
  const [panelVisible, setPanelVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPanelVisible(true), 240);
    return () => clearTimeout(t);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 120,
        animation: "galleryFadeIn 0.28s ease both",
        cursor: "pointer",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "rgba(10,8,6,0.92)" }} />

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(440px, calc(100vw - 32px))",
          maxHeight: "calc(100vh - 64px)",
          background: "var(--onyx-900)",
          borderRadius: 2,
          border: "1px solid rgba(201,168,92,0.22)",
          boxShadow: "8px 12px 0 rgba(0,0,0,0.88), 0 0 0 1px rgba(201,168,92,0.1)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          animation: "galleryLoom 0.44s cubic-bezier(0.16,1,0.3,1) both",
          cursor: "default",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 20,
            width: 30, height: 30, borderRadius: 2,
            background: "rgba(14,12,10,0.75)",
            border: "1px solid var(--onyx-600)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="var(--cream-400)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Photo — top 52% */}
        <div style={{ flex: "0 0 52%", position: "relative", overflow: "hidden" }}>
          <GalleryPhoto index={index} imageUrl={item.imageUrl} />
          <div style={{
            position: "absolute", top: 12, left: 12,
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--gold-400)",
            background: "rgba(14,12,10,0.75)",
            padding: "3px 9px", borderRadius: 2,
            border: "1px solid rgba(201,168,92,0.32)",
          }}>
            {item.category}
          </div>
        </div>

        {/* Detail panel */}
        {panelVisible && (
          <div style={{
            flex: 1,
            padding: "18px 20px 24px",
            display: "flex", flexDirection: "column",
            overflowY: "auto",
            animation: "galleryRiseUp 0.4s cubic-bezier(0.16,1,0.3,1) both",
          }}>
            <h2 style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 26, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-100)", lineHeight: 1.0, marginBottom: 5,
            }}>
              {item.title}
            </h2>

            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "var(--cream-400)", marginBottom: 12,
            }}>
              {item.therapist}&nbsp;·&nbsp;{item.durationMins} min
            </div>

            <div style={{
              height: 1, width: "36%",
              background: "linear-gradient(90deg, var(--gold-400), transparent)",
              opacity: 0.4, marginBottom: 12,
            }} />

            {item.description && (
              <p style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 15, fontWeight: 300,
                color: "var(--cream-300)", lineHeight: 1.7, flexGrow: 1,
                marginBottom: 16,
              }}>
                {item.description}
              </p>
            )}

            <div>
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                color: "var(--onyx-500)", marginBottom: 4,
              }}>
                From
              </div>
              <div style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 32, fontWeight: 300, color: "var(--cream-50)",
                letterSpacing: "-0.02em", lineHeight: 1, marginBottom: 14,
              }}>
                <sup style={{ fontSize: 15, color: "var(--gold-400)", verticalAlign: "super" }}>R</sup>
                {item.price}
              </div>

              <Link
                href={`/book?category=${encodeURIComponent(item.category)}`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: "100%", padding: "15px 20px",
                  background: "transparent",
                  border: "1px solid rgba(201,168,92,0.58)",
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
                  <span style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    fontSize: 19, fontWeight: 300, fontStyle: "italic",
                    letterSpacing: "0.1em", color: "var(--gold-400)", whiteSpace: "nowrap",
                  }}>
                    Book This Look
                  </span>
                  <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(201,168,92,0.42),transparent)" }} />
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes galleryFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes galleryLoom { from { opacity: 0; transform: translate(-50%,-50%) scale(0.95) } to { opacity: 1; transform: translate(-50%,-50%) scale(1) } }
        @keyframes galleryRiseUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
}
