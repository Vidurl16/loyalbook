"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { brand } from "@/lib/brand";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID ?? "";

// ── Points Meter ────────────────────────────────────────────────────────────
function PointsMeter({ points, minRedeem, randValue }: {
  points: number; minRedeem: number; randValue: number;
}) {
  const [arcPct, setArcPct] = useState(0);
  const rafRef = useRef<number>(0);

  // Ring fills toward the next redeemable voucher; full once redeemable.
  const targetPct = minRedeem > 0 ? Math.min(points / minRedeem, 1) : 1;
  const R = 90;
  const SIZE = 220;
  const CX = SIZE / 2;
  const CIRC = 2 * Math.PI * R;

  useEffect(() => {
    setArcPct(0);
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
      }
    };
    const delay = setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, 400);
    return () => { clearTimeout(delay); cancelAnimationFrame(rafRef.current); };
  }, [targetPct]);

  const filled = CIRC * arcPct;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        fontFamily: "var(--font-abel), Abel, sans-serif",
        fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
        color: "#8d8e8f", marginBottom: 14,
      }}>
        Your Points
      </div>

      <div style={{ position: "relative", width: SIZE, height: SIZE }}>
        <svg
          width={SIZE} height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: "rotate(-90deg)", display: "block" }}
        >
          {/* Track */}
          <circle cx={CX} cy={CX} r={R} fill="none" stroke="#f7eae7" strokeWidth="10" />
          {/* Inner hairline */}
          <circle cx={CX} cy={CX} r={R - 18} fill="none" stroke="#efdcd8" strokeWidth="1" />

          {/* Pink fill arc */}
          {arcPct > 0 && (
            <circle
              cx={CX} cy={CX} r={R}
              fill="none"
              stroke="#fe329c"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${CIRC}`}
            />
          )}
        </svg>

        {/* Center content */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 2,
        }}>
          <div style={{
            fontFamily: "var(--font-marcellus), Marcellus, serif",
            fontSize: 38, fontWeight: 400, lineHeight: 1, letterSpacing: "-0.02em",
            color: "#fe329c",
          }}>
            {points.toLocaleString()}
          </div>
          <div style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
            color: "#8d8e8f",
          }}>
            points
          </div>
          <div style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 14,
            color: "#4a4547",
          }}>
            ≈ R{randValue} value
          </div>
        </div>
      </div>

      {points < minRedeem && (
        <div style={{ marginTop: 8, textAlign: "center" }}>
          <span style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#8d8e8f",
          }}>
            {(minRedeem - points).toLocaleString()} pts to your next voucher
          </span>
        </div>
      )}
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
      background: "#ffffff",
      border: "1px solid #efdcd8",
      borderRadius: 2,
      boxShadow: "0 10px 30px rgba(35,33,34,0.07)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Top pink strip */}
      <div style={{ height: 3, background: "#fe329c" }} />

      <div style={{ padding: "12px 14px 13px" }}>
        <div style={{
          fontFamily: "var(--font-abel), Abel, sans-serif",
          fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "#d41d7f", marginBottom: 6,
        }}>
          Discount Voucher
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 10 }}>
          <span style={{
            fontFamily: "var(--font-marcellus), Marcellus, serif",
            fontSize: 26, fontWeight: 400, color: "#fe329c", lineHeight: 1,
          }}>
            <sup style={{ fontSize: 12, verticalAlign: "super", color: "#d41d7f" }}>R</sup>{discountValue}
          </span>
          <span style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase", color: "#8d8e8f",
          }}>
            off any treatment
          </span>
        </div>
        {/* Code — the client shows this in-salon */}
        <div style={{
          background: "#faf6f5", border: "1px dashed #fe329c", borderRadius: 2,
          padding: "8px 10px", textAlign: "center", marginBottom: 8,
        }}>
          <div style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 15, fontWeight: 400, letterSpacing: "0.12em", color: "#232122",
          }}>
            {code}
          </div>
        </div>
        <div style={{
          fontFamily: "var(--font-abel), Abel, sans-serif",
          fontSize: 8, letterSpacing: "0.12em", color: "#8d8e8f",
        }}>
          Show in-salon · Exp {expiry}
        </div>
      </div>
    </div>
  );
}

// ── Product suggestion chip (redeemed in-salon — not a link) ────────────────
function ProductChip({ name, brand: productBrand, price, imageUrl, covered, discountedPrice }: {
  name: string; brand: string; price: number; imageUrl?: string | null;
  covered: boolean; discountedPrice: number;
}) {
  return (
    <div style={{
      flexShrink: 0, width: 104,
      background: "#ffffff", border: "1px solid #efdcd8",
      borderRadius: 2, overflow: "hidden",
      boxShadow: "0 10px 30px rgba(35,33,34,0.07)",
    }}>
      <div style={{ height: 64, background: "#f7eae7", position: "relative" }}>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
        {covered && (
          <div style={{
            position: "absolute", top: 5, right: 5,
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase",
            color: "#ffffff", background: "#fe329c",
            padding: "2px 5px", borderRadius: 2,
          }}>
            Covered
          </div>
        )}
      </div>
      <div style={{ padding: "7px 8px 8px" }}>
        <div style={{
          fontFamily: "var(--font-marcellus), Marcellus, serif",
          fontSize: 12, fontWeight: 400,
          color: "#232122", lineHeight: 1.2, marginBottom: 2,
        }}>
          {name}
        </div>
        <div style={{
          fontFamily: "var(--font-abel), Abel, sans-serif",
          fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "#8d8e8f", marginBottom: 4,
        }}>
          {productBrand}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{
            fontFamily: "var(--font-marcellus), Marcellus, serif",
            fontSize: 13, fontWeight: 400, color: "#d41d7f",
          }}>
            <sup style={{ fontSize: 8, color: "#c98d82", verticalAlign: "super" }}>R</sup>{covered ? 0 : discountedPrice}
          </span>
          {!covered && discountedPrice < price && (
            <span style={{
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 9, color: "#8d8e8f", textDecoration: "line-through",
            }}>
              R{price}
            </span>
          )}
        </div>
      </div>
    </div>
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

  const balance            = account?.balance         ?? 0;
  const redemptionRate     = config?.redemptionRate   ?? 100;
  const currencyUnitAmount = config?.currencyUnitAmount ?? 10;
  const minRedeem          = config?.minRedeem        ?? 500;
  const canRedeem          = balance >= minRedeem;
  const randValue          = Math.round((balance / redemptionRate) * currencyUnitAmount);

  const activeVouchers = (vouchers ?? []).filter((v) => v.status === "active");

  const userName = session?.user?.name ?? "Your membership";

  return (
    <main style={{ minHeight: "100vh", background: "#ffffff" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "#ffffff", borderBottom: "1px solid #efdcd8",
        padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 52,
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-marcellus), Marcellus, serif",
          fontSize: 18, fontWeight: 400,
          color: "#232122", textDecoration: "none", letterSpacing: "0.04em",
        }}>
          {brand.name}
        </Link>
        <Link href="/account/bookings" style={{
          fontFamily: "var(--font-abel), Abel, sans-serif",
          fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "#fe329c", textDecoration: "none",
          padding: "6px 12px", border: "1px solid #fe329c", borderRadius: 2,
        }}>
          Bookings
        </Link>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        <div style={{ padding: "32px 20px 0" }}>

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "#d41d7f", marginBottom: 5,
            }}>
              My Membership
            </div>
            <h1 style={{
              fontFamily: "var(--font-marcellus), Marcellus, serif",
              fontSize: 26, fontWeight: 400,
              color: "#232122", lineHeight: 1.1, marginBottom: 6,
            }}>
              {userName}
            </h1>
            <p style={{
              fontFamily: "var(--font-bad-script), 'Bad Script', cursive",
              fontSize: 15,
              color: "#c98d82",
            }}>
              your points, your treats
            </p>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: "#efdcd8", marginBottom: 24 }} />

          {/* Points meter */}
          <PointsMeter points={balance} minRedeem={minRedeem} randValue={randValue} />

          {/* Redeem — mint a discount voucher from points */}
          {canRedeem ? (
            <div style={{ marginTop: 24, padding: "14px 16px", background: "#faf6f5", border: "1px solid #efdcd8", borderRadius: 2 }}>
              <div style={{
                fontFamily: "var(--font-abel), Abel, sans-serif",
                fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                color: "#d41d7f", marginBottom: 8,
              }}>
                Redeem points for a voucher
              </div>
              <p style={{
                fontFamily: "var(--font-abel), Abel, sans-serif",
                fontSize: 13,
                color: "#4a4547", lineHeight: 1.5, marginBottom: 12,
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
                      fontFamily: "var(--font-abel), Abel, sans-serif",
                      fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                      color: "#ffffff", background: "#232122",
                      border: "1px solid #232122", borderRadius: 2,
                      padding: "8px 12px", cursor: redeem.isPending ? "default" : "pointer",
                      opacity: redeem.isPending ? 0.6 : 1,
                    }}
                  >
                    {pts.toLocaleString()} pts → R{Math.round((pts / redemptionRate) * currencyUnitAmount)}
                  </button>
                ))}
              </div>
              {redeemError && (
                <div style={{ marginTop: 10, fontFamily: "var(--font-abel), Abel, sans-serif", fontSize: 11, color: "#d41d7f" }}>
                  {redeemError}
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginTop: 24, textAlign: "center", fontFamily: "var(--font-abel), Abel, sans-serif", fontSize: 13, color: "#4a4547" }}>
              Earn {(minRedeem - balance).toLocaleString()} more points to unlock your first voucher.
            </div>
          )}

          {/* Separator */}
          <div style={{ height: 1, background: "#efdcd8", margin: "24px 0 16px" }} />

          {/* Your Rewards */}
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{
              fontFamily: "var(--font-marcellus), Marcellus, serif",
              fontSize: 22, fontWeight: 400, color: "#232122",
            }}>
              Your Rewards
            </h2>
            <span style={{
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8d8e8f",
            }}>
              {activeVouchers.length} available
            </span>
          </div>
        </div>

        {/* Voucher scroll */}
        {activeVouchers.length > 0 ? (
          <div style={{
            display: "flex", gap: 10, overflowX: "auto",
            paddingLeft: 20, paddingRight: 20, paddingBottom: 12,
            scrollbarWidth: "none",
          }}>
            {activeVouchers.map((v) => (
              <RewardVoucher key={v.id} code={v.code} discountValue={v.discountValue} expiresAt={v.expiresAt} />
            ))}
          </div>
        ) : (
          <div style={{
            padding: "0 20px", marginBottom: 4,
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 13, color: "#4a4547",
          }}>
            No vouchers yet — redeem points above to create one.
          </div>
        )}

        <div style={{ padding: "0 20px" }}>
          {/* Separator */}
          <div style={{ height: 1, background: "#efdcd8", margin: "16px 0" }} />

          {/* Treat yourself — products within reach of your points */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
              <h2 style={{
                fontFamily: "var(--font-marcellus), Marcellus, serif",
                fontSize: 22, fontWeight: 400, color: "#232122",
              }}>
                Treat Yourself
              </h2>
              <span style={{
                fontFamily: "var(--font-abel), Abel, sans-serif",
                fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#d41d7f",
              }}>
                R{suggested?.randValue ?? 0} in points
              </span>
            </div>
            <p style={{
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 13,
              color: "#4a4547", lineHeight: 1.6, marginBottom: 12,
            }}>
              What your points could put towards a little something — ask us in-salon
            </p>
          </div>
        </div>

        {/* Product chips scroll */}
        {suggested && suggested.products.length > 0 && (
          <div style={{
            display: "flex", gap: 8, overflowX: "auto",
            paddingLeft: 20, paddingRight: 20, paddingBottom: 12,
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
          <div style={{ height: 1, background: "#efdcd8", margin: "20px 0 16px" }} />

          {/* Points history */}
          <h2 style={{
            fontFamily: "var(--font-marcellus), Marcellus, serif",
            fontSize: 22, fontWeight: 400,
            color: "#232122", marginBottom: 14,
          }}>
            Points History
          </h2>

          {account?.transactions && account.transactions.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 40 }}>
              {account.transactions.map((tx) => (
                <div key={tx.id} style={{
                  background: "#ffffff", border: "1px solid #efdcd8",
                  borderRadius: 2, padding: "12px 16px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 12,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "var(--font-abel), Abel, sans-serif",
                      fontSize: 14,
                      color: "#232122", marginBottom: 2,
                    }}>
                      {TX_LABELS[tx.type] ?? tx.type}
                    </div>
                    {tx.description && (
                      <div style={{
                        fontFamily: "var(--font-abel), Abel, sans-serif",
                        fontSize: 10, letterSpacing: "0.08em", color: "#8d8e8f", marginBottom: 2,
                      }}>
                        {tx.description}
                      </div>
                    )}
                    <div style={{
                      fontFamily: "var(--font-abel), Abel, sans-serif",
                      fontSize: 9, letterSpacing: "0.14em", color: "#8d8e8f",
                    }}>
                      {new Date(tx.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "var(--font-abel), Abel, sans-serif",
                    fontSize: 16,
                    color: tx.amount > 0 ? "#fe329c" : "#8d8e8f",
                    flexShrink: 0,
                  }}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              padding: "40px 0 60px", textAlign: "center",
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 15, color: "#4a4547",
            }}>
              <div style={{ width: 32, height: 1, background: "#e8bab3", margin: "0 auto 20px" }} />
              No activity yet — book your first treatment to start earning.
              <div style={{ marginTop: 16 }}>
                <Link href="/book" style={{
                  fontFamily: "var(--font-abel), Abel, sans-serif",
                  fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "#ffffff", background: "#232122", textDecoration: "none",
                  padding: "8px 16px", border: "1px solid #232122", borderRadius: 2,
                  display: "inline-block",
                }}>
                  Book Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
