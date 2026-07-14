"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { brand } from "@/lib/brand";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

type Step = "service" | "staff" | "datetime" | "contact" | "confirm";

const steps: Step[] = ["service", "staff", "datetime", "contact", "confirm"];
const stepLabels = ["Treatment", "Therapist", "Date & Time", "Details", "Confirm"];

const FONT_BODY = "var(--font-abel), Abel, sans-serif";
const FONT_DISPLAY = "var(--font-marcellus), Marcellus, serif";
const INK = "#232122";
const INK_SOFT = "#4a4547";
const MUTED = "#8d8e8f";
const HAIRLINE = "#efdcd8";
const BLUSH = "#e8bab3";
const BLUSH_TINT = "#f7eae7";
const BLUSH_DEEP = "#c98d82";
const PINK = "#fe329c";
const PINK_DARK = "#d41d7f";
const CARD_SHADOW = "0 10px 30px rgba(35,33,34,0.07)";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#ffffff",
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 2,
  padding: "13px 16px",
  color: INK,
  fontFamily: FONT_BODY,
  fontSize: 14,
  letterSpacing: "0.02em",
  outline: "none",
  boxSizing: "border-box" as const,
};

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const SLOT_STEP_MINS = 30;

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Availability-driven time-slot grid. Reads the therapist's working hours and
 * booked slots for the chosen day, then offers only start times where the whole
 * treatment fits without overlapping an existing booking.
 */
function SlotGrid({
  staffIdForAvailability,
  durationMins,
  value,
  onChange,
}: {
  staffIdForAvailability?: string;
  durationMins: number;
  value: string;
  onChange: (iso: string) => void;
}) {
  // Next 14 days as selectable date chips.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const [selectedDate, setSelectedDate] = useState<Date>(days[0]);
  const dateKey = selectedDate.toISOString().slice(0, 10);

  const { data: availability, isLoading } = trpc.staff.getAvailability.useQuery(
    { staffId: staffIdForAvailability ?? "", date: dateKey, durationMins },
    { enabled: !!staffIdForAvailability }
  );

  // Build candidate start times from working hours minus booked slots.
  const slots: { iso: string; label: string }[] = [];
  const wh = (availability?.workingHours ?? {}) as Record<string, { open: string; close: string } | undefined>;
  const dayHours = wh[WEEKDAY_KEYS[selectedDate.getDay()]];
  if (dayHours?.open && dayHours?.close) {
    const open = toMinutes(dayHours.open);
    const close = toMinutes(dayHours.close);
    const now = new Date();
    const booked = (availability?.bookedSlots ?? []).map((b) => ({
      start: new Date(b.startAt).getTime(),
      end: new Date(b.endAt).getTime(),
    }));
    for (let t = open; t + durationMins <= close; t += SLOT_STEP_MINS) {
      const start = new Date(selectedDate);
      start.setHours(Math.floor(t / 60), t % 60, 0, 0);
      const end = new Date(start.getTime() + durationMins * 60000);
      if (start.getTime() <= now.getTime()) continue; // no past slots
      const clashes = booked.some((b) => start.getTime() < b.end && end.getTime() > b.start);
      if (clashes) continue;
      slots.push({
        iso: start.toISOString(),
        label: start.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }),
      });
    }
  }

  return (
    <div>
      {/* Date chips */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, scrollbarWidth: "none" }}>
        {days.map((d) => {
          const key = d.toISOString().slice(0, 10);
          const active = key === dateKey;
          return (
            <button
              key={key}
              onClick={() => { setSelectedDate(d); onChange(""); }}
              style={{
                flexShrink: 0, minWidth: 58, padding: "10px 8px",
                background: active ? BLUSH_TINT : "#ffffff",
                border: `1px solid ${active ? PINK : HAIRLINE}`,
                borderRadius: 2, cursor: "pointer", textAlign: "center",
              }}
            >
              <div style={{ fontFamily: FONT_BODY, fontSize: 8, letterSpacing: "0.16em", textTransform: "uppercase", color: active ? PINK_DARK : MUTED }}>
                {d.toLocaleDateString("en-ZA", { weekday: "short" })}
              </div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 400, color: active ? INK : INK_SOFT }}>
                {d.getDate()}
              </div>
              <div style={{ fontFamily: FONT_BODY, fontSize: 7, letterSpacing: "0.14em", textTransform: "uppercase", color: MUTED }}>
                {d.toLocaleDateString("en-ZA", { month: "short" })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Time slots */}
      {!staffIdForAvailability ? (
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: INK_SOFT, padding: "12px 0" }}>
          Choose a therapist to see available times.
        </p>
      ) : isLoading ? (
        <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: MUTED, padding: "12px 0" }}>
          Loading available times…
        </p>
      ) : slots.length === 0 ? (
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: INK_SOFT, padding: "12px 0" }}>
          No open slots on this day — try another date.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))", gap: 8 }}>
          {slots.map((s) => {
            const active = value === s.iso;
            return (
              <button
                key={s.iso}
                onClick={() => onChange(s.iso)}
                style={{
                  padding: "11px 6px",
                  background: active ? BLUSH_TINT : "#ffffff",
                  border: `1px solid ${active ? PINK : HAIRLINE}`,
                  borderRadius: 2, cursor: "pointer",
                  fontFamily: FONT_BODY,
                  fontSize: 13, fontWeight: 400,
                  color: active ? PINK_DARK : INK_SOFT,
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BookPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>("service");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") ?? "All");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [skinNotes, setSkinNotes] = useState("");
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const { data: services } = trpc.services.list.useQuery({ spaId: SPA_ID });
  const { data: staffList } = trpc.staff.list.useQuery(
    { spaId: SPA_ID, serviceId: selectedService?.id },
    { enabled: !!selectedService }
  );
  const { data: loyaltyAccount } = trpc.loyalty.getAccount.useQuery(
    undefined,
    { enabled: !!session?.user }
  );
  const { data: loyaltyConfig } = trpc.loyalty.getConfig.useQuery({ spaId: SPA_ID });

  const estimatedPoints = loyaltyConfig && selectedService
    ? Math.floor((selectedService.price / loyaltyConfig.currencyUnitAmount) * loyaltyConfig.pointsPerUnit)
    : 0;

  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: (data) => router.push(`/book/confirm?id=${data.id}&pts=${estimatedPoints}`),
  });

  const stepIdx = steps.indexOf(step);
  const categories = ["All", ...Array.from(new Set(services?.map((s) => s.category) ?? []))];
  const filteredServices = services?.filter((s) => selectedCategory === "All" || s.category === selectedCategory);

  const primaryButtonStyle = (enabled: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "15px 20px",
    background: INK,
    border: `1px solid ${INK}`,
    borderRadius: 2, cursor: enabled ? "pointer" : "default",
    fontFamily: FONT_BODY,
    fontSize: 13, fontWeight: 400,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: "#ffffff",
    opacity: enabled ? 1 : 0.4,
  });

  const backButtonStyle: React.CSSProperties = {
    background: "none", border: "none", cursor: "pointer",
    fontFamily: FONT_BODY,
    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
    color: MUTED, display: "flex", alignItems: "center", gap: 6,
  };

  return (
    <main style={{ minHeight: "100vh", background: "#ffffff" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "#ffffff",
        borderBottom: `1px solid ${HAIRLINE}`,
        padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/" style={{
          fontFamily: FONT_DISPLAY,
          fontSize: 20, fontWeight: 400,
          color: INK, textDecoration: "none",
        }}>
          {brand.name}
        </Link>
        <span style={{ color: BLUSH, fontSize: 12 }}>/</span>
        <span style={{
          fontFamily: FONT_BODY,
          fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
          color: MUTED,
        }}>
          Book a Treatment
        </span>
      </nav>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 20px" }}>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, marginBottom: 40 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                height: 2,
                width: "100%",
                background: i <= stepIdx ? PINK : HAIRLINE,
                transition: "background 0.3s",
              }} />
              <span style={{
                fontFamily: FONT_BODY,
                fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                color: i <= stepIdx ? PINK_DARK : MUTED,
                display: "none",
              }}
                className="step-label"
              >
                {stepLabels[i]}
              </span>
            </div>
          ))}
        </div>

        {/* ── Step 1: Service ── */}
        {step === "service" && (
          <div>
            <div style={{
              fontFamily: FONT_BODY,
              fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
              color: PINK_DARK, marginBottom: 8,
            }}>
              Step 1 of 5
            </div>
            <h2 style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 36, fontWeight: 400,
              color: INK, lineHeight: 1.1, marginBottom: 6,
            }}>
              Choose a treatment
            </h2>
            <p style={{
              fontFamily: FONT_BODY,
              fontSize: 13, letterSpacing: "0.06em",
              color: MUTED, marginBottom: 24,
            }}>
              Select the service you&apos;d like to book
            </p>

            {/* Category pills */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 2,
                    border: selectedCategory === cat
                      ? `1px solid ${PINK}`
                      : `1px solid ${HAIRLINE}`,
                    background: selectedCategory === cat ? BLUSH_TINT : "transparent",
                    cursor: "pointer",
                    fontFamily: FONT_BODY,
                    fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
                    color: selectedCategory === cat ? PINK_DARK : MUTED,
                    transition: "all 0.2s",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filteredServices?.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => { setSelectedService(svc); setStep("staff"); }}
                  style={{
                    width: "100%", textAlign: "left",
                    background: "#ffffff",
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 2,
                    padding: "18px 20px",
                    cursor: "pointer",
                    boxShadow: CARD_SHADOW,
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = PINK)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: 19, fontWeight: 400,
                        color: INK, marginBottom: 4,
                      }}>
                        {svc.name}
                      </div>
                      <div style={{
                        fontFamily: FONT_BODY,
                        fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                        color: BLUSH_DEEP, marginBottom: svc.description ? 6 : 0,
                      }}>
                        {svc.category} · {svc.durationMins} min
                      </div>
                      {svc.description && (
                        <div style={{
                          fontFamily: FONT_BODY,
                          fontSize: 13, color: INK_SOFT, lineHeight: 1.6,
                        }}>
                          {svc.description}
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontFamily: FONT_BODY,
                      fontSize: 15, fontWeight: 400,
                      color: PINK, marginLeft: 16, flexShrink: 0,
                    }}>
                      R{svc.price}
                    </div>
                  </div>
                </button>
              ))}
              {filteredServices?.length === 0 && (
                <div style={{
                  textAlign: "center", padding: "48px 20px",
                  fontFamily: FONT_DISPLAY,
                  fontSize: 18, color: MUTED,
                }}>
                  No treatments in this category yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 2: Staff ── */}
        {step === "staff" && (
          <div>
            {/* Selected service summary */}
            <div style={{
              background: BLUSH_TINT,
              border: `1px solid ${HAIRLINE}`,
              borderLeft: `2px solid ${PINK}`,
              borderRadius: 2,
              padding: "12px 16px",
              marginBottom: 28,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 16, fontWeight: 400,
                  color: INK,
                }}>
                  {selectedService?.name}
                </div>
                <div style={{
                  fontFamily: FONT_BODY,
                  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: BLUSH_DEEP, marginTop: 2,
                }}>
                  {selectedService?.durationMins} min · R{selectedService?.price}
                </div>
              </div>
              <button
                onClick={() => setStep("service")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: FONT_BODY,
                  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: PINK_DARK,
                }}
              >
                Change
              </button>
            </div>

            <div style={{
              fontFamily: FONT_BODY,
              fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
              color: PINK_DARK, marginBottom: 8,
            }}>
              Step 2 of 5
            </div>
            <h2 style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 36, fontWeight: 400,
              color: INK, lineHeight: 1.1, marginBottom: 6,
            }}>
              Choose your therapist
            </h2>
            <p style={{
              fontFamily: FONT_BODY,
              fontSize: 13, letterSpacing: "0.06em",
              color: MUTED, marginBottom: 24,
            }}>
              All our therapists are certified specialists
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Any therapist option */}
              <button
                onClick={() => { setSelectedStaff(null); setStep("datetime"); }}
                style={{
                  width: "100%", textAlign: "left",
                  background: "#ffffff",
                  border: `1px solid ${HAIRLINE}`,
                  borderRadius: 2,
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: CARD_SHADOW,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = PINK)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: `1px solid ${HAIRLINE}`,
                  background: "#faf6f5",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: BLUSH }} />
                </div>
                <div>
                  <div style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 17, fontWeight: 400,
                    color: INK, marginBottom: 2,
                  }}>
                    Any Available Therapist
                  </div>
                  <div style={{
                    fontFamily: FONT_BODY,
                    fontSize: 12, color: MUTED,
                  }}>
                    We&apos;ll match you with the best available specialist
                  </div>
                </div>
              </button>

              {staffList?.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStaff(s); setStep("datetime"); }}
                  style={{
                    width: "100%", textAlign: "left",
                    background: "#ffffff",
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: 2,
                    padding: "16px 20px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 14,
                    boxShadow: CARD_SHADOW,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = PINK)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: `1px solid ${BLUSH}`,
                    background: BLUSH_TINT,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    fontFamily: FONT_DISPLAY,
                    fontSize: 16,
                    color: BLUSH_DEEP,
                  }}>
                    {s.user.name?.charAt(0) ?? "T"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: 17, fontWeight: 400,
                      color: INK, marginBottom: 2,
                    }}>
                      {s.user.name}
                    </div>
                    {s.bio && (
                      <div style={{
                        fontFamily: FONT_BODY,
                        fontSize: 12, color: MUTED,
                      }}>
                        {s.bio}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("service")}
              style={{ ...backButtonStyle, marginTop: 20 }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 3: Date & Time ── */}
        {step === "datetime" && (
          <div>
            <div style={{
              fontFamily: FONT_BODY,
              fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
              color: PINK_DARK, marginBottom: 8,
            }}>
              Step 3 of 5
            </div>
            <h2 style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 36, fontWeight: 400,
              color: INK, lineHeight: 1.1, marginBottom: 6,
            }}>
              When would you like to come in?
            </h2>
            <p style={{
              fontFamily: FONT_BODY,
              fontSize: 13, letterSpacing: "0.06em",
              color: MUTED, marginBottom: 24,
            }}>
              Select your preferred date and time
            </p>

            <div style={{
              background: "#ffffff",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 2, padding: "20px",
              boxShadow: CARD_SHADOW,
            }}>
              <SlotGrid
                staffIdForAvailability={selectedStaff?.id ?? staffList?.[0]?.id}
                durationMins={selectedService?.durationMins ?? 60}
                value={selectedSlot}
                onChange={setSelectedSlot}
              />
              {selectedSlot && (
                <div style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: BLUSH_TINT,
                  border: `1px solid ${BLUSH}`,
                  borderLeft: `2px solid ${PINK}`,
                  borderRadius: 2,
                }}>
                  <div style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 15, fontWeight: 400,
                    color: INK,
                  }}>
                    {new Date(selectedSlot).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                    {" at "}
                    {new Date(selectedSlot).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              )}
            </div>

            <button
              disabled={!selectedSlot}
              onClick={() => setStep("contact")}
              style={{ ...primaryButtonStyle(!!selectedSlot), marginTop: 16 }}
            >
              Continue
            </button>
            <button
              onClick={() => setStep("staff")}
              style={{ ...backButtonStyle, marginTop: 12 }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 4: Contact Details ── */}
        {step === "contact" && (
          <div>
            <div style={{
              fontFamily: FONT_BODY,
              fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
              color: PINK_DARK, marginBottom: 8,
            }}>
              Step 4 of 5
            </div>
            <h2 style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 36, fontWeight: 400,
              color: INK, lineHeight: 1.1, marginBottom: 6,
            }}>
              Your details
            </h2>
            <p style={{
              fontFamily: FONT_BODY,
              fontSize: 13, letterSpacing: "0.06em",
              color: MUTED, marginBottom: 24,
            }}>
              Help us personalise your experience
            </p>

            {session?.user && (
              <div style={{
                background: BLUSH_TINT,
                border: `1px solid ${HAIRLINE}`,
                borderLeft: `2px solid ${PINK}`,
                borderRadius: 2,
                padding: "11px 16px",
                marginBottom: 16,
                fontFamily: FONT_BODY,
                fontSize: 12, letterSpacing: "0.04em",
                color: INK_SOFT,
              }}>
                Signed in as <strong style={{ color: INK }}>{session.user.email}</strong> — points will be earned on this booking.
              </div>
            )}

            <div style={{
              background: "#ffffff",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 2, padding: "20px",
              boxShadow: CARD_SHADOW,
              display: "flex", flexDirection: "column", gap: 10,
              marginBottom: 14,
            }}>
              {(["name", "email", "phone"] as const).map((field) => (
                <div key={field}>
                  <div style={{
                    fontFamily: FONT_BODY,
                    fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                    color: MUTED, marginBottom: 6,
                  }}>
                    {field === "phone" ? "Phone (optional)" : field === "name" ? "Full Name" : "Email"}
                  </div>
                  <input
                    type={field === "email" ? "email" : "text"}
                    placeholder={field === "name" ? "Full name" : field === "email" ? "your@email.com" : "+27 000 000 0000"}
                    value={contact[field]}
                    onChange={(e) => setContact((c) => ({ ...c, [field]: e.target.value }))}
                    onFocus={(e) => (e.currentTarget.style.borderColor = PINK)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div>
                <div style={{
                  fontFamily: FONT_BODY,
                  fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                  color: MUTED, marginBottom: 6,
                }}>
                  Skin concerns or requests <span style={{ opacity: 0.6 }}>(optional)</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. sensitive skin, acne-prone, prefer unscented products…"
                  value={skinNotes}
                  onChange={(e) => setSkinNotes(e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = PINK)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = HAIRLINE)}
                  style={{
                    ...inputStyle,
                    resize: "none",
                    fontFamily: FONT_BODY,
                  }}
                />
              </div>
            </div>

            {/* Points redemption */}
            {loyaltyAccount && loyaltyAccount.balance > 0 && (
              <div style={{
                background: "#faf6f5",
                border: `1px solid ${BLUSH}`,
                borderRadius: 2, padding: "18px 20px",
                marginBottom: 14,
                boxShadow: CARD_SHADOW,
              }}>
                <div style={{
                  fontFamily: FONT_BODY,
                  fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                  color: BLUSH_DEEP, marginBottom: 6,
                }}>
                  Redeem Loyalty Points
                </div>
                <div style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 15, fontWeight: 400, color: INK_SOFT, marginBottom: 12,
                }}>
                  You have <strong style={{ color: INK }}>{loyaltyAccount.balance} points</strong> available.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    type="range"
                    min={0}
                    max={loyaltyAccount.balance}
                    step={100}
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                    style={{ flex: 1, accentColor: PINK }}
                  />
                  <span style={{
                    fontFamily: FONT_BODY,
                    fontSize: 13, fontWeight: 400,
                    color: PINK_DARK, width: 64, textAlign: "right",
                  }}>
                    {pointsToRedeem} pts
                  </span>
                </div>
                {pointsToRedeem > 0 && loyaltyConfig && (
                  <div style={{
                    fontFamily: FONT_BODY,
                    fontSize: 12, color: MUTED, marginTop: 8,
                  }}>
                    Saving approx. R{((pointsToRedeem / loyaltyConfig.redemptionRate) * 10).toFixed(0)} on your treatment
                  </div>
                )}
              </div>
            )}

            <button
              disabled={!contact.name || !contact.email}
              onClick={() => setStep("confirm")}
              style={primaryButtonStyle(!!(contact.name && contact.email))}
            >
              Review Booking
            </button>
            <button
              onClick={() => setStep("datetime")}
              style={{ ...backButtonStyle, marginTop: 12 }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 5: Confirm ── */}
        {step === "confirm" && (
          <div>
            <div style={{
              fontFamily: FONT_BODY,
              fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase",
              color: PINK_DARK, marginBottom: 8,
            }}>
              Step 5 of 5
            </div>
            <h2 style={{
              fontFamily: FONT_DISPLAY,
              fontSize: 36, fontWeight: 400,
              color: INK, lineHeight: 1.1, marginBottom: 6,
            }}>
              Confirm your booking
            </h2>
            <p style={{
              fontFamily: FONT_BODY,
              fontSize: 13, letterSpacing: "0.06em",
              color: MUTED, marginBottom: 24,
            }}>
              Review the details of your treatment
            </p>

            {/* Summary card */}
            <div style={{
              background: "#ffffff",
              border: `1px solid ${HAIRLINE}`,
              borderRadius: 2, padding: "0 20px",
              boxShadow: CARD_SHADOW,
              marginBottom: 14,
            }}>
              {[
                { label: "Treatment", value: selectedService?.name },
                { label: "Therapist", value: selectedStaff?.user.name ?? "Any Available" },
                {
                  label: "Date & Time",
                  value: selectedSlot ? new Date(selectedSlot).toLocaleString("en-ZA", {
                    weekday: "short", day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  }) : "",
                },
                { label: "Duration", value: `${selectedService?.durationMins} min` },
              ].map(({ label, value }, i) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "14px 0",
                  borderTop: i > 0 ? `1px solid ${HAIRLINE}` : "none",
                }}>
                  <span style={{
                    fontFamily: FONT_BODY,
                    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: MUTED,
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 16, fontWeight: 400,
                    color: INK, textAlign: "right", maxWidth: "60%",
                  }}>
                    {value}
                  </span>
                </div>
              ))}

              {/* Price row */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 0",
                borderTop: `1px solid ${HAIRLINE}`,
              }}>
                <span style={{
                  fontFamily: FONT_BODY,
                  fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: MUTED,
                }}>
                  Price
                </span>
                <span style={{
                  fontFamily: FONT_BODY,
                  fontSize: 18, fontWeight: 400,
                  color: PINK,
                }}>
                  R{selectedService?.price}
                </span>
              </div>

              {pointsToRedeem > 0 && (
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0",
                  borderTop: `1px solid ${HAIRLINE}`,
                }}>
                  <span style={{
                    fontFamily: FONT_BODY,
                    fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: BLUSH_DEEP,
                  }}>
                    Points redeemed
                  </span>
                  <span style={{
                    fontFamily: FONT_BODY,
                    fontSize: 13, fontWeight: 400, color: PINK_DARK,
                  }}>
                    −{pointsToRedeem} pts
                  </span>
                </div>
              )}

              {skinNotes && (
                <div style={{
                  padding: "14px 0",
                  borderTop: `1px solid ${HAIRLINE}`,
                }}>
                  <div style={{
                    fontFamily: FONT_BODY,
                    fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: MUTED, marginBottom: 4,
                  }}>
                    Your Notes
                  </div>
                  <div style={{
                    fontFamily: FONT_BODY,
                    fontSize: 14, color: INK_SOFT, lineHeight: 1.5,
                  }}>
                    {skinNotes}
                  </div>
                </div>
              )}
            </div>

            {/* Points earned notice */}
            {estimatedPoints > 0 && (
              <div style={{
                background: BLUSH_TINT,
                border: `1px solid ${BLUSH}`,
                borderLeft: `2px solid ${PINK}`,
                borderRadius: 2, padding: "12px 16px",
                marginBottom: 14,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: PINK, flexShrink: 0 }} />
                <div>
                  <div style={{
                    fontFamily: FONT_BODY,
                    fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                    color: BLUSH_DEEP, marginBottom: 2,
                  }}>
                    Points Incoming
                  </div>
                  <div style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 15, fontWeight: 400,
                    color: INK,
                  }}>
                    ~{estimatedPoints} points credited once your treatment is complete
                  </div>
                </div>
              </div>
            )}

            <button
              disabled={createAppointment.isPending || !session?.user}
              onClick={() => {
                if (!session?.user) return;
                const start = new Date(selectedSlot);
                const end = new Date(start.getTime() + selectedService.durationMins * 60000);
                const chosenStaffId = selectedStaff?.id ?? staffList?.[0]?.id;
                createAppointment.mutate({
                  spaId: SPA_ID,
                  ...(chosenStaffId ? { staffId: chosenStaffId } : {}),
                  serviceId: selectedService.id,
                  startAt: start.toISOString(),
                  endAt: end.toISOString(),
                  notes: skinNotes || undefined,
                });
              }}
              style={primaryButtonStyle(!(createAppointment.isPending || !session?.user))}
            >
              {createAppointment.isPending ? "Confirming…" : "Confirm Booking"}
            </button>

            {!session?.user && (
              <div style={{
                marginTop: 12,
                background: "#faf6f5",
                border: `1px solid ${HAIRLINE}`,
                borderRadius: 2,
                padding: "12px 16px",
                fontFamily: FONT_BODY,
                fontSize: 13, letterSpacing: "0.04em",
                color: INK_SOFT, textAlign: "center",
              }}>
                Please{" "}
                <Link href="/login" style={{ color: PINK, textDecoration: "none" }}>sign in</Link>
                {" "}or{" "}
                <Link href="/signup" style={{ color: PINK, textDecoration: "none" }}>create an account</Link>
                {" "}to complete your booking.
              </div>
            )}

            {createAppointment.error && (
              <div style={{
                marginTop: 10,
                fontFamily: FONT_BODY,
                fontSize: 12, color: "#c0392b", textAlign: "center",
              }}>
                {createAppointment.error.message}
              </div>
            )}

            <button
              onClick={() => setStep("contact")}
              style={{ ...backButtonStyle, marginTop: 12 }}
            >
              ← Back
            </button>
          </div>
        )}

        <div style={{ height: 40 }} />
      </div>

      <style>{`
        @media (min-width: 640px) {
          .step-label { display: block !important; }
        }
      `}</style>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#ffffff",
        fontFamily: "var(--font-marcellus), Marcellus, serif",
        fontSize: 18, color: "#8d8e8f",
      }}>
        Loading…
      </div>
    }>
      <BookPageInner />
    </Suspense>
  );
}
