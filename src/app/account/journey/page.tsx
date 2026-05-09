"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";

interface JourneyEntry {
  id: string;
  service: string;
  category: string;
  therapist: string | null;
  date: Date | string;
  points: number;
  price: number;
  status: string;
}

const DEMO_JOURNEY: JourneyEntry[] = [
  { id: "j0", service: "Noir Sculptural Set",       category: "Nails",   therapist: "Valentina R.", date: new Date(),                          points: 180, price: 580, status: "completed" },
  { id: "j1", service: "Luminous Lift Facial",      category: "Facials", therapist: "Sofia K.",     date: new Date(Date.now() - 14*86400000),   points: 220, price: 680, status: "completed" },
  { id: "j2", service: "Warm Marble Stone",         category: "Massage", therapist: "Leila K.",     date: new Date(Date.now() - 30*86400000),   points: 195, price: 550, status: "completed" },
  { id: "j3", service: "Lash Lift & Tint",          category: "Lashes",  therapist: "Elena V.",     date: new Date(Date.now() - 42*86400000),   points: 145, price: 425, status: "completed" },
  { id: "j4", service: "Ivory Gel French",          category: "Nails",   therapist: "Valentina R.", date: new Date(Date.now() - 60*86400000),   points: 155, price: 480, status: "completed" },
  { id: "j5", service: "Full Body Silhouette Wax",  category: "Waxing",  therapist: "Inès M.",      date: new Date(Date.now() - 90*86400000),   points: 260, price: 780, status: "completed" },
];

const CATEGORY_COLORS: Record<string, string> = {
  Nails:   "#c9a85c",
  Facials: "#cbc4b8",
  Massage: "#c8864a",
  Lashes:  "#b8d4b8",
  Waxing:  "#c4aec4",
  Skin:    "#dfc07a",
  Body:    "#b8c4d4",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
}

function formatMonth(date: Date | string) {
  return new Date(date).toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
}

export default function JourneyPage() {
  const { data: session } = useSession();
  const userId = (session?.user as { id?: string })?.id;

  const { data: client } = trpc.clients.get.useQuery(
    { id: userId! },
    { enabled: !!userId }
  );

  // Build journey entries from real appointments + transactions
  const liveEntries: JourneyEntry[] = (client?.appointments ?? [])
    .filter((a) => a.status === "completed" || new Date(a.startAt) < new Date())
    .map((a) => {
      const matchedTx = client?.loyaltyAccount?.transactions.find(
        (tx) => tx.appointmentId === a.id && tx.amount > 0
      );
      return {
        id: a.id,
        service: a.service.name,
        category: a.service.category,
        therapist: a.staff?.user.name ?? null,
        date: a.startAt,
        points: matchedTx?.amount ?? Math.round(a.service.price / 10),
        price: a.service.price,
        status: a.status,
      };
    });

  const entries: JourneyEntry[] = liveEntries.length > 0 ? liveEntries : DEMO_JOURNEY;

  // Group by month
  const grouped: { month: string; items: JourneyEntry[] }[] = [];
  entries.forEach((entry) => {
    const month = formatMonth(entry.date);
    const existing = grouped.find((g) => g.month === month);
    if (existing) {
      existing.items.push(entry);
    } else {
      grouped.push({ month, items: [entry] });
    }
  });

  const totalPoints = entries.reduce((s, e) => s + e.points, 0);
  const totalVisits = entries.length;

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
        <Link href="/account/rewards" style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--cream-400)", textDecoration: "none",
          padding: "6px 12px", border: "1px solid var(--onyx-600)", borderRadius: 2,
        }}>
          Rewards
        </Link>
      </nav>

      {/* Header */}
      <div style={{ padding: "36px 20px 0" }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "var(--gold-400)", marginBottom: 6,
        }}>
          Your story
        </div>
        <h1 style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(32px, 9vw, 48px)", fontWeight: 300, lineHeight: 0.95,
          letterSpacing: "0.01em", marginBottom: 10,
        }}>
          <em style={{ fontStyle: "italic", color: "var(--cream-200)" }}>Treatment</em>{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold-400)" }}>History</em>
        </h1>
        <p style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 15, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-400)", lineHeight: 1.7, marginBottom: 20,
        }}>
          Every visit, every point, every moment of self-care — recorded here.
        </p>

        {/* Summary stats */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
          {[
            { label: "Visits", value: totalVisits.toString() },
            { label: "Points Earned", value: totalPoints.toLocaleString() },
          ].map((stat, i) => (
            <div key={stat.label} style={{
              flex: 1,
              padding: "16px 18px",
              background: "var(--onyx-900)",
              border: "1px solid var(--onyx-700)",
              borderRadius: i === 0 ? "2px 0 0 2px" : "0 2px 2px 0",
              borderLeft: i === 1 ? "none" : undefined,
              boxShadow: "4px 5px 0 rgba(0,0,0,0.6)",
            }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase",
                color: "var(--onyx-500)", marginBottom: 4,
              }}>
                {stat.label}
              </div>
              <div style={{
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 28, fontWeight: 300, color: "var(--gold-400)", lineHeight: 1,
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg,transparent,var(--onyx-600) 20%,var(--onyx-600) 80%,transparent)", marginBottom: 24 }} />
      </div>

      {/* Timeline */}
      <div style={{ padding: "0 20px 48px" }}>
        {entries.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <div style={{ width: 32, height: 1, background: "rgba(201,168,92,0.3)", margin: "0 auto 20px" }} />
            <p style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 17, fontWeight: 300, fontStyle: "italic", color: "var(--cream-400)",
            }}>
              Your journey begins with your first visit.
            </p>
            <div style={{ marginTop: 20 }}>
              <Link href="/book" style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                color: "var(--gold-400)", textDecoration: "none",
                padding: "10px 18px", border: "1px solid rgba(201,168,92,0.4)", borderRadius: 2,
              }}>
                Book Now
              </Link>
            </div>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.month} style={{ marginBottom: 32 }}>
              {/* Month header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 16, height: 1, background: "rgba(201,168,92,0.35)" }} />
                <span style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
                  color: "var(--gold-400)",
                }}>
                  {group.month}
                </span>
                <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(201,168,92,0.35),transparent)" }} />
              </div>

              {/* Entries in this month */}
              <div style={{ position: "relative" }}>
                {/* Vertical timeline line */}
                <div style={{
                  position: "absolute", left: 17, top: 0, bottom: 0, width: 1,
                  background: "linear-gradient(180deg,var(--onyx-700),transparent)",
                }} />

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {group.items.map((entry) => {
                    const catColor = CATEGORY_COLORS[entry.category] ?? "var(--gold-400)";
                    return (
                      <div key={entry.id} style={{ display: "flex", gap: 14 }}>
                        {/* Timeline dot */}
                        <div style={{ flexShrink: 0, paddingTop: 14 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: catColor,
                            boxShadow: `0 0 8px ${catColor}66`,
                            marginLeft: 13,
                          }} />
                        </div>

                        {/* Card */}
                        <div style={{
                          flex: 1,
                          background: "var(--onyx-900)",
                          border: "1px solid var(--onyx-700)",
                          borderLeft: `2px solid ${catColor}55`,
                          borderRadius: 2,
                          padding: "14px 16px",
                          boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
                        }}>
                          {/* Category pill */}
                          <div style={{
                            display: "inline-block",
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 7, letterSpacing: "0.24em", textTransform: "uppercase",
                            color: catColor,
                            border: `1px solid ${catColor}44`,
                            padding: "2px 7px", borderRadius: 2, marginBottom: 6,
                          }}>
                            {entry.category}
                          </div>

                          {/* Service name */}
                          <div style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                            fontSize: 19, fontWeight: 300, fontStyle: "italic",
                            color: "var(--cream-100)", lineHeight: 1.15, marginBottom: 4,
                          }}>
                            {entry.service}
                          </div>

                          {/* Meta row */}
                          <div style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 9, letterSpacing: "0.14em",
                            color: "var(--cream-400)", marginBottom: 12,
                          }}>
                            {entry.therapist && `${entry.therapist} · `}{formatDate(entry.date)}
                          </div>

                          {/* Footer row */}
                          <div style={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            paddingTop: 10, borderTop: "1px solid var(--onyx-800)",
                          }}>
                            {/* Points earned */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold-400)", opacity: 0.7 }} />
                              <span style={{
                                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                                fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                                color: "var(--gold-400)",
                              }}>
                                +{entry.points} pts
                              </span>
                              <span style={{
                                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                                fontSize: 9, letterSpacing: "0.14em",
                                color: "var(--onyx-500)",
                              }}>
                                · R{entry.price}
                              </span>
                            </div>

                            {/* Rebook */}
                            <Link
                              href={`/book?category=${encodeURIComponent(entry.category)}`}
                              style={{
                                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                                fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                                color: "var(--cream-400)", textDecoration: "none",
                                padding: "5px 10px",
                                border: "1px solid var(--onyx-700)",
                                borderRadius: 2,
                              }}
                            >
                              Rebook →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </main>
  );
}
