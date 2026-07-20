"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { redirect } from "next/navigation";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const TIERS = [
  { id: "bronze",  label: "Bronze",     min: 0,     max: 2499,    hex: "#c8864a" },
  { id: "silver",  label: "Silver",     min: 2500,  max: 4999,    hex: "#cbc4b8" },
  { id: "gold",    label: "Gold",       min: 5000,  max: 9999,    hex: "#c9a85c" },
  { id: "perfect", label: "Perfect 10", min: 10000, max: Infinity, hex: "#f5f0e4" },
];

function getTier(pts: number) {
  return TIERS.find((t) => pts >= t.min && pts <= t.max) ?? TIERS[0];
}

const STATUS_CONFIG: Record<string, { label: string; gold?: boolean }> = {
  pending:             { label: "Awaiting Confirmation" },
  confirmed:           { label: "Confirmed", gold: true },
  completed:           { label: "Completed" },
  no_show:             { label: "No Show" },
  cancelled_by_client: { label: "Cancelled" },
  cancelled_by_spa:    { label: "Cancelled" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status };
  return (
    <span style={{
      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
      fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 2,
      color: cfg.gold ? "var(--gold-400)" : "var(--onyx-500)",
      background: cfg.gold ? "rgba(201,168,92,0.1)" : "var(--onyx-800)",
      border: `1px solid ${cfg.gold ? "rgba(201,168,92,0.3)" : "var(--onyx-700)"}`,
    }}>
      {cfg.label}
    </span>
  );
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login");

  const userId = (session?.user as any)?.id;
  const { data: client } = trpc.clients.me.useQuery(undefined, { enabled: !!userId });

  const lifetime = client?.loyaltyAccount?.lifetimeEarned ?? 0;
  const balance  = client?.loyaltyAccount?.balance ?? 0;
  const tier = getTier(lifetime);
  const nextTier = TIERS[TIERS.findIndex((t) => t.id === tier.id) + 1];

  const upcoming = client?.appointments?.filter((a) =>
    new Date(a.startAt) >= new Date() && ["pending", "confirmed"].includes(a.status)
  ).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const past = client?.appointments?.filter((a) =>
    new Date(a.startAt) < new Date() || a.status === "completed"
  ).sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()).slice(0, 5);

  const progressPct = nextTier
    ? Math.min(100, ((lifetime - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  return (
    <main style={{ minHeight: "100vh", background: "var(--onyx-950)" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "var(--onyx-950)",
        borderBottom: "1px solid var(--onyx-800)",
        padding: "16px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 20, fontWeight: 300, fontStyle: "italic",
          color: "var(--gold-400)", textDecoration: "none",
        }}>
          Perfect 10
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/book" style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "var(--gold-400)", textDecoration: "none",
            padding: "8px 16px",
            border: "1px solid rgba(201,168,92,0.45)",
            borderRadius: 2,
          }}>
            Book
          </Link>
          <span style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 12, color: "var(--onyx-500)",
          }}>
            {session?.user?.name}
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Loyalty card */}
        <div style={{
          background: "var(--onyx-900)",
          border: "1px solid var(--onyx-700)",
          borderRadius: 2,
          padding: "28px 24px",
          marginBottom: 20,
          boxShadow: "6px 8px 0 rgba(0,0,0,0.65)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Subtle decorative lines */}
          <div style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 1,
            background: "linear-gradient(180deg,rgba(201,168,92,0.2) 0%,transparent 100%)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
                color: "var(--onyx-500)", marginBottom: 6,
              }}>
                Points Balance
              </div>
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 44, fontWeight: 600,
                color: "var(--cream-100)", lineHeight: 1,
              }}>
                {balance.toLocaleString()}
              </div>
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 11, color: "var(--onyx-500)", marginTop: 4,
              }}>
                Lifetime earned: {lifetime.toLocaleString()} pts
              </div>
            </div>
            <div style={{
              textAlign: "right",
            }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
                color: "var(--onyx-500)", marginBottom: 4,
              }}>
                Tier
              </div>
              <div style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 18, fontWeight: 300, fontStyle: "italic",
                color: tier.hex,
              }}>
                {tier.label}
              </div>
            </div>
          </div>

          {/* Tier progress bar */}
          {nextTier && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 6,
              }}>
                <span style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 9, letterSpacing: "0.14em", color: "var(--onyx-600)",
                }}>
                  {tier.label}
                </span>
                <span style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 9, letterSpacing: "0.14em", color: "var(--onyx-600)",
                }}>
                  {nextTier.label} at {nextTier.min.toLocaleString()} pts
                </span>
              </div>
              <div style={{
                height: 2, background: "var(--onyx-800)", borderRadius: 1, overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  background: "var(--gold-400)",
                  width: `${progressPct}%`,
                  transition: "width 0.6s ease",
                }} />
              </div>
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, color: "var(--onyx-600)", marginTop: 4,
              }}>
                {Math.max(0, nextTier.min - lifetime).toLocaleString()} pts to {nextTier.label}
              </div>
            </div>
          )}

          {/* CTA row */}
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/account/rewards" style={{
              flex: 1, textAlign: "center",
              padding: "10px",
              background: "transparent",
              border: "1px solid rgba(201,168,92,0.45)",
              borderRadius: 2, textDecoration: "none",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--gold-400)",
            }}>
              Loyalty Hub
            </Link>
            <Link href="/account/journey" style={{
              flex: 1, textAlign: "center",
              padding: "10px",
              background: "transparent",
              border: "1px solid var(--onyx-700)",
              borderRadius: 2, textDecoration: "none",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--cream-400)",
            }}>
              My Journey
            </Link>
            <Link href="/account/bookings" style={{
              flex: 1, textAlign: "center",
              padding: "10px",
              background: "transparent",
              border: "1px solid var(--onyx-700)",
              borderRadius: 2, textDecoration: "none",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--cream-400)",
            }}>
              Bookings
            </Link>
          </div>
        </div>

        {/* Upcoming treatments */}
        <section style={{ marginBottom: 28 }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: 14,
          }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "var(--gold-400)",
            }}>
              Upcoming Treatments
            </div>
            <Link href="/book" style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.14em",
              color: "var(--onyx-500)", textDecoration: "none",
            }}>
              + Book new
            </Link>
          </div>

          {!upcoming || upcoming.length === 0 ? (
            <div style={{
              background: "var(--onyx-900)",
              border: "1px solid var(--onyx-700)",
              borderRadius: 2, padding: "32px 24px",
              textAlign: "center",
              boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
            }}>
              <div style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 18, fontWeight: 300, fontStyle: "italic",
                color: "var(--onyx-600)", marginBottom: 14,
              }}>
                No upcoming treatments scheduled.
              </div>
              <Link href="/book" style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
                color: "var(--gold-400)", textDecoration: "none",
                padding: "9px 20px",
                border: "1px solid rgba(201,168,92,0.45)",
                borderRadius: 2, display: "inline-block",
              }}>
                Book Now
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcoming.map((apt) => (
                <div key={apt.id} style={{
                  background: "var(--onyx-900)",
                  border: "1px solid var(--onyx-700)",
                  borderRadius: 2, padding: "16px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
                }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                      fontSize: 18, fontWeight: 300, fontStyle: "italic",
                      color: "var(--cream-100)", marginBottom: 4,
                    }}>
                      {apt.service.name}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 11, color: "var(--onyx-500)",
                    }}>
                      {apt.staff ? `with ${apt.staff.user.name} · ` : ""}
                      {new Date(apt.startAt).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })}
                      {" at "}
                      {new Date(apt.startAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <StatusBadge status={apt.status} />
                    <span style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 12, fontWeight: 600, color: "var(--gold-400)",
                    }}>
                      R{apt.service.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent treatments */}
        {past && past.length > 0 && (
          <section>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "var(--onyx-600)", marginBottom: 14,
            }}>
              Recent Treatments
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {past.map((apt) => (
                <div key={apt.id} style={{
                  background: "var(--onyx-900)",
                  border: "1px solid var(--onyx-800)",
                  borderRadius: 2, padding: "12px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 13, color: "var(--cream-300)",
                    }}>
                      {apt.service.name}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 10, color: "var(--onyx-600)", marginTop: 2,
                    }}>
                      {new Date(apt.startAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Link href={`/book?category=${encodeURIComponent(apt.service.category)}`} style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 9, letterSpacing: "0.14em",
                      color: "var(--gold-400)", textDecoration: "none",
                    }}>
                      Rebook
                    </Link>
                    <StatusBadge status={apt.status} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
