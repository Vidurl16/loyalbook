"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { AccentLabel } from "@/components/ui/AccentLabel";
import { GoldButton } from "@/components/ui/GoldButton";

const FONT_BODY = "var(--font-abel), Abel, sans-serif";
const FONT_DISPLAY = "var(--font-marcellus), Marcellus, serif";

// Chip styling per status: confirmed = blush tint, completed = soft grey, cancelled = muted.
const softGreyChip: React.CSSProperties = {
  color: "#4a4547",
  background: "#f3f2f2",
  border: "1px solid #e4e2e2",
};
const mutedChip: React.CSSProperties = {
  color: "#8d8e8f",
  background: "#ffffff",
  border: "1px solid #e4e2e2",
};

const STATUS_CONFIG: Record<string, { label: string; variant: "gold" | "muted" | "dark"; style?: React.CSSProperties }> = {
  pending:             { label: "Awaiting Confirmation", variant: "gold" },
  confirmed:           { label: "Confirmed",             variant: "muted" },
  completed:           { label: "Completed",             variant: "dark", style: softGreyChip },
  no_show:             { label: "No Show",               variant: "dark", style: mutedChip },
  cancelled_by_client: { label: "Cancelled",             variant: "dark", style: mutedChip },
  cancelled_by_spa:    { label: "Cancelled",             variant: "dark", style: mutedChip },
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
  const { data: appointments, refetch } = trpc.appointments.myAppointments.useQuery(
    { take: 100 },
    { enabled: !!userId }
  );

  const cancelMine = trpc.appointments.cancelMine.useMutation({
    onSuccess: () => refetch(),
  });

  const upcoming = appointments
    ?.filter((a) =>
      new Date(a.startAt) >= new Date() &&
      ["pending", "confirmed"].includes(a.status)
    )
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const past = appointments
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
    background: "#ffffff",
    border: "1px solid #efdcd8",
    borderRadius: "2px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    boxShadow: "0 10px 30px rgba(35,33,34,0.07)",
  };

  return (
    <main className="min-h-screen pb-24" style={{ background: "#ffffff" }}>
      {/* Header */}
      <nav
        className="sticky top-0 z-40 flex items-center justify-between px-5 py-4"
        style={{ background: "#ffffff", borderBottom: "1px solid #efdcd8" }}
      >
        <Link
          href="/account"
          style={{
            fontFamily: FONT_BODY,
            fontSize: "12px",
            color: "#d41d7f",
            letterSpacing: "0.06em",
            textDecoration: "none",
          }}
        >
          ← Account
        </Link>
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "18px",
            fontWeight: 400,
            color: "#232122",
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
              fontFamily: FONT_BODY,
              fontSize: "11px",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#c98d82",
              margin: "0 0 16px",
            }}
          >
            Upcoming
          </h2>

          {!upcoming?.length ? (
            <div
              style={{
                background: "#faf6f5",
                border: "1px solid #efdcd8",
                borderRadius: "2px",
                padding: "32px",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "18px",
                  fontWeight: 400,
                  color: "#8d8e8f",
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
                const cfg = STATUS_CONFIG[apt.status] ?? { label: apt.status, variant: "dark" as const, style: mutedChip };
                return (
                  <div key={apt.id} style={rowStyle}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                      <div>
                        <p
                          style={{
                            fontFamily: FONT_DISPLAY,
                            fontSize: "20px",
                            fontWeight: 400,
                            color: "#232122",
                            margin: "0 0 4px",
                          }}
                        >
                          {apt.service?.name ?? "Treatment"}
                        </p>
                        {apt.staff && (
                          <p
                            style={{
                              fontFamily: FONT_BODY,
                              fontSize: "12px",
                              color: "#c98d82",
                              margin: 0,
                            }}
                          >
                            with {apt.staff.user?.name ?? "therapist"}
                          </p>
                        )}
                      </div>
                      <AccentLabel variant={cfg.variant} style={cfg.style}>{cfg.label}</AccentLabel>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        paddingTop: "8px",
                        borderTop: "1px solid #efdcd8",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: FONT_BODY,
                          fontSize: "13px",
                          color: "#232122",
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
                            fontFamily: FONT_BODY,
                            fontSize: "11px",
                            fontWeight: 400,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#8d8e8f",
                            background: "transparent",
                            border: "1px solid #efdcd8",
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
                fontFamily: FONT_BODY,
                fontSize: "11px",
                fontWeight: 400,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "#8d8e8f",
                margin: "0 0 16px",
              }}
            >
              History
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {past.map((apt) => {
                const cfg = STATUS_CONFIG[apt.status] ?? { label: apt.status, variant: "dark" as const, style: mutedChip };
                return (
                  <div
                    key={apt.id}
                    style={{
                      ...rowStyle,
                      background: "#faf6f5",
                      boxShadow: "none",
                      padding: "14px 20px",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontFamily: FONT_BODY,
                          fontSize: "14px",
                          fontWeight: 400,
                          color: "#232122",
                          margin: "0 0 2px",
                        }}
                      >
                        {apt.service?.name ?? "Treatment"}
                      </p>
                      <p
                        style={{
                          fontFamily: FONT_BODY,
                          fontSize: "11px",
                          color: "#8d8e8f",
                          margin: 0,
                        }}
                      >
                        {formatDate(apt.startAt)}
                      </p>
                    </div>
                    <AccentLabel variant={cfg.variant} style={cfg.style}>{cfg.label}</AccentLabel>
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
