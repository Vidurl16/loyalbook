"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID ?? "";

// ── Tiers ──────────────────────────────────────────────────────────────────
const TIERS = [
  { id: "bronze",  label: "Bronze",     min: 0,     max: 2499,    colHex: "#c8864a", glyph: "B", tagline: "Welcome, darling." },
  { id: "silver",  label: "Silver",     min: 2500,  max: 4999,    colHex: "#cbc4b8", glyph: "S", tagline: "Your beauty, elevated." },
  { id: "gold",    label: "Gold",       min: 5000,  max: 9999,    colHex: "#c9a85c", glyph: "G", tagline: "The inner circle." },
  { id: "perfect", label: "Perfect 10", min: 10000, max: Infinity, colHex: "#f5f0e4", glyph: "✦", tagline: "You have arrived." },
];

function getTier(pts: number) {
  return TIERS.find((t) => pts >= t.min && pts <= t.max) ?? TIERS[3];
}

// ── Perfect 10 Meter ───────────────────────────────────────────────────────
function PerfectTenMeter({ points, redemptionRate }: { points: number; redemptionRate: number }) {
  const [arcPct, setArcPct] = useState(0);
  const [shimmerOn, setShimmerOn] = useState(false);
  const rafRef = useRef<number>(0);

  const MAX = 10000;
  const targetPct = Math.min(points / MAX, 1);
  const R = 90;
  const SIZE = 220;
  const CX = SIZE / 2;
  const CIRC = 2 * Math.PI * R;

  useEffect(() => {
    setArcPct(0);
    setShimmerOn(false);
    let start: number | null = null;
    const duration = 1400;
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    const tick = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      setArcPct(ease(t) * targetPct);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setArcPct(targetPct);
        setShimmerOn(true);
      }
    };
    const delay = setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, 500);
    return () => { clearTimeout(delay); cancelAnimationFrame(rafRef.current); };
  }, [targetPct]);

  const filled = CIRC * arcPct;
  const randValue = Math.round((points / (redemptionRate || 100)) * 10);

  // Tier ticks at 25%, 50%, 100%
  const ticks = [
    { pct: 0.25, achieved: points >= 2500, col: "#cbc4b8" },
    { pct: 0.50, achieved: points >= 5000, col: "#c9a85c" },
    { pct: 1.00, achieved: points >= 10000, col: "#f5f0e4" },
  ].map(({ pct, achieved, col }) => {
    const angle = pct * Math.PI * 2;
    return {
      x1: CX + (R - 10) * Math.cos(angle),
      y1: CX + (R - 10) * Math.sin(angle),
      x2: CX + (R + 8)  * Math.cos(angle),
      y2: CX + (R + 8)  * Math.sin(angle),
      achieved, col,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
        color: "var(--onyx-500)", marginBottom: 14,
      }}>
        The Perfect 10 Meter
      </div>

      <div style={{ position: "relative", width: SIZE, height: SIZE }}>
        <svg
          width={SIZE} height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: "rotate(-90deg)", display: "block" }}
        >
          <defs>
            <linearGradient id="goldArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#b8922e" />
              <stop offset="40%"  stopColor="#c9a85c" />
              <stop offset="75%"  stopColor="#dfc07a" />
              <stop offset="100%" stopColor="#f0e0b8" />
            </linearGradient>
            <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="rgba(255,248,220,0)" />
              <stop offset="50%"  stopColor="rgba(255,248,220,0.7)" />
              <stop offset="100%" stopColor="rgba(255,248,220,0)" />
            </linearGradient>
            <filter id="goldGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Outer glow halo */}
          <circle cx={CX} cy={CX} r={R} fill="none" stroke="rgba(201,168,92,0.06)" strokeWidth="18" />
          {/* Track */}
          <circle cx={CX} cy={CX} r={R} fill="none" stroke="#302b22" strokeWidth="10" />
          {/* Inner subtle ring */}
          <circle cx={CX} cy={CX} r={R - 18} fill="none" stroke="#242018" strokeWidth="1" opacity="0.7" />

          {/* Gold fill arc */}
          {arcPct > 0 && (
            <circle
              cx={CX} cy={CX} r={R}
              fill="none"
              stroke="url(#goldArc)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${CIRC}`}
              filter="url(#goldGlow)"
            />
          )}

          {/* Shimmer traveling segment */}
          {shimmerOn && arcPct > 0.05 && (
            <circle
              cx={CX} cy={CX} r={R}
              fill="none"
              stroke="url(#shimmerGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`26 ${CIRC - 26}`}
              strokeDashoffset={-(filled - 26)}
              opacity="0.65"
              style={{ animation: "shimmerTravel 2.6s linear infinite" }}
            />
          )}

          {/* Tier ticks */}
          {ticks.map((tk, i) => (
            <line key={i}
              x1={tk.x1} y1={tk.y1} x2={tk.x2} y2={tk.y2}
              stroke={tk.achieved ? tk.col : "#3e3830"}
              strokeWidth={tk.achieved ? 2 : 1}
              strokeLinecap="round"
              opacity={tk.achieved ? 1 : 0.5}
            />
          ))}
        </svg>

        {/* Center content */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 2,
        }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div style={{ width: 120, height: 120, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,168,92,0.08) 0%, transparent 70%)" }} />
          </div>
          <div style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 38, fontWeight: 300, lineHeight: 1, letterSpacing: "-0.02em",
            color: "var(--cream-50)", position: "relative",
          }}>
            {points.toLocaleString()}
          </div>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "var(--gold-400)", position: "relative",
          }}>
            points
          </div>
          <div style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 14, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-400)", position: "relative",
          }}>
            ≡ R{randValue} value
          </div>
        </div>
      </div>

      {/* Points to next tier */}
      {points < 10000 && (
        <div style={{ marginTop: 8, textAlign: "center" }}>
          <span style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--onyx-500)",
          }}>
            {(TIERS.find((t) => points < t.min)?.min ?? 10000 - points).toLocaleString()} pts to {TIERS.find((t) => points < t.min)?.label}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Milestone markers ───────────────────────────────────────────────────────
function MilestoneMarkers({ points }: { points: number }) {
  return (
    <div style={{ padding: "0 22px", marginTop: 4 }}>
      <div style={{ position: "relative", height: 40 }}>
        {/* Spine */}
        <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-600) 8%,var(--onyx-600) 92%,transparent)", transform: "translateY(-50%)" }} />
        {/* Gold fill */}
        <div style={{
          position: "absolute", top: "50%", left: 0,
          height: 1, background: "var(--gold-400)", opacity: 0.45,
          transform: "translateY(-50%)",
          width: `${Math.min((points / 10000) * 100, 100)}%`,
          transition: "width 1.4s cubic-bezier(0.16,1,0.3,1)",
        }} />
        {/* Dots */}
        {TIERS.map((t, i) => {
          const pct = i === 0 ? 0 : t.min / 10000;
          const achieved = points >= t.min;
          const isCurrent = getTier(points).id === t.id;
          return (
            <div key={t.id} style={{
              position: "absolute", top: "50%", left: `${pct * 100}%`,
              transform: "translate(-50%,-50%)",
            }}>
              <div style={{
                width: isCurrent ? 9 : achieved ? 7 : 5,
                height: isCurrent ? 9 : achieved ? 7 : 5,
                borderRadius: "50%",
                background: achieved ? t.colHex : "var(--onyx-600)",
                boxShadow: achieved ? `0 0 8px ${t.colHex}88` : "none",
                transition: "all 0.3s ease",
              }} />
            </div>
          );
        })}
      </div>
      {/* Labels */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {TIERS.map((t, i) => {
          const achieved = points >= t.min;
          const isCurrent = getTier(points).id === t.id;
          return (
            <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: i === 0 ? "flex-start" : i === 3 ? "flex-end" : "center", maxWidth: 60 }}>
              <span style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: isCurrent ? 8 : 7, letterSpacing: "0.18em", textTransform: "uppercase",
                color: isCurrent ? t.colHex : achieved ? "var(--cream-400)" : "var(--onyx-500)",
                fontWeight: isCurrent ? 500 : 300, whiteSpace: "nowrap",
              }}>
                {t.label}
              </span>
              {i > 0 && (
                <span style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 11, fontWeight: 300, fontStyle: "italic",
                  color: achieved ? "var(--onyx-500)" : "var(--onyx-600)", marginTop: 1,
                }}>
                  {(t.min / 1000).toFixed(1)}k
                </span>
              )}
              {isCurrent && <div style={{ width: 16, height: 1, background: t.colHex, marginTop: 3, opacity: 0.6 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Reward voucher ──────────────────────────────────────────────────────────
interface VoucherRow {
  code: string;
  discountValue: number;
  expiresAt: Date | string | null;
}

function RewardVoucher({ code, discountValue, expiresAt }: VoucherRow) {
  const expiry = expiresAt
    ? new Date(expiresAt).toLocaleDateString("en-ZA", { month: "short", year: "numeric" })
    : "No expiry";
  return (
    <div style={{
      flexShrink: 0, width: 210,
      background: "var(--onyx-800)",
      border: "1px solid rgba(201,168,92,0.35)",
      borderRadius: 2,
      boxShadow: "6px 9px 0 rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,92,0.06)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Diagonal watermark */}
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none", zIndex: 0, overflow: "hidden", transform: "rotate(-18deg)",
      }}>
        <span style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 36, fontWeight: 300, fontStyle: "italic",
          color: "rgba(201,168,92,0.05)", letterSpacing: "0.05em", whiteSpace: "nowrap",
        }}>
          Perfect 10
        </span>
      </div>

      {/* Top gold strip */}
      <div style={{ height: 3, background: "linear-gradient(90deg,#b8922e,#c9a85c,#dfc07a,#c9a85c,#b8922e)", position: "relative", zIndex: 1 }} />

      <div style={{ padding: "12px 14px 13px", position: "relative", zIndex: 1 }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 7, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "var(--gold-400)", marginBottom: 6,
        }}>
          Discount Voucher
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 10 }}>
          <span style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 26, fontWeight: 300, color: "var(--gold-400)", lineHeight: 1,
          }}>
            <sup style={{ fontSize: 12, verticalAlign: "super", color: "var(--gold-500)" }}>R</sup>{discountValue}
          </span>
          <span style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--onyx-500)",
          }}>
            off any treatment
          </span>
        </div>
        {/* Code — the client shows this in-salon */}
        <div style={{
          background: "var(--onyx-950)", border: "1px dashed rgba(201,168,92,0.4)", borderRadius: 2,
          padding: "8px 10px", textAlign: "center", marginBottom: 8,
        }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 15, fontWeight: 600, letterSpacing: "0.12em", color: "var(--cream-100)",
          }}>
            {code}
          </div>
        </div>
        <div style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 7, letterSpacing: "0.12em", color: "var(--onyx-500)",
        }}>
          Show in-salon · Exp {expiry}
        </div>
      </div>
    </div>
  );
}

// ── Shop the Look product chip ──────────────────────────────────────────────
function ProductChip({ name, brand, price, imageUrl, covered, discountedPrice }: {
  name: string; brand: string; price: number; imageUrl?: string | null;
  covered: boolean; discountedPrice: number;
}) {
  return (
    <Link href="/boutique" style={{ textDecoration: "none" }}>
      <div style={{
        flexShrink: 0, width: 104,
        background: "var(--onyx-800)", border: "1px solid var(--onyx-700)",
        borderRadius: 2, overflow: "hidden",
        boxShadow: "3px 4px 0 rgba(0,0,0,0.6)", cursor: "pointer",
      }}>
        <div style={{ height: 64, background: "var(--onyx-700)", position: "relative" }}>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
          {covered && (
            <div style={{
              position: "absolute", top: 5, right: 5,
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 6, letterSpacing: "0.14em", textTransform: "uppercase",
              color: "var(--onyx-950)", background: "var(--gold-400)",
              padding: "2px 5px", borderRadius: 2, fontWeight: 600,
            }}>
              Covered
            </div>
          )}
        </div>
        <div style={{ padding: "7px 8px 8px" }}>
          <div style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 12, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-200)", lineHeight: 1.2, marginBottom: 2,
          }}>
            {name}
          </div>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "var(--onyx-500)", marginBottom: 4,
          }}>
            {brand}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 13, fontWeight: 300, color: "var(--gold-400)",
            }}>
              <sup style={{ fontSize: 8, color: "var(--gold-500)", verticalAlign: "super" }}>R</sup>{covered ? 0 : discountedPrice}
            </span>
            {!covered && discountedPrice < price && (
              <span style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, color: "var(--onyx-500)", textDecoration: "line-through",
              }}>
                R{price}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

const TX_LABELS: Record<string, string> = {
  earned:          "Treatment Reward",
  redeemed:        "Points Redeemed",
  birthday:        "Birthday Bonus",
  rebooking_bonus: "Rebooking Bonus",
  referral:        "Referral Reward",
  milestone:       "Admin Adjustment",
  expired:         "Points Expired",
  refunded:        "Points Refunded",
};

// ── Page ────────────────────────────────────────────────────────────────────
const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID ?? "";

export default function RewardsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;
  const utils = trpc.useUtils();

  const { data: account } = trpc.loyalty.getAccount.useQuery(undefined, { enabled: !!userId });
  const { data: config } = trpc.loyalty.getConfig.useQuery(
    { spaId: SPA_ID },
    { enabled: !!SPA_ID }
  );
  const { data: vouchers } = trpc.loyalty.listMyVouchers.useQuery(undefined, { enabled: !!userId });
  const { data: suggested } = trpc.loyalty.suggestedProducts.useQuery(
    { locationId: LOCATION_ID },
    { enabled: !!userId && !!LOCATION_ID }
  );

  const [redeemError, setRedeemError] = useState("");
  const redeem = trpc.loyalty.redeemVoucher.useMutation({
    onSuccess: () => {
      utils.loyalty.getAccount.invalidate();
      utils.loyalty.listMyVouchers.invalidate();
      setRedeemError("");
    },
    onError: (e) => setRedeemError(e.message),
  });

  const balance         = account?.balance         ?? 0;
  const lifetime        = account?.lifetimeEarned  ?? 0;
  const redemptionRate  = config?.redemptionRate   ?? 100;
  const minRedeem       = config?.minRedeem        ?? 500;
  const canRedeem       = balance >= minRedeem;
  const tier            = getTier(lifetime);
  const nextTier        = TIERS[TIERS.findIndex((t) => t.id === tier.id) + 1];

  const activeVouchers = (vouchers ?? []).filter((v) => v.status === "active");

  const userName = session?.user?.name ?? "Your membership";

  return (
    <main style={{ minHeight: "100vh", background: "var(--onyx-950)" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "var(--onyx-950)", borderBottom: "1px solid var(--onyx-700)",
        padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 52,
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 18, fontWeight: 300, fontStyle: "italic",
          color: "var(--gold-400)", textDecoration: "none", letterSpacing: "0.04em",
        }}>
          Perfect 10
        </Link>
        <Link href="/account/journey" style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--cream-400)", textDecoration: "none",
          padding: "6px 12px", border: "1px solid var(--onyx-600)", borderRadius: 2,
        }}>
          Journey
        </Link>
      </nav>

      <div style={{ padding: "32px 20px 0" }}>

        {/* Header — name + tier badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 5,
            }}>
              My Membership
            </div>
            <h1 style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 26, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-100)", lineHeight: 1.0, marginBottom: 6,
            }}>
              {userName}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 1, background: tier.colHex, opacity: 0.6 }} />
              <span style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
                color: tier.colHex, fontWeight: 500,
              }}>
                {tier.label} Member
              </span>
            </div>
          </div>

          {/* Tier badge */}
          <div style={{
            width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
            border: `2px solid ${tier.colHex}`,
            background: "var(--onyx-800)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 0 0 1px var(--onyx-950), 0 0 16px ${tier.colHex}44, 2px 3px 0 rgba(0,0,0,0.6)`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(160deg,rgba(255,255,255,0.1) 0%,transparent 55%)", pointerEvents: "none" }} />
            <span style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 20, fontWeight: tier.id === "perfect" ? 400 : 500,
              fontStyle: tier.id === "perfect" ? "normal" : "italic",
              color: tier.colHex, position: "relative", zIndex: 1,
            }}>
              {tier.glyph}
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 14, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-400)", letterSpacing: "0.03em", marginBottom: 20,
        }}>
          {tier.tagline}
        </p>

        {/* Separator */}
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-600) 20%,var(--onyx-600) 80%,transparent)", marginBottom: 24 }} />

        {/* Perfect 10 Meter */}
        <PerfectTenMeter points={lifetime} redemptionRate={redemptionRate} />

        {/* Milestone markers */}
        <MilestoneMarkers points={lifetime} />

        {/* Redeem — mint a discount voucher from points */}
        {canRedeem ? (
          <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(201,168,92,0.06)", border: "1px solid rgba(201,168,92,0.3)", borderRadius: 2 }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 8,
            }}>
              Redeem points for a voucher
            </div>
            <p style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 14, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-400)", lineHeight: 1.5, marginBottom: 12,
            }}>
              Turn points into a discount code to use on your next treatment. Show the code in-salon.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[minRedeem, 1000, 2500, balance].filter((v, i, arr) => v >= minRedeem && v <= balance && arr.indexOf(v) === i).map((pts) => (
                <button
                  key={pts}
                  disabled={redeem.isPending}
                  onClick={() => redeem.mutate({ points: pts })}
                  style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 11, letterSpacing: "0.06em",
                    color: "var(--gold-400)", background: "var(--onyx-800)",
                    border: "1px solid rgba(201,168,92,0.45)", borderRadius: 2,
                    padding: "8px 12px", cursor: redeem.isPending ? "default" : "pointer",
                    opacity: redeem.isPending ? 0.6 : 1,
                  }}
                >
                  {pts.toLocaleString()} pts → R{Math.round((pts / redemptionRate) * (config?.currencyUnitAmount ?? 10))}
                </button>
              ))}
            </div>
            {redeemError && (
              <div style={{ marginTop: 10, fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: 11, color: "#e57373" }}>
                {redeemError}
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginTop: 20, textAlign: "center", fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", fontSize: 14, fontStyle: "italic", color: "var(--cream-400)" }}>
            Earn {(minRedeem - balance).toLocaleString()} more points to unlock your first voucher.
          </div>
        )}

        {/* Separator */}
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-600) 20%,var(--onyx-600) 80%,transparent)", margin: "20px 0 16px" }} />

        {/* Your Rewards */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 22, fontWeight: 300, fontStyle: "italic", color: "var(--cream-100)",
          }}>
            Your Rewards
          </h2>
          <span style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--onyx-500)",
          }}>
            {activeVouchers.length} available
          </span>
        </div>
      </div>

      {/* Voucher scroll */}
      {activeVouchers.length > 0 ? (
        <div style={{
          display: "flex", gap: 10, overflowX: "auto",
          paddingLeft: 20, paddingRight: 20, paddingBottom: 4,
          scrollbarWidth: "none",
        }}>
          {activeVouchers.map((v) => (
            <RewardVoucher key={v.id} code={v.code} discountValue={v.discountValue} expiresAt={v.expiresAt} />
          ))}
        </div>
      ) : (
        <div style={{
          padding: "0 20px", marginBottom: 4,
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 14, fontStyle: "italic", color: "var(--cream-400)",
        }}>
          No vouchers yet — redeem points above to create one.
        </div>
      )}

      <div style={{ padding: "0 20px" }}>

        {/* Next tier perk */}
        {nextTier && (
          <div style={{
            margin: "16px 0",
            padding: "12px 16px",
            background: "var(--onyx-900)", border: "1px solid var(--onyx-700)",
            borderLeft: `2px solid ${nextTier.colHex}`,
            borderRadius: 2,
          }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase",
              color: nextTier.colHex, marginBottom: 4,
            }}>
              Next: {nextTier.label}
            </div>
            <div style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 15, fontWeight: 300, fontStyle: "italic", color: "var(--cream-400)",
            }}>
              {nextTier.tagline}
            </div>
          </div>
        )}

        {/* Separator */}
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-600) 20%,var(--onyx-600) 80%,transparent)", margin: "16px 0" }} />

        {/* Treat yourself — products within reach of your points */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
            <h2 style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 22, fontWeight: 300, fontStyle: "italic", color: "var(--cream-100)",
            }}>
              Treat Yourself
            </h2>
            <span style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--gold-400)",
            }}>
              R{suggested?.randValue ?? 0} in points
            </span>
          </div>
          <p style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 13, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-400)", lineHeight: 1.6, marginBottom: 12,
          }}>
            What your points could put towards a little something from the boutique
          </p>
        </div>
      </div>

      {/* Product chips scroll */}
      {suggested && suggested.products.length > 0 && (
        <div style={{
          display: "flex", gap: 8, overflowX: "auto",
          paddingLeft: 20, paddingRight: 20, paddingBottom: 4,
          scrollbarWidth: "none",
        }}>
          {suggested.products.map((p) => (
            <ProductChip
              key={p.id}
              name={p.name}
              brand={p.brand}
              price={p.price}
              imageUrl={p.imageUrl}
              covered={p.covered}
              discountedPrice={p.discountedPrice}
            />
          ))}
        </div>
      )}

      <div style={{ padding: "0 20px" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-600) 20%,var(--onyx-600) 80%,transparent)", margin: "20px 0 16px" }} />

        {/* Points history */}
        <h2 style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 22, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-100)", marginBottom: 14,
        }}>
          Points History
        </h2>

        {account?.transactions && account.transactions.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 24 }}>
            {account.transactions.map((tx) => (
              <div key={tx.id} style={{
                background: "var(--onyx-900)", border: "1px solid var(--onyx-700)",
                borderRadius: 2, padding: "12px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    fontSize: 15, fontWeight: 300, fontStyle: "italic",
                    color: "var(--cream-200)", marginBottom: 2,
                  }}>
                    {TX_LABELS[tx.type] ?? tx.type}
                  </div>
                  {tx.description && (
                    <div style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 9, letterSpacing: "0.12em", color: "var(--onyx-500)", marginBottom: 2,
                    }}>
                      {tx.description}
                    </div>
                  )}
                  <div style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 8, letterSpacing: "0.14em", color: "var(--onyx-600)",
                  }}>
                    {new Date(tx.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 16, fontWeight: 600,
                  color: tx.amount > 0 ? "var(--gold-400)" : "var(--onyx-500)",
                  flexShrink: 0,
                }}>
                  {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            padding: "40px 0", textAlign: "center",
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 16, fontWeight: 300, fontStyle: "italic", color: "var(--cream-400)",
          }}>
            <div style={{ width: 32, height: 1, background: "rgba(201,168,92,0.3)", margin: "0 auto 20px" }} />
            No activity yet — book your first treatment to start earning.
            <div style={{ marginTop: 16 }}>
              <Link href="/book" style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                color: "var(--gold-400)", textDecoration: "none",
                padding: "8px 16px", border: "1px solid rgba(201,168,92,0.4)", borderRadius: 2,
              }}>
                Book Now
              </Link>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmerTravel {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: -553; }
        }
      `}</style>
    </main>
  );
}
