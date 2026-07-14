"use client";

const PHOTO_STYLES = [
  {
    bg: "#232122",
    inner: `radial-gradient(ellipse 80% 60% at 30% 30%, rgba(254,50,156,0.20) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 75% 70%, rgba(232,186,179,0.14) 0%, transparent 50%),
            repeating-linear-gradient(118deg, #201e1f 0, #201e1f 8px, #2a2728 8px, #2a2728 18px)`,
    dark: false, label: "After", nail: true, nailColor: "#fe329c",
  },
  {
    bg: "#f7eae7",
    inner: `radial-gradient(ellipse 90% 70% at 50% 20%, rgba(255,255,255,0.8) 0%, rgba(232,186,179,0.35) 60%, transparent 100%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(201,141,130,0.3) 0%, transparent 60%)`,
    dark: true, label: "After", nail: true, nailColor: "#fe329c",
  },
  {
    bg: "#e8bab3",
    inner: `radial-gradient(ellipse 70% 90% at 50% 30%, rgba(255,244,240,0.6) 0%, rgba(232,170,160,0.25) 60%, transparent 100%),
            radial-gradient(ellipse 30% 20% at 20% 80%, rgba(201,141,130,0.35) 0%, transparent 50%)`,
    dark: true, label: "Glow", nail: false, nailColor: "",
  },
  {
    bg: "#d41d7f",
    inner: `radial-gradient(ellipse 100% 50% at 50% 40%, rgba(255,180,215,0.25) 0%, transparent 55%),
            radial-gradient(ellipse 60% 40% at 20% 20%, rgba(120,10,70,0.3) 0%, transparent 50%),
            linear-gradient(160deg, #e02b8c 0%, #b3186b 100%)`,
    dark: false, label: "After", nail: false, nailColor: "",
  },
  {
    bg: "#f3d6cf",
    inner: `radial-gradient(ellipse 100% 80% at 50% 10%, rgba(255,250,246,0.6) 0%, rgba(232,186,179,0.25) 70%, transparent 100%),
            radial-gradient(ellipse 40% 50% at 80% 80%, rgba(201,141,130,0.3) 0%, transparent 60%)`,
    dark: true, label: "Smooth", nail: false, nailColor: "",
  },
  {
    bg: "#2b282a",
    inner: `radial-gradient(ellipse 80% 60% at 60% 30%, rgba(254,50,156,0.15) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 20% 70%, rgba(232,186,179,0.12) 0%, transparent 50%),
            repeating-linear-gradient(150deg, #262324 0, #262324 10px, #302c2e 10px, #302c2e 22px)`,
    dark: false, label: "After", nail: false, nailColor: "",
  },
  {
    bg: "#faf6f5",
    inner: `radial-gradient(ellipse 80% 70% at 40% 20%, rgba(255,255,255,0.7) 0%, rgba(239,220,216,0.35) 60%, transparent 100%),
            linear-gradient(180deg, rgba(247,234,231,0.5) 0%, transparent 60%)`,
    dark: true, label: "After", nail: true, nailColor: "#e8bab3",
  },
  {
    bg: "#c98d82",
    inner: `radial-gradient(ellipse 80% 70% at 50% 30%, rgba(240,200,190,0.45) 0%, rgba(180,110,100,0.25) 55%, transparent 80%),
            radial-gradient(ellipse 40% 40% at 80% 70%, rgba(150,85,75,0.4) 0%, transparent 50%)`,
    dark: false, label: "Glow", nail: false, nailColor: "",
  },
  {
    bg: "#3a3436",
    inner: `radial-gradient(ellipse 90% 50% at 50% 50%, rgba(212,29,127,0.35) 0%, transparent 60%),
            linear-gradient(160deg, #423a3e 0%, #2b2628 100%)`,
    dark: false, label: "After", nail: false, nailColor: "",
  },
  {
    bg: "#e79fb0",
    inner: `radial-gradient(ellipse 80% 80% at 50% 20%, rgba(255,225,232,0.55) 0%, rgba(212,100,140,0.25) 65%, transparent 100%),
            radial-gradient(ellipse 40% 30% at 15% 75%, rgba(160,60,95,0.35) 0%, transparent 50%)`,
    dark: true, label: "After", nail: false, nailColor: "",
  },
  {
    bg: "#2e2a2c",
    inner: `radial-gradient(ellipse 60% 50% at 35% 35%, rgba(232,186,179,0.18) 0%, transparent 55%),
            repeating-linear-gradient(90deg, #292527 0, #292527 6px, #332f31 6px, #332f31 14px)`,
    dark: false, label: "After", nail: true, nailColor: "#f7eae7",
  },
  {
    bg: "#f2c8c0",
    inner: `radial-gradient(ellipse 90% 70% at 50% 15%, rgba(255,242,238,0.6) 0%, rgba(232,170,160,0.25) 60%, transparent 100%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(201,120,110,0.3) 0%, transparent 55%)`,
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
  const textColor = s.dark ? "rgba(74,69,71,0.6)" : "rgba(255,250,248,0.55)";

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
              boxShadow: "0 2px 8px rgba(35,33,34,0.25), inset 0 1px 0 rgba(255,255,255,0.25)",
              transform: `rotate(${(i - 2) * 4}deg) translateY(${Math.abs(i - 2) * 2}px)`,
            }} />
          ))}
        </div>
      )}

      {/* Treatment label watermark */}
      <div style={{
        position: "absolute", bottom: "32%", left: 0, right: 0,
        display: "flex", justifyContent: "center",
        fontFamily: "var(--font-bad-script), 'Bad Script', cursive",
        fontSize: 11,
        color: textColor, letterSpacing: "0.12em",
        pointerEvents: "none", zIndex: 2,
      }}>
        — {s.label} —
      </div>

      {/* Top-left light source */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse 55% 45% at 15% 12%, rgba(255,255,255,0.14) 0%, transparent 60%)", pointerEvents: "none", zIndex: 2 }} />

      {/* Bottom scrim for text legibility */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "52%", background: s.dark ? "linear-gradient(180deg,transparent 0%,rgba(255,255,255,0.55) 100%)" : "linear-gradient(180deg,transparent 0%,rgba(35,33,34,0.55) 100%)", pointerEvents: "none", zIndex: 3 }} />

      {/* Top gloss */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "30%", background: "linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 100%)", pointerEvents: "none", zIndex: 4 }} />
    </div>
  );
}
