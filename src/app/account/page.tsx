"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { redirect } from "next/navigation";
import { brand } from "@/lib/brand";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const STATUS_CONFIG: Record<string, { label: string; accent?: boolean }> = {
  pending:             { label: "Awaiting Confirmation" },
  confirmed:           { label: "Confirmed", accent: true },
  completed:           { label: "Completed" },
  no_show:             { label: "No Show" },
  cancelled_by_client: { label: "Cancelled" },
  cancelled_by_spa:    { label: "Cancelled" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status };
  return (
    <span style={{
      fontFamily: "var(--font-abel), Abel, sans-serif",
      fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: 2,
      color: cfg.accent ? "#d41d7f" : "#8d8e8f",
      background: cfg.accent ? "rgba(254,50,156,0.08)" : "#faf6f5",
      border: `1px solid ${cfg.accent ? "rgba(254,50,156,0.3)" : "#efdcd8"}`,
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

  const upcoming = client?.appointments?.filter((a) =>
    new Date(a.startAt) >= new Date() && ["pending", "confirmed"].includes(a.status)
  ).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const past = client?.appointments?.filter((a) =>
    new Date(a.startAt) < new Date() || a.status === "completed"
  ).sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()).slice(0, 5);

  return (
    <main style={{ minHeight: "100vh", background: "#ffffff" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "#ffffff",
        borderBottom: "1px solid #efdcd8",
        padding: "16px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-marcellus), Marcellus, serif",
          fontSize: 20, fontWeight: 400,
          color: "#232122", textDecoration: "none", letterSpacing: "0.04em",
        }}>
          {brand.name}
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/book" style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#ffffff", background: "#232122", textDecoration: "none",
            padding: "8px 16px",
            border: "1px solid #232122",
            borderRadius: 2,
          }}>
            Book
          </Link>
          <span style={{
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 12, color: "#8d8e8f",
          }}>
            {session?.user?.name}
          </span>
        </div>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Loyalty card */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #efdcd8",
          borderRadius: 2,
          padding: "28px 24px",
          marginBottom: 20,
          boxShadow: "0 10px 30px rgba(35,33,34,0.07)",
          position: "relative",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{
                fontFamily: "var(--font-abel), Abel, sans-serif",
                fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
                color: "#8d8e8f", marginBottom: 6,
              }}>
                Points Balance
              </div>
              <div style={{
                fontFamily: "var(--font-marcellus), Marcellus, serif",
                fontSize: 44, fontWeight: 400,
                color: "#fe329c", lineHeight: 1,
              }}>
                {balance.toLocaleString()}
              </div>
              <div style={{
                fontFamily: "var(--font-abel), Abel, sans-serif",
                fontSize: 12, color: "#8d8e8f", marginTop: 6,
              }}>
                Lifetime earned: {lifetime.toLocaleString()} pts
              </div>
            </div>
          </div>

          {/* CTA row */}
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/account/rewards" style={{
              flex: 1, textAlign: "center",
              padding: "10px",
              background: "#232122",
              border: "1px solid #232122",
              borderRadius: 2, textDecoration: "none",
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#ffffff",
            }}>
              Loyalty Hub
            </Link>
            <Link href="/account/bookings" style={{
              flex: 1, textAlign: "center",
              padding: "10px",
              background: "transparent",
              border: "1px solid #fe329c",
              borderRadius: 2, textDecoration: "none",
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#fe329c",
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
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "#d41d7f",
            }}>
              Upcoming Treatments
            </div>
            <Link href="/book" style={{
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 10, letterSpacing: "0.14em",
              color: "#8d8e8f", textDecoration: "none",
            }}>
              + Book new
            </Link>
          </div>

          {!upcoming || upcoming.length === 0 ? (
            <div style={{
              background: "#faf6f5",
              border: "1px solid #efdcd8",
              borderRadius: 2, padding: "32px 24px",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "var(--font-marcellus), Marcellus, serif",
                fontSize: 17, fontWeight: 400,
                color: "#4a4547", marginBottom: 14,
              }}>
                No upcoming treatments scheduled.
              </div>
              <Link href="/book" style={{
                fontFamily: "var(--font-abel), Abel, sans-serif",
                fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                color: "#ffffff", background: "#232122", textDecoration: "none",
                padding: "9px 20px",
                border: "1px solid #232122",
                borderRadius: 2, display: "inline-block",
              }}>
                Book Now
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcoming.map((apt) => (
                <div key={apt.id} style={{
                  background: "#ffffff",
                  border: "1px solid #efdcd8",
                  borderRadius: 2, padding: "16px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                  boxShadow: "0 10px 30px rgba(35,33,34,0.07)",
                }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-marcellus), Marcellus, serif",
                      fontSize: 17, fontWeight: 400,
                      color: "#232122", marginBottom: 4,
                    }}>
                      {apt.service.name}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-abel), Abel, sans-serif",
                      fontSize: 12, color: "#8d8e8f",
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
                      fontFamily: "var(--font-abel), Abel, sans-serif",
                      fontSize: 13, fontWeight: 400, color: "#d41d7f",
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
              fontFamily: "var(--font-abel), Abel, sans-serif",
              fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "#8d8e8f", marginBottom: 14,
            }}>
              Recent Treatments
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {past.map((apt) => (
                <div key={apt.id} style={{
                  background: "#faf6f5",
                  border: "1px solid #efdcd8",
                  borderRadius: 2, padding: "12px 20px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-abel), Abel, sans-serif",
                      fontSize: 14, color: "#232122",
                    }}>
                      {apt.service.name}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-abel), Abel, sans-serif",
                      fontSize: 11, color: "#8d8e8f", marginTop: 2,
                    }}>
                      {new Date(apt.startAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Link href={`/book?category=${encodeURIComponent(apt.service.category)}`} style={{
                      fontFamily: "var(--font-abel), Abel, sans-serif",
                      fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
                      color: "#fe329c", textDecoration: "none",
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
