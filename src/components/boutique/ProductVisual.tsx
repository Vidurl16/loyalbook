"use client";

import React from "react";

export type ProductShape = "dropper" | "nailpolish" | "jar" | "pump" | "tube";

const BG_STYLES: { bg: string; inner: string }[] = [
  { bg: "#e8d9be", inner: "radial-gradient(ellipse at 50% 30%,rgba(255,248,235,0.6) 0%,transparent 65%)" },
  { bg: "#1c1510", inner: "radial-gradient(ellipse at 50% 30%,rgba(201,168,92,0.08) 0%,transparent 60%)" },
  { bg: "#c9a882", inner: "radial-gradient(ellipse at 50% 25%,rgba(255,245,220,0.5) 0%,transparent 60%)" },
  { bg: "#2a2118", inner: "radial-gradient(ellipse at 50% 30%,rgba(201,168,92,0.1) 0%,transparent 55%)" },
  { bg: "#f0e6d3", inner: "radial-gradient(ellipse at 50% 28%,rgba(255,255,255,0.55) 0%,transparent 65%)" },
  { bg: "#3d2e1e", inner: "radial-gradient(ellipse at 50% 30%,rgba(220,185,120,0.12) 0%,transparent 60%)" },
  { bg: "#e2cdb0", inner: "radial-gradient(ellipse at 50% 30%,rgba(255,250,240,0.5) 0%,transparent 65%)" },
  { bg: "#141210", inner: "radial-gradient(ellipse at 50% 30%,rgba(201,168,92,0.07) 0%,transparent 55%)" },
  { bg: "#d4b896", inner: "radial-gradient(ellipse at 50% 28%,rgba(255,248,230,0.45) 0%,transparent 62%)" },
  { bg: "#1e1812", inner: "radial-gradient(ellipse at 50% 28%,rgba(201,168,92,0.09) 0%,transparent 58%)" },
  { bg: "#ede0cc", inner: "radial-gradient(ellipse at 50% 30%,rgba(255,255,255,0.5) 0%,transparent 65%)" },
  { bg: "#251d14", inner: "radial-gradient(ellipse at 50% 30%,rgba(201,168,92,0.11) 0%,transparent 60%)" },
  { bg: "#cbb98a", inner: "radial-gradient(ellipse at 50% 28%,rgba(255,248,220,0.48) 0%,transparent 62%)" },
  { bg: "#0e0c0a", inner: "radial-gradient(ellipse at 50% 28%,rgba(201,168,92,0.06) 0%,transparent 55%)" },
];

function Dropper() {
  return (
    <svg width="80" height="140" viewBox="0 0 80 140" fill="none">
      <defs>
        <linearGradient id="dg1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9a85c" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b8922e" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="dg2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dfc07a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#c9a85c" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {/* cap */}
      <rect x="25" y="8" width="30" height="24" rx="3" fill="url(#dg1)" />
      {/* neck */}
      <rect x="36" y="32" width="8" height="14" fill="#b8922e" opacity="0.9" />
      {/* body */}
      <rect x="20" y="46" width="40" height="62" rx="5" fill="url(#dg2)" />
      {/* gloss */}
      <rect x="24" y="50" width="6" height="36" rx="2" fill="white" opacity="0.14" />
      {/* label lines */}
      <rect x="24" y="94" width="32" height="1.5" rx="1" fill="#0e0c0a" opacity="0.18" />
      <rect x="26" y="100" width="22" height="1" rx="0.5" fill="#0e0c0a" opacity="0.12" />
      {/* dropper tip */}
      <rect x="37" y="108" width="6" height="18" rx="3" fill="#b8922e" opacity="0.7" />
    </svg>
  );
}

function NailPolish() {
  return (
    <svg width="80" height="140" viewBox="0 0 80 140" fill="none">
      <defs>
        <linearGradient id="ng1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9a85c" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b8922e" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="ng2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dfc07a" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#c9a85c" stopOpacity="0.88" />
        </linearGradient>
      </defs>
      {/* cap — wider */}
      <rect x="26" y="6" width="28" height="22" rx="4" fill="url(#ng1)" />
      {/* thin neck */}
      <rect x="37" y="28" width="6" height="12" fill="#b8922e" opacity="0.85" />
      {/* bottle body */}
      <rect x="18" y="40" width="44" height="74" rx="6" fill="url(#ng2)" />
      {/* gloss */}
      <rect x="22" y="44" width="7" height="44" rx="3" fill="white" opacity="0.13" />
      {/* label */}
      <rect x="22" y="95" width="36" height="1.5" rx="1" fill="#0e0c0a" opacity="0.16" />
      <rect x="25" y="101" width="24" height="1" rx="0.5" fill="#0e0c0a" opacity="0.11" />
    </svg>
  );
}

function Jar() {
  return (
    <svg width="80" height="140" viewBox="0 0 80 140" fill="none">
      <defs>
        <radialGradient id="jg1" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#dfc07a" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b8922e" stopOpacity="0.85" />
        </radialGradient>
        <radialGradient id="jg2" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ede0cc" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#c9a85c" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      {/* lid top face — ellipse */}
      <ellipse cx="40" cy="44" rx="28" ry="9" fill="url(#jg1)" />
      {/* lid side */}
      <rect x="12" y="44" width="56" height="14" rx="2" fill="#c9a85c" opacity="0.88" />
      {/* body */}
      <rect x="10" y="56" width="60" height="60" rx="4" fill="url(#jg2)" />
      {/* gloss ellipse */}
      <ellipse cx="29" cy="72" rx="6" ry="10" fill="white" opacity="0.12" />
      {/* label */}
      <rect x="16" y="98" width="48" height="1.5" rx="1" fill="#0e0c0a" opacity="0.15" />
      <rect x="20" y="104" width="36" height="1" rx="0.5" fill="#0e0c0a" opacity="0.10" />
    </svg>
  );
}

function Pump() {
  return (
    <svg width="80" height="140" viewBox="0 0 80 140" fill="none">
      <defs>
        <linearGradient id="pg1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9a85c" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#b8922e" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id="pg2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dfc07a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#c9a85c" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {/* pump head */}
      <rect x="34" y="6" width="24" height="14" rx="4" fill="url(#pg1)" />
      {/* stem */}
      <rect x="43" y="20" width="6" height="16" fill="#b8922e" opacity="0.8" />
      {/* collar */}
      <rect x="30" y="34" width="20" height="8" rx="2" fill="#c9a85c" opacity="0.85" />
      {/* body */}
      <rect x="18" y="42" width="44" height="84" rx="8" fill="url(#pg2)" />
      {/* gloss */}
      <rect x="22" y="46" width="7" height="50" rx="3" fill="white" opacity="0.12" />
      {/* label */}
      <rect x="22" y="103" width="36" height="1.5" rx="1" fill="#0e0c0a" opacity="0.15" />
      <rect x="25" y="109" width="26" height="1" rx="0.5" fill="#0e0c0a" opacity="0.10" />
    </svg>
  );
}

function Tube() {
  return (
    <svg width="80" height="140" viewBox="0 0 80 140" fill="none">
      <defs>
        <linearGradient id="tg1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c9a85c" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b8922e" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="tg2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#dfc07a" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#c9a85c" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      {/* cap */}
      <rect x="30" y="6" width="20" height="18" rx="4" fill="url(#tg1)" />
      {/* rounded tube body */}
      <rect x="22" y="24" width="36" height="86" rx="18" fill="url(#tg2)" />
      {/* gloss */}
      <rect x="26" y="28" width="6" height="52" rx="3" fill="white" opacity="0.13" />
      {/* label */}
      <rect x="26" y="86" width="28" height="1.5" rx="1" fill="#0e0c0a" opacity="0.16" />
      <rect x="28" y="92" width="20" height="1" rx="0.5" fill="#0e0c0a" opacity="0.11" />
    </svg>
  );
}

const SHAPES: Record<ProductShape, () => React.ReactElement> = {
  dropper: Dropper,
  nailpolish: NailPolish,
  jar: Jar,
  pump: Pump,
  tube: Tube,
};

interface ProductVisualProps {
  shape: ProductShape;
  bgStyle?: number;
  imageUrl?: string | null;
  height?: number;
}

export function ProductVisual({ shape, bgStyle = 1, imageUrl, height = 220 }: ProductVisualProps) {
  const idx = Math.max(0, Math.min(13, (bgStyle - 1)));
  const { bg, inner } = BG_STYLES[idx];
  const ShapeComponent = SHAPES[shape] ?? Dropper;

  if (imageUrl) {
    return (
      <div style={{ width: "100%", height, position: "relative", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", height,
      background: bg,
      position: "relative",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, background: inner, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <ShapeComponent />
      </div>
      {/* editorial watermark */}
      <div style={{
        position: "absolute", bottom: 8, right: 10,
        fontFamily: "monospace", fontSize: 8, letterSpacing: "0.16em",
        color: "#0e0c0a", opacity: 0.14, textTransform: "uppercase",
        pointerEvents: "none",
      }}>
        Perfect 10
      </div>
    </div>
  );
}
