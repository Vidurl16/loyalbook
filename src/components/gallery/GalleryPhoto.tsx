"use client";

const PHOTO_STYLES = [
  {
    bg: "#1c1710",
    inner: `radial-gradient(ellipse 80% 60% at 30% 30%, rgba(201,168,92,0.18) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 75% 70%, rgba(220,200,160,0.10) 0%, transparent 50%),
            repeating-linear-gradient(118deg, #1a1510 0, #1a1510 8px, #221d14 8px, #221d14 18px)`,
    dark: false, label: "After", nail: true, nailColor: "#0e0c0a",
  },
  {
    bg: "#e8d9be",
    inner: `radial-gradient(ellipse 90% 70% at 50% 20%, rgba(255,248,230,0.7) 0%, rgba(210,180,110,0.3) 60%, transparent 100%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(180,140,60,0.3) 0%, transparent 60%)`,
    dark: true, label: "After", nail: true, nailColor: "#c9a85c",
  },
  {
    bg: "#c9a882",
    inner: `radial-gradient(ellipse 70% 90% at 50% 30%, rgba(255,240,218,0.55) 0%, rgba(200,160,110,0.2) 60%, transparent 100%),
            radial-gradient(ellipse 30% 20% at 20% 80%, rgba(140,90,40,0.3) 0%, transparent 50%)`,
    dark: true, label: "Glow", nail: false, nailColor: "",
  },
  {
    bg: "#1a0f18",
    inner: `radial-gradient(ellipse 100% 50% at 50% 40%, rgba(180,120,200,0.16) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 20% 20%, rgba(100,60,120,0.20) 0%, transparent 50%),
            linear-gradient(160deg, #200a20 0%, #0e0a14 100%)`,
    dark: false, label: "After", nail: false, nailColor: "",
  },
  {
    bg: "#d4a96a",
    inner: `radial-gradient(ellipse 100% 80% at 50% 10%, rgba(255,235,180,0.5) 0%, rgba(180,110,50,0.2) 70%, transparent 100%),
            radial-gradient(ellipse 40% 50% at 80% 80%, rgba(120,70,20,0.3) 0%, transparent 60%)`,
    dark: true, label: "Smooth", nail: false, nailColor: "",
  },
  {
    bg: "#151210",
    inner: `radial-gradient(ellipse 80% 60% at 60% 30%, rgba(201,168,92,0.13) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 20% 70%, rgba(180,140,80,0.10) 0%, transparent 50%),
            repeating-linear-gradient(150deg, #121009 0, #121009 10px, #1c1812 10px, #1c1812 22px)`,
    dark: false, label: "After", nail: false, nailColor: "",
  },
  {
    bg: "#ead5c0",
    inner: `radial-gradient(ellipse 80% 70% at 40% 20%, rgba(255,245,235,0.6) 0%, rgba(220,190,160,0.2) 60%, transparent 100%),
            linear-gradient(180deg, rgba(255,240,225,0.3) 0%, transparent 60%)`,
    dark: true, label: "After", nail: true, nailColor: "#f0e8de",
  },
  {
    bg: "#3a2008",
    inner: `radial-gradient(ellipse 80% 70% at 50% 30%, rgba(201,148,60,0.4) 0%, rgba(160,90,20,0.2) 55%, transparent 80%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(100,50,10,0.4) 0%, transparent 50%)`,
    dark: false, label: "Glow", nail: false, nailColor: "",
  },
  {
    bg: "#0e0a10",
    inner: `radial-gradient(ellipse 90% 50% at 50% 50%, rgba(60,40,80,0.6) 0%, transparent 60%),
            linear-gradient(160deg, #130d18 0%, #0a0810 100%)`,
    dark: false, label: "After", nail: false, nailColor: "",
  },
  {
    bg: "#b07040",
    inner: `radial-gradient(ellipse 80% 80% at 50% 20%, rgba(220,175,100,0.5) 0%, rgba(150,80,20,0.2) 65%, transparent 100%),
            radial-gradient(ellipse 40% 30% at 15% 75%, rgba(80,40,10,0.4) 0%, transparent 50%)`,
    dark: true, label: "After", nail: false, nailColor: "",
  },
  {
    bg: "#181510",
    inner: `radial-gradient(ellipse 60% 50% at 35% 35%, rgba(201,168,92,0.15) 0%, transparent 55%),
            repeating-linear-gradient(90deg, #141210 0, #141210 6px, #1e1a14 6px, #1e1a14 14px)`,
    dark: false, label: "After", nail: true, nailColor: "#0a0907",
  },
  {
    bg: "#e0b8b0",
    inner: `radial-gradient(ellipse 90% 70% at 50% 15%, rgba(255,235,228,0.55) 0%, rgba(200,140,130,0.2) 60%, transparent 100%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(150,80,70,0.25) 0%, transparent 55%)`,
    dark: true, label: "After", nail: false, nailColor: "",
  },
];

interface GalleryPhotoProps {
  index: number;
  imageUrl?: string | null;
}

export function GalleryPhoto({ index, imageUrl }: GalleryPhotoProps) {
  if (imageUrl) {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }

  const s = PHOTO_STYLES[index % PHOTO_STYLES.length];
  const textColor = s.dark ? "rgba(20,14,8,0.55)" : "rgba(255,245,230,0.35)";

  return (
    <div style={{ width: "100%", height: "100%", background: s.bg, position: "relative", overflow: "hidden" }}>
      {/* Layered photo simulation */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: s.inner, backgroundSize: "cover" }} />

      {/* Nail art accent strip */}
      {s.nail && (
        <div style={{ position: "absolute", bottom: "28%", left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5, zIndex: 3 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{
              width: 11, height: 36,
              borderRadius: "40% 40% 50% 50% / 30% 30% 40% 40%",
              background: s.nailColor,
              boxShadow: "0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
              transform: `rotate(${(i - 2) * 4}deg) translateY(${Math.abs(i - 2) * 2}px)`,
            }} />
          ))}
        </div>
      )}

      {/* Treatment label watermark */}
      <div style={{
        position: "absolute", bottom: "32%", left: 0, right: 0,
        display: "flex", justifyContent: "center",
        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
        fontSize: 10, fontStyle: "italic", fontWeight: 300,
        color: textColor, letterSpacing: "0.12em",
        pointerEvents: "none", zIndex: 2,
      }}>
        — {s.label} —
      </div>

      {/* Top-left light source */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 55% 45% at 15% 12%, rgba(255,255,255,0.07) 0%, transparent 60%)", pointerEvents: "none", zIndex: 2 }} />

      {/* Bottom scrim for text legibility */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "52%", background: "linear-gradient(180deg,transparent 0%,rgba(10,8,6,0.94) 100%)", pointerEvents: "none", zIndex: 3 }} />

      {/* Top gloss */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(180deg,rgba(255,255,255,0.05) 0%,transparent 100%)", pointerEvents: "none", zIndex: 4 }} />
    </div>
  );
}
