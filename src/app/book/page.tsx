"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

type Step = "service" | "staff" | "datetime" | "contact" | "confirm";

const steps: Step[] = ["service", "staff", "datetime", "contact", "confirm"];
const stepLabels = ["Treatment", "Therapist", "Date & Time", "Details", "Confirm"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--onyx-800)",
  border: "1px solid var(--onyx-700)",
  borderRadius: 2,
  padding: "13px 16px",
  color: "var(--cream-100)",
  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
  fontSize: 14,
  letterSpacing: "0.02em",
  outline: "none",
  boxSizing: "border-box" as const,
};

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
    { clientId: (session?.user as any)?.id },
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

  return (
    <main style={{ minHeight: "100vh", background: "var(--onyx-950)" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "var(--onyx-950)",
        borderBottom: "1px solid var(--onyx-800)",
        padding: "16px 24px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 20, fontWeight: 300, fontStyle: "italic",
          color: "var(--gold-400)", textDecoration: "none",
        }}>
          Perfect 10
        </Link>
        <span style={{ color: "var(--onyx-600)", fontSize: 12 }}>/</span>
        <span style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--onyx-500)",
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
                background: i <= stepIdx ? "var(--gold-400)" : "var(--onyx-800)",
                transition: "background 0.3s",
              }} />
              <span style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase",
                color: i <= stepIdx ? "var(--gold-400)" : "var(--onyx-600)",
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
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 8,
            }}>
              Step 1 of 5
            </div>
            <h2 style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 36, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-100)", lineHeight: 1, marginBottom: 6,
            }}>
              Choose a treatment
            </h2>
            <p style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 12, letterSpacing: "0.06em",
              color: "var(--onyx-500)", marginBottom: 24,
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
                      ? "1px solid var(--gold-400)"
                      : "1px solid var(--onyx-700)",
                    background: selectedCategory === cat ? "transparent" : "transparent",
                    cursor: "pointer",
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase",
                    color: selectedCategory === cat ? "var(--gold-400)" : "var(--onyx-500)",
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
                    background: "var(--onyx-900)",
                    border: "1px solid var(--onyx-700)",
                    borderRadius: 2,
                    padding: "18px 20px",
                    cursor: "pointer",
                    boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,92,0.55)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--onyx-700)")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                        fontSize: 19, fontWeight: 300, fontStyle: "italic",
                        color: "var(--cream-100)", marginBottom: 4,
                      }}>
                        {svc.name}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                        fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                        color: "var(--onyx-500)", marginBottom: svc.description ? 6 : 0,
                      }}>
                        {svc.category} · {svc.durationMins} min
                      </div>
                      {svc.description && (
                        <div style={{
                          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                          fontSize: 12, color: "var(--cream-400)", lineHeight: 1.6,
                        }}>
                          {svc.description}
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                      fontSize: 15, fontWeight: 600,
                      color: "var(--gold-400)", marginLeft: 16, flexShrink: 0,
                    }}>
                      R{svc.price}
                    </div>
                  </div>
                </button>
              ))}
              {filteredServices?.length === 0 && (
                <div style={{
                  textAlign: "center", padding: "48px 20px",
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 18, fontStyle: "italic", color: "var(--onyx-600)",
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
              background: "var(--onyx-900)",
              border: "1px solid var(--onyx-700)",
              borderLeft: "2px solid var(--gold-400)",
              borderRadius: 2,
              padding: "12px 16px",
              marginBottom: 28,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 16, fontWeight: 300, fontStyle: "italic",
                  color: "var(--cream-200)",
                }}>
                  {selectedService?.name}
                </div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--onyx-500)", marginTop: 2,
                }}>
                  {selectedService?.durationMins} min · R{selectedService?.price}
                </div>
              </div>
              <button
                onClick={() => setStep("service")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--gold-400)",
                }}
              >
                Change
              </button>
            </div>

            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 8,
            }}>
              Step 2 of 5
            </div>
            <h2 style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 36, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-100)", lineHeight: 1, marginBottom: 6,
            }}>
              Choose your therapist
            </h2>
            <p style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 12, letterSpacing: "0.06em",
              color: "var(--onyx-500)", marginBottom: 24,
            }}>
              All our therapists are certified specialists
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Any therapist option */}
              <button
                onClick={() => { setSelectedStaff(null); setStep("datetime"); }}
                style={{
                  width: "100%", textAlign: "left",
                  background: "var(--onyx-900)",
                  border: "1px solid var(--onyx-700)",
                  borderRadius: 2,
                  padding: "16px 20px",
                  cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 14,
                  boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,92,0.55)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--onyx-700)")}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "1px solid var(--onyx-600)",
                  background: "var(--onyx-800)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--onyx-500)" }} />
                </div>
                <div>
                  <div style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    fontSize: 17, fontWeight: 300, fontStyle: "italic",
                    color: "var(--cream-200)", marginBottom: 2,
                  }}>
                    Any Available Therapist
                  </div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 11, color: "var(--onyx-500)",
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
                    background: "var(--onyx-900)",
                    border: "1px solid var(--onyx-700)",
                    borderRadius: 2,
                    padding: "16px 20px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 14,
                    boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,92,0.55)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--onyx-700)")}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "1px solid rgba(201,168,92,0.4)",
                    background: "var(--onyx-800)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    fontSize: 16, fontStyle: "italic",
                    color: "var(--gold-400)",
                  }}>
                    {s.user.name?.charAt(0) ?? "T"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                      fontSize: 17, fontWeight: 300, fontStyle: "italic",
                      color: "var(--cream-200)", marginBottom: 2,
                    }}>
                      {s.user.name}
                    </div>
                    {s.bio && (
                      <div style={{
                        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                        fontSize: 11, color: "var(--onyx-500)",
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
              style={{
                marginTop: 20, background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--onyx-500)", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 3: Date & Time ── */}
        {step === "datetime" && (
          <div>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 8,
            }}>
              Step 3 of 5
            </div>
            <h2 style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 36, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-100)", lineHeight: 1, marginBottom: 6,
            }}>
              When would you like to come in?
            </h2>
            <p style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 12, letterSpacing: "0.06em",
              color: "var(--onyx-500)", marginBottom: 24,
            }}>
              Select your preferred date and time
            </p>

            <div style={{
              background: "var(--onyx-900)",
              border: "1px solid var(--onyx-700)",
              borderRadius: 2, padding: "20px",
              boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
            }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
                color: "var(--onyx-500)", marginBottom: 10,
              }}>
                Date &amp; Time
              </div>
              <input
                type="datetime-local"
                onChange={(e) => setSelectedSlot(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                style={{
                  ...inputStyle,
                  colorScheme: "dark",
                }}
              />
              {selectedSlot && (
                <div style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "var(--onyx-800)",
                  border: "1px solid rgba(201,168,92,0.32)",
                  borderLeft: "2px solid var(--gold-400)",
                  borderRadius: 2,
                }}>
                  <div style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    fontSize: 15, fontWeight: 300, fontStyle: "italic",
                    color: "var(--cream-200)",
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
              style={{
                marginTop: 16, width: "100%",
                padding: "15px 20px",
                background: "transparent",
                border: "1px solid rgba(201,168,92,0.55)",
                borderRadius: 2, cursor: selectedSlot ? "pointer" : "default",
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 19, fontWeight: 300, fontStyle: "italic",
                color: "var(--gold-400)",
                boxShadow: "4px 6px 0 rgba(0,0,0,0.6)",
                opacity: selectedSlot ? 1 : 0.4,
              }}
            >
              Continue
            </button>
            <button
              onClick={() => setStep("staff")}
              style={{
                marginTop: 12, background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--onyx-500)", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 4: Contact Details ── */}
        {step === "contact" && (
          <div>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 8,
            }}>
              Step 4 of 5
            </div>
            <h2 style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 36, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-100)", lineHeight: 1, marginBottom: 6,
            }}>
              Your details
            </h2>
            <p style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 12, letterSpacing: "0.06em",
              color: "var(--onyx-500)", marginBottom: 24,
            }}>
              Help us personalise your experience
            </p>

            {session?.user && (
              <div style={{
                background: "var(--onyx-900)",
                border: "1px solid var(--onyx-700)",
                borderLeft: "2px solid var(--gold-400)",
                borderRadius: 2,
                padding: "11px 16px",
                marginBottom: 16,
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 11, letterSpacing: "0.04em",
                color: "var(--cream-400)",
              }}>
                Signed in as <strong style={{ color: "var(--cream-200)" }}>{session.user.email}</strong> — points will be earned on this booking.
              </div>
            )}

            <div style={{
              background: "var(--onyx-900)",
              border: "1px solid var(--onyx-700)",
              borderRadius: 2, padding: "20px",
              boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
              display: "flex", flexDirection: "column", gap: 10,
              marginBottom: 14,
            }}>
              {(["name", "email", "phone"] as const).map((field) => (
                <div key={field}>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
                    color: "var(--onyx-500)", marginBottom: 6,
                  }}>
                    {field === "phone" ? "Phone (optional)" : field === "name" ? "Full Name" : "Email"}
                  </div>
                  <input
                    type={field === "email" ? "email" : "text"}
                    placeholder={field === "name" ? "Full name" : field === "email" ? "your@email.com" : "+27 000 000 0000"}
                    value={contact[field]}
                    onChange={(e) => setContact((c) => ({ ...c, [field]: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              ))}

              <div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "var(--onyx-500)", marginBottom: 6,
                }}>
                  Skin concerns or requests <span style={{ opacity: 0.5 }}>(optional)</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="e.g. sensitive skin, acne-prone, prefer unscented products…"
                  value={skinNotes}
                  onChange={(e) => setSkinNotes(e.target.value)}
                  style={{
                    ...inputStyle,
                    resize: "none",
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  }}
                />
              </div>
            </div>

            {/* Points redemption */}
            {loyaltyAccount && loyaltyAccount.balance > 0 && (
              <div style={{
                background: "var(--onyx-900)",
                border: "1px solid rgba(201,168,92,0.32)",
                borderRadius: 2, padding: "18px 20px",
                marginBottom: 14,
                boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
              }}>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "var(--gold-400)", marginBottom: 6,
                }}>
                  Redeem Loyalty Points
                </div>
                <div style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 15, fontWeight: 300, color: "var(--cream-300)", marginBottom: 12,
                }}>
                  You have <strong style={{ color: "var(--cream-100)" }}>{loyaltyAccount.balance} points</strong> available.
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    type="range"
                    min={0}
                    max={loyaltyAccount.balance}
                    step={100}
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                    style={{ flex: 1, accentColor: "var(--gold-400)" }}
                  />
                  <span style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 13, fontWeight: 600,
                    color: "var(--gold-400)", width: 64, textAlign: "right",
                  }}>
                    {pointsToRedeem} pts
                  </span>
                </div>
                {pointsToRedeem > 0 && loyaltyConfig && (
                  <div style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 11, color: "var(--onyx-500)", marginTop: 8,
                  }}>
                    Saving approx. R{((pointsToRedeem / loyaltyConfig.redemptionRate) * 10).toFixed(0)} on your treatment
                  </div>
                )}
              </div>
            )}

            <button
              disabled={!contact.name || !contact.email}
              onClick={() => setStep("confirm")}
              style={{
                width: "100%",
                padding: "15px 20px",
                background: "transparent",
                border: "1px solid rgba(201,168,92,0.55)",
                borderRadius: 2, cursor: (contact.name && contact.email) ? "pointer" : "default",
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 19, fontWeight: 300, fontStyle: "italic",
                color: "var(--gold-400)",
                boxShadow: "4px 6px 0 rgba(0,0,0,0.6)",
                opacity: (contact.name && contact.email) ? 1 : 0.4,
              }}
            >
              Review Booking
            </button>
            <button
              onClick={() => setStep("datetime")}
              style={{
                marginTop: 12, background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--onyx-500)",
              }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* ── Step 5: Confirm ── */}
        {step === "confirm" && (
          <div>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 8,
            }}>
              Step 5 of 5
            </div>
            <h2 style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 36, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-100)", lineHeight: 1, marginBottom: 6,
            }}>
              Confirm your booking
            </h2>
            <p style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 12, letterSpacing: "0.06em",
              color: "var(--onyx-500)", marginBottom: 24,
            }}>
              Review the details of your treatment
            </p>

            {/* Summary card */}
            <div style={{
              background: "var(--onyx-900)",
              border: "1px solid var(--onyx-700)",
              borderRadius: 2, padding: "0 20px",
              boxShadow: "4px 5px 0 rgba(0,0,0,0.55)",
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
                  borderTop: i > 0 ? "1px solid var(--onyx-800)" : "none",
                }}>
                  <span style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "var(--onyx-500)",
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    fontSize: 16, fontWeight: 300, fontStyle: "italic",
                    color: "var(--cream-200)", textAlign: "right", maxWidth: "60%",
                  }}>
                    {value}
                  </span>
                </div>
              ))}

              {/* Price row */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 0",
                borderTop: "1px solid var(--onyx-800)",
              }}>
                <span style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "var(--onyx-500)",
                }}>
                  Price
                </span>
                <span style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 18, fontWeight: 600,
                  color: "var(--gold-400)",
                }}>
                  R{selectedService?.price}
                </span>
              </div>

              {pointsToRedeem > 0 && (
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 0",
                  borderTop: "1px solid var(--onyx-800)",
                }}>
                  <span style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "var(--gold-400)",
                  }}>
                    Points redeemed
                  </span>
                  <span style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 13, fontWeight: 600, color: "var(--gold-400)",
                  }}>
                    −{pointsToRedeem} pts
                  </span>
                </div>
              )}

              {skinNotes && (
                <div style={{
                  padding: "14px 0",
                  borderTop: "1px solid var(--onyx-800)",
                }}>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "var(--onyx-600)", marginBottom: 4,
                  }}>
                    Your Notes
                  </div>
                  <div style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    fontSize: 15, fontWeight: 300, fontStyle: "italic",
                    color: "var(--cream-400)", lineHeight: 1.5,
                  }}>
                    {skinNotes}
                  </div>
                </div>
              )}
            </div>

            {/* Points earned notice */}
            {estimatedPoints > 0 && (
              <div style={{
                background: "var(--onyx-900)",
                border: "1px solid rgba(201,168,92,0.32)",
                borderLeft: "2px solid var(--gold-400)",
                borderRadius: 2, padding: "12px 16px",
                marginBottom: 14,
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold-400)", flexShrink: 0 }} />
                <div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
                    color: "var(--gold-400)", marginBottom: 2,
                  }}>
                    Points Incoming
                  </div>
                  <div style={{
                    fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                    fontSize: 15, fontWeight: 300, fontStyle: "italic",
                    color: "var(--cream-300)",
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
                  clientId: (session.user as any).id,
                  ...(chosenStaffId ? { staffId: chosenStaffId } : {}),
                  serviceId: selectedService.id,
                  startAt: start.toISOString(),
                  endAt: end.toISOString(),
                  notes: skinNotes || undefined,
                  pointsRedeemed: pointsToRedeem,
                });
              }}
              style={{
                width: "100%",
                padding: "15px 20px",
                background: "transparent",
                border: "1px solid rgba(201,168,92,0.55)",
                borderRadius: 2,
                cursor: (createAppointment.isPending || !session?.user) ? "default" : "pointer",
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 19, fontWeight: 300, fontStyle: "italic",
                color: "var(--gold-400)",
                boxShadow: "4px 6px 0 rgba(0,0,0,0.6)",
                opacity: (createAppointment.isPending || !session?.user) ? 0.5 : 1,
              }}
            >
              {createAppointment.isPending ? "Confirming…" : "Confirm Booking"}
            </button>

            {!session?.user && (
              <div style={{
                marginTop: 12,
                background: "var(--onyx-900)",
                border: "1px solid var(--onyx-700)",
                borderRadius: 2,
                padding: "12px 16px",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 12, letterSpacing: "0.04em",
                color: "var(--cream-400)", textAlign: "center",
              }}>
                Please{" "}
                <Link href="/login" style={{ color: "var(--gold-400)", textDecoration: "none" }}>sign in</Link>
                {" "}or{" "}
                <Link href="/signup" style={{ color: "var(--gold-400)", textDecoration: "none" }}>create an account</Link>
                {" "}to complete your booking.
              </div>
            )}

            {createAppointment.error && (
              <div style={{
                marginTop: 10,
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 12, color: "#e57373", textAlign: "center",
              }}>
                {createAppointment.error.message}
              </div>
            )}

            <button
              onClick={() => setStep("contact")}
              style={{
                marginTop: 12, background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
                color: "var(--onyx-500)",
              }}
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
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5) sepia(1) saturate(2) hue-rotate(5deg);
          opacity: 0.6;
          cursor: pointer;
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
        background: "var(--onyx-950)",
        fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
        fontSize: 18, fontStyle: "italic", color: "var(--onyx-600)",
      }}>
        Loading…
      </div>
    }>
      <BookPageInner />
    </Suspense>
  );
}
