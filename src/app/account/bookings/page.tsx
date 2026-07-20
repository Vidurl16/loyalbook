"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { AccentLabel } from "@/components/ui/AccentLabel";
import { GoldButton } from "@/components/ui/GoldButton";

const STATUS_CONFIG: Record<string, { label: string; variant: "gold" | "muted" | "dark" }> = {
  pending:             { label: "Awaiting Confirmation", variant: "muted" },
  confirmed:           { label: "Confirmed",             variant: "gold" },
  completed:           { label: "Completed",             variant: "dark" },
  no_show:             { label: "No Show",               variant: "dark" },
  cancelled_by_client: { label: "Cancelled",             variant: "dark" },
  cancelled_by_spa:    { label: "Cancelled",             variant: "dark" },
};

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("en-ZA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AccountBookingsPage() {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login");

  const userId = (session?.user as { id?: string })?.id;
  const { data: client, refetch } = trpc.clients.me.useQuery(undefined, { enabled: !!userId });

  const cancelMine = trpc.appointments.cancelMine.useMutation({
    onSuccess: () => refetch(),
  });

  const upcoming = client?.appointments
    ?.filter((a) =>
      new Date(a.startAt) >= new Date() &&
      ["pending", "confirmed"].includes(a.status)
    )
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const past = client?.appointments
    ?.filter((a) =>
      new Date(a.startAt) < new Date() ||
      ["completed", "no_show", "cancelled_by_client", "cancelled_by_spa"].includes(a.status)
    )
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
    .slice(0, 20);

  const handleCancel = (id: string) => {
    if (confirm("Cancel this appointment?")) {
      cancelMine.mutate({ id });
    }
  };

  const rowStyle: React.CSSProperties = {
    background: "#1a1714",
    border: "1px solid #2a2420",
    borderRadius: "2px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  };

  return (
    <main className="min-h-screen pb-24" style={{ background: "#0e0c0a" }}>
      {/* Header */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-4"
        style={{ background: "#0e0c0a", borderBottom: "1px solid #1a1714" }}
      >
        <Link
          href="/account"
          style={{
            fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
            fontSize: "12px",
            color: "#8a6f3e",
            letterSpacing: "0.06em",
            textDecoration: "none",
          }}
        >
          ← Account
        </Link>
        <span
          style={{
            fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
            fontSize: "18px",
            fontWeight: 300,
            color: "#f5f0e8",
          }}
        >
          My Bookings
        </span>
        <GoldButton href="/book" size="sm">
          Book
        </GoldButton>
      </nav>

      <div className="px-4 pt-6" style={{ maxWidth: "640px", margin: "0 auto" }}>
        {/* Upcoming */}
        <section style={{ marginBottom: "40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#c9a85c",
              margin: "0 0 16px",
            }}
          >
            Upcoming
          </h2>

          {!upcoming?.length ? (
            <div
              style={{
                background: "#1a1714",
                border: "1px solid #2a2420",
                borderRadius: "2px",
                padding: "32px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
                  fontSize: "18px",
                  fontWeight: 300,
                  color: "#4a4540",
                  margin: "0 0 16px",
                }}
              >
                No upcoming bookings
              </p>
              <GoldButton href="/book" size="sm">
                Book a Treatment
              </GoldButton>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {upcoming.map((apt) => {
                const cfg = STATUS_CONFIG[apt.status] ?? { label: apt.status, variant: "dark" as const };
                return (
                  <div key={apt.id} style={rowStyle}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <div>
                        <p
                          style={{
                            fontFamily: "var(--font-cormorant), Cormorant Garamond, serif",
                            fontSize: "20px",
                            fontWeight: 400,
                            color: "#f5f0e8",
                            margin: "0 0 4px",
                          }}
                        >
                          {apt.service?.name ?? "Treatment"}
                        </p>
                        {apt.staff && (
                          <p
                            style={{
                              fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
                              fontSize: "12px",
                              color: "#8a6f3e",
                              margin: 0,
                            }}
                          >
                            with {apt.staff.user?.name ?? "therapist"}
                          </p>
                        )}
                      </div>
                      <AccentLabel variant={cfg.variant}>{cfg.label}</AccentLabel>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        paddingTop: "8px",
                        borderTop: "1px solid #2a2420",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
                          fontSize: "12px",
                          color: "#f5f0e8",
                          flex: 1,
                        }}
                      >
                        {formatDate(apt.startAt)} · {formatTime(apt.startAt)}
                      </span>

                      {["pending", "confirmed"].includes(apt.status) && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancelMine.isPending}
                          style={{
                            fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
                            fontSize: "11px",
                            fontWeight: 500,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#4a4540",
                            background: "transparent",
                            border: "1px solid #2a2420",
                            borderRadius: "2px",
                            padding: "6px 12px",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Past */}
        {!!past?.length && (
          <section>
            <h2
              style={{
                fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#4a4540",
                margin: "0 0 16px",
              }}
            >
              History
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {past.map((apt) => {
                const cfg = STATUS_CONFIG[apt.status] ?? { label: apt.status, variant: "dark" as const };
                return (
                  <div
                    key={apt.id}
                    style={{
                      ...rowStyle,
                      padding: "14px 20px",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#f5f0e8",
                          margin: "0 0 2px",
                        }}
                      >
                        {apt.service?.name ?? "Treatment"}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
                          fontSize: "11px",
                          color: "#4a4540",
                          margin: 0,
                        }}
                      >
                        {formatDate(apt.startAt)}
                      </p>
                    </div>
                    <AccentLabel variant={cfg.variant}>{cfg.label}</AccentLabel>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
