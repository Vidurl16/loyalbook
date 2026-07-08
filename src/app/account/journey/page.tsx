"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

const CATEGORY_COLORS: Record<string, string> = {
  "Nimue Facials":        "#a18d6b",
  "Environ Facials":      "#8ba89e",
  "Placecol Facials":     "#b5918c",
  "Guinot Facials":       "#9b8fb5",
  "Dermalogica Facials":  "#7d9ab5",
  "Aesthetic Facials":    "#b59d7d",
  "Nails":                "#c9a85c",
  "Brows & Lashes":       "#a89e8b",
  "Waxing":               "#b5a08b",
  "Body Treatments":      "#8bb5a0",
};

const DEMO_JOURNEY = [
  {
    id: "1", month: "May 2026",
    entries: [
      { id: "a", service: "Dermalogica ProSkin 60", category: "Dermalogica Facials", therapist: "Jessica", date: "12 May 2026", pts: 77, price: 770 },
      { id: "b", service: "Gel Polish on Hands", category: "Nails", therapist: "Thandeka", date: "5 May 2026", pts: 34, price: 340 },
    ],
  },
  {
    id: "2", month: "April 2026",
    entries: [
      { id: "c", service: "Keratin Lash Lift", category: "Brows & Lashes", therapist: "Samantha", date: "22 Apr 2026", pts: 60, price: 600 },
      { id: "d", service: "Signature Pedicure", category: "Nails", therapist: "Thandeka", date: "8 Apr 2026", pts: 38, price: 380 },
    ],
  },
  {
    id: "3", month: "March 2026",
    entries: [
      { id: "e", service: "Nimue Therapeutic Treatment", category: "Nimue Facials", therapist: "Jessica", date: "18 Mar 2026", pts: 51, price: 510 },
      { id: "f", service: "Aromatherapy Massage (60min)", category: "Body Treatments", therapist: "Lauren", date: "3 Mar 2026", pts: 58, price: 580 },
    ],
  },
];

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-ZA", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function JourneyPage() {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login");

  const userId = (session?.user as any)?.id;
  const { data: client } = trpc.clients.me.useQuery(undefined, { enabled: !!userId });

  // Build grouped timeline from live data, fall back to demo
  type Entry = {
    id: string;
    service: string;
    category: string;
    therapist?: string;
    date: string;
    pts: number;
    price: number;
  };

  type Group = {
    id: string;
    month: string;
    entries: Entry[];
  };

  let groups: Group[] = DEMO_JOURNEY;

  const liveApts = client?.appointments?.filter((a) => a.status === "completed");
  if (liveApts && liveApts.length > 0) {
    const byMonth: Record<string, Entry[]> = {};
    for (const a of liveApts) {
      const d = new Date(a.startAt);
      const key = d.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
      if (!byMonth[key]) byMonth[key] = [];
      const ptsEarned = 0;
      byMonth[key].push({
        id: a.id,
        service: a.service.name,
        category: a.service.category,
        therapist: a.staff?.user.name ?? undefined,
        date: formatDate(a.startAt),
        pts: ptsEarned,
        price: a.service.price,
      });
    }
    groups = Object.entries(byMonth).map(([month, entries], i) => ({
      id: String(i),
      month,
      entries,
    }));
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--onyx-950)" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "var(--onyx-950)",
        borderBottom: "1px solid var(--onyx-800)",
        padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/account" style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--onyx-500)", textDecoration: "none",
        }}>
          ← Account
        </Link>
        <span style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 18, fontWeight: 300,
          color: "var(--cream-200)",
        }}>
          My Journey
        </span>
        <Link href="/book" style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "var(--gold-400)", textDecoration: "none",
          padding: "7px 14px",
          border: "1px solid rgba(201,168,92,0.45)",
          borderRadius: 2,
        }}>
          Book
        </Link>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* Heading */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
            color: "var(--gold-400)", marginBottom: 8,
          }}>
            Treatment History
          </div>
          <h1 style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 38, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", lineHeight: 1, marginBottom: 8,
          }}>
            Your journey.
          </h1>
          <p style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 12, letterSpacing: "0.06em",
            color: "var(--onyx-500)",
          }}>
            Every treatment, every moment of care — collected here.
          </p>
        </div>

        {/* Timeline */}
        {groups.map((group) => (
          <div key={group.id} style={{ marginBottom: 32 }}>
            {/* Month label */}
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "var(--onyx-600)",
              paddingBottom: 10,
              borderBottom: "1px solid var(--onyx-800)",
              marginBottom: 16,
            }}>
              {group.month}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.entries.map((entry, i) => {
                const dotColor = CATEGORY_COLORS[entry.category] ?? "var(--gold-400)";
                return (
                  <div key={entry.id} style={{
                    display: "flex", gap: 14,
                    alignItems: "flex-start",
                  }}>
                    {/* Timeline dot + line */}
                    <div style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      flexShrink: 0, paddingTop: 4,
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: dotColor, flexShrink: 0,
                      }} />
                      {i < group.entries.length - 1 && (
                        <div style={{
                          width: 1, flexGrow: 1, minHeight: 32,
                          background: "var(--onyx-800)", marginTop: 4,
                        }} />
                      )}
                    </div>

                    {/* Entry card */}
                    <div style={{
                      flex: 1,
                      background: "var(--onyx-900)",
                      border: "1px solid var(--onyx-700)",
                      borderRadius: 2, padding: "14px 16px",
                      marginBottom: i < group.entries.length - 1 ? 8 : 0,
                      boxShadow: "4px 4px 0 rgba(0,0,0,0.5)",
                    }}>
                      {/* Category pill */}
                      <div style={{ marginBottom: 6 }}>
                        <span style={{
                          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                          fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                          color: dotColor,
                          border: `1px solid ${dotColor}40`,
                          padding: "2px 7px", borderRadius: 2,
                        }}>
                          {entry.category}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                            fontSize: 17, fontWeight: 300, fontStyle: "italic",
                            color: "var(--cream-100)", marginBottom: 3,
                          }}>
                            {entry.service}
                          </div>
                          <div style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 11, color: "var(--onyx-500)",
                          }}>
                            {entry.therapist ? `with ${entry.therapist} · ` : ""}{entry.date}
                          </div>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                          {entry.pts > 0 && (
                            <div style={{
                              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                              fontSize: 11, fontWeight: 500,
                              color: "var(--gold-400)", marginBottom: 2,
                            }}>
                              +{entry.pts} pts
                            </div>
                          )}
                          <div style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 12, fontWeight: 600,
                            color: "var(--cream-400)",
                          }}>
                            R{entry.price}
                          </div>
                        </div>
                      </div>

                      {/* Rebook */}
                      <div style={{
                        marginTop: 10,
                        paddingTop: 10,
                        borderTop: "1px solid var(--onyx-800)",
                      }}>
                        <Link
                          href={`/book?category=${encodeURIComponent(entry.category)}`}
                          style={{
                            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                            fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase",
                            color: "var(--gold-400)", textDecoration: "none",
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
        ))}

        {groups.length === 0 && (
          <div style={{
            background: "var(--onyx-900)",
            border: "1px solid var(--onyx-700)",
            borderRadius: 2, padding: "48px 24px",
            textAlign: "center",
          }}>
            <div style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 20, fontWeight: 300, fontStyle: "italic",
              color: "var(--onyx-600)", marginBottom: 16,
            }}>
              Your journey begins with your first visit.
            </div>
            <Link href="/book" style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--gold-400)", textDecoration: "none",
              padding: "9px 20px",
              border: "1px solid rgba(201,168,92,0.45)",
              borderRadius: 2, display: "inline-block",
            }}>
              Book a Treatment
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
