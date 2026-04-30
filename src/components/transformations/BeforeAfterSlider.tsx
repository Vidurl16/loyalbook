"use client";

import { useEffect, useRef, useState } from "react";
import { GalleryPhoto } from "@/components/gallery/GalleryPhoto";

interface BeforeAfterSliderProps {
  height?: number;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  beforePhotoIndex?: number;
  afterPhotoIndex?: number;
  initialPos?: number;
}

export function BeforeAfterSlider({
  height = 272,
  beforeImageUrl,
  afterImageUrl,
  beforePhotoIndex = 0,
  afterPhotoIndex = 1,
  initialPos = 50,
}: BeforeAfterSliderProps) {
  const [pos, setPos] = useState(initialPos);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent) => {
    if (!ref.current) return pos;
    const r = ref.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const x = clientX - r.left;
    return Math.max(2, Math.min(98, (x / r.width) * 100));
  };

  useEffect(() => {
    const up = () => { dragging.current = false; };
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchend", up);
    };
  }, []);

  return (
    <div
      ref={ref}
      onMouseDown={(e) => { dragging.current = true; setPos(clamp(e)); }}
      onMouseMove={(e) => { if (dragging.current) setPos(clamp(e)); }}
      onTouchStart={(e) => { dragging.current = true; setPos(clamp(e)); }}
      onTouchMove={(e) => { if (dragging.current) setPos(clamp(e)); }}
      style={{
        position: "relative", width: "100%", height,
        overflow: "hidden", cursor: "ew-resize",
        userSelect: "none", touchAction: "none",
      }}
    >
      {/* AFTER — full background */}
      <div style={{ position: "absolute", inset: 0 }}>
        {afterImageUrl ? (
          <GalleryPhoto index={afterPhotoIndex} imageUrl={afterImageUrl} />
        ) : (
          <>
            <div style={{
              position: "absolute", inset: 0,
              background: "repeating-linear-gradient(-45deg,#3e3830 0,#3e3830 4px,#2d2820 4px,#2d2820 12px)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(135deg,rgba(201,168,92,0.07) 0%,transparent 55%)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 6, opacity: 0.3,
            }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="11" r="6" stroke="var(--gold-400)" strokeWidth="1.2" />
                <path d="M6 27c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="var(--gold-400)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--onyx-500)", textTransform: "uppercase" }}>after photo</span>
            </div>
          </>
        )}
      </div>

      {/* BEFORE — clipped to left of handle */}
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {beforeImageUrl ? (
          <GalleryPhoto index={beforePhotoIndex} imageUrl={beforeImageUrl} />
        ) : (
          <>
            <div style={{
              position: "absolute", inset: 0,
              background: "repeating-linear-gradient(-45deg,#302b22 0,#302b22 4px,#1f1b14 4px,#1f1b14 12px)",
            }} />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              gap: 6, opacity: 0.18,
            }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="11" r="6" stroke="var(--cream-400)" strokeWidth="1.2" />
                <path d="M6 27c0-5.5 4.5-10 10-10s10 4.5 10 10" stroke="var(--cream-400)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.14em", color: "var(--onyx-500)", textTransform: "uppercase" }}>before photo</span>
            </div>
          </>
        )}
      </div>

      {/* Before label */}
      <div style={{
        position: "absolute", top: 12, left: 12, zIndex: 5,
        background: "var(--onyx-900)", border: "1px solid var(--onyx-600)",
        padding: "3px 9px", borderRadius: 2,
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
        color: "var(--cream-400)", fontWeight: 500,
        opacity: pos > 14 ? 1 : 0, transition: "opacity 0.15s",
        pointerEvents: "none",
      }}>
        Before
      </div>

      {/* After label */}
      <div style={{
        position: "absolute", top: 12, right: 12, zIndex: 5,
        background: "var(--onyx-900)", border: "1px solid rgba(201,168,92,0.4)",
        padding: "3px 9px", borderRadius: 2,
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
        color: "var(--gold-400)", fontWeight: 500,
        opacity: pos < 86 ? 1 : 0, transition: "opacity 0.15s",
        pointerEvents: "none",
      }}>
        After
      </div>

      {/* Gold divider line */}
      <div style={{
        position: "absolute", top: 0, bottom: 0, left: `${pos}%`,
        transform: "translateX(-50%)", width: 1.5,
        background: "linear-gradient(180deg,transparent,var(--gold-400) 12%,var(--gold-400) 88%,transparent)",
        zIndex: 10, pointerEvents: "none",
      }} />

      {/* Handle */}
      <div style={{
        position: "absolute", top: "50%", left: `${pos}%`,
        transform: "translate(-50%,-50%)",
        width: 34, height: 34, borderRadius: "50%",
        background: "var(--gold-400)",
        boxShadow: "0 0 0 2.5px var(--onyx-950), 0 0 0 4px var(--gold-400), 4px 6px 0 rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 11, pointerEvents: "none",
      }}>
        <svg width="16" height="9" viewBox="0 0 18 10" fill="none">
          <path d="M5 5H13M5 5L2 2M5 5L2 8M13 5L16 2M13 5L16 8"
            stroke="var(--onyx-950)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Top gloss */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg,rgba(255,255,255,0.04) 0%,transparent 35%)",
        pointerEvents: "none", zIndex: 4,
      }} />
    </div>
  );
}
