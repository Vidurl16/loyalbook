"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

type Step = "service" | "staff" | "datetime" | "contact" | "confirm";

const CATEGORY_ICONS: Record<string, string> = {
  Nails: "💅",
  Facials: "🧖‍♀️",
  Peels: "✨",
  Massage: "💆",
  "Body Treatments": "🌿",
  "Brows & Lashes": "👁️",
  Waxing: "🪷",
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

  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: (data) => router.push(`/book/confirm?id=${data.id}&pts=${estimatedPoints}`),
  });

  const steps: Step[] = ["service", "staff", "datetime", "contact", "confirm"];
  const stepIdx = steps.indexOf(step);
  const stepLabels = ["Treatment", "Therapist", "Date & Time", "Details", "Confirm"];

  const categories = ["All", ...Array.from(new Set(services?.map((s) => s.category) ?? []))];
  const filteredServices = services?.filter((s) => selectedCategory === "All" || s.category === selectedCategory);

  const estimatedPoints = loyaltyConfig && selectedService
    ? Math.floor((selectedService.price / loyaltyConfig.currencyUnitAmount) * loyaltyConfig.pointsPerUnit)
    : 0;

  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <nav className="bg-white border-b border-stone-100 px-6 py-4 flex items-center gap-4 sticky top-0 z-40">
        <a href="/" className="font-display text-xl font-bold text-teal-700">Perfect 10</a>
        <span className="text-stone-300">/</span>
        <span className="text-stone-500 text-sm">Book a Treatment</span>
      </nav>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-1 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1.5 w-full rounded-full transition-colors ${i <= stepIdx ? "bg-teal-600" : "bg-stone-200"}`} />
              <span className={`text-xs hidden sm:block ${i <= stepIdx ? "text-teal-700 font-medium" : "text-stone-400"}`}>
                {stepLabels[i]}
              </span>
            </div>
          ))}
        </div>

        {/* Step: Select Service */}
        {step === "service" && (
          <div>
            <h2 className="font-display text-3xl font-bold text-stone-900 mb-2">Choose a treatment</h2>
            <p className="text-stone-500 text-sm mb-6">Select the service you'd like to book</p>

            {/* Category tabs */}
            <div className="flex gap-2 flex-wrap mb-5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    selectedCategory === cat
                      ? "bg-teal-700 text-white border-teal-700"
                      : "bg-white text-stone-600 border-stone-200 hover:border-teal-400"
                  }`}
                >
                  {cat !== "All" && CATEGORY_ICONS[cat] && <span>{CATEGORY_ICONS[cat]}</span>}
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid gap-3">
              {filteredServices?.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => { setSelectedService(svc); setStep("staff"); }}
                  className="w-full text-left bg-white border border-stone-100 rounded-2xl p-5 hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-start">
                      <span className="text-2xl mt-0.5">{CATEGORY_ICONS[svc.category] ?? "✨"}</span>
                      <div>
                        <div className="font-semibold text-stone-800 group-hover:text-teal-700 transition-colors">{svc.name}</div>
                        <div className="text-xs text-stone-400 mt-0.5 mb-1">{svc.category} · {svc.durationMins} min</div>
                        {svc.description && <div className="text-sm text-stone-500 leading-relaxed">{svc.description}</div>}
                      </div>
                    </div>
                    <div className="text-teal-700 font-bold shrink-0 ml-4">R{svc.price}</div>
                  </div>
                </button>
              ))}
              {filteredServices?.length === 0 && (
                <div className="text-center py-12 text-stone-400">No treatments in this category yet.</div>
              )}
            </div>
          </div>
        )}

        {/* Step: Select Staff */}
        {step === "staff" && (
          <div>
            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-6 flex justify-between items-center">
              <div>
                <div className="font-medium text-teal-800 text-sm">{CATEGORY_ICONS[selectedService?.category] ?? "✨"} {selectedService?.name}</div>
                <div className="text-xs text-teal-600">{selectedService?.durationMins} min · R{selectedService?.price}</div>
              </div>
              <button onClick={() => setStep("service")} className="text-xs text-teal-600 hover:underline">Change</button>
            </div>

            <h2 className="font-display text-3xl font-bold text-stone-900 mb-2">Choose your therapist</h2>
            <p className="text-stone-500 text-sm mb-6">All our therapists are certified specialists</p>
            <div className="grid gap-3">
              <button
                onClick={() => { setSelectedStaff(null); setStep("datetime"); }}
                className="w-full text-left bg-white border border-stone-100 rounded-2xl p-5 hover:border-teal-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-lg">🌸</div>
                  <div>
                    <div className="font-semibold text-stone-800">Any Available Therapist</div>
                    <div className="text-sm text-stone-400">We'll match you with the best available specialist</div>
                  </div>
                </div>
              </button>
              {staffList?.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStaff(s); setStep("datetime"); }}
                  className="w-full text-left bg-white border border-stone-100 rounded-2xl p-5 hover:border-teal-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
                      {s.user.name?.charAt(0) ?? "T"}
                    </div>
                    <div>
                      <div className="font-semibold text-stone-800 group-hover:text-teal-700 transition-colors">{s.user.name}</div>
                      {s.bio && <div className="text-sm text-stone-400">{s.bio}</div>}
                      {s.services && s.services.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {s.services.slice(0, 3).map((sv) => (
                            <span key={sv.serviceId} className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{sv.service.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep("service")} className="mt-5 text-sm text-teal-600 hover:underline flex items-center gap-1">← Back</button>
          </div>
        )}

        {/* Step: Date & Time */}
        {step === "datetime" && (
          <div>
            <h2 className="font-display text-3xl font-bold text-stone-900 mb-2">When would you like to come in?</h2>
            <p className="text-stone-500 text-sm mb-6">Select your preferred date and time</p>
            <div className="bg-white border border-stone-100 rounded-2xl p-6">
              <label className="block text-sm font-medium text-stone-700 mb-3">Date & Time</label>
              <input
                type="datetime-local"
                className="w-full border border-stone-200 rounded-xl p-4 text-stone-800 focus:outline-none focus:border-teal-500 bg-stone-50"
                onChange={(e) => setSelectedSlot(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
              {selectedSlot && (
                <div className="mt-4 p-3 bg-teal-50 rounded-xl text-sm text-teal-700">
                  📅 {new Date(selectedSlot).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} at {new Date(selectedSlot).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </div>
            <button
              disabled={!selectedSlot}
              onClick={() => setStep("contact")}
              className="mt-6 w-full bg-teal-700 text-white py-4 rounded-xl hover:bg-teal-800 disabled:opacity-40 transition-colors font-medium"
            >
              Continue →
            </button>
            <button onClick={() => setStep("staff")} className="mt-3 text-sm text-teal-600 hover:underline flex items-center gap-1">← Back</button>
          </div>
        )}

        {/* Step: Contact Details */}
        {step === "contact" && (
          <div>
            <h2 className="font-display text-3xl font-bold text-stone-900 mb-2">Your details</h2>
            <p className="text-stone-500 text-sm mb-6">Help us personalise your experience</p>

            {session?.user && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-5 text-sm text-teal-700 flex items-center gap-2">
                ✅ Logged in as <strong>{session.user.email}</strong> — points will be earned on this booking.
              </div>
            )}

            <div className="bg-white border border-stone-100 rounded-2xl p-6 space-y-4">
              {(["name", "email", "phone"] as const).map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-stone-700 mb-1 capitalize">{field === "phone" ? "Phone (optional)" : field}</label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    placeholder={field === "name" ? "Full name" : field === "email" ? "your@email.com" : "+27 000 000 0000"}
                    value={contact[field]}
                    onChange={(e) => setContact((c) => ({ ...c, [field]: e.target.value }))}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 bg-stone-50 text-stone-800"
                  />
                </div>
              ))}

              {/* Skin concerns / notes */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Skin concerns or special requests <span className="text-stone-400 font-normal">(optional)</span></label>
                <textarea
                  rows={3}
                  placeholder="e.g. sensitive skin, acne-prone, prefer unscented products, first-time visitor…"
                  value={skinNotes}
                  onChange={(e) => setSkinNotes(e.target.value)}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 bg-stone-50 text-stone-800 resize-none"
                />
              </div>
            </div>

            {/* Points redemption */}
            {loyaltyAccount && loyaltyAccount.balance > 0 && (
              <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <div className="font-semibold text-amber-800 mb-1 flex items-center gap-2">🏅 Use loyalty points</div>
                <div className="text-sm text-amber-700 mb-3">You have <strong>{loyaltyAccount.balance} points</strong> available.</div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={loyaltyAccount.balance}
                    step={100}
                    value={pointsToRedeem}
                    onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="font-bold text-amber-700 w-20 text-right">{pointsToRedeem} pts</span>
                </div>
                {pointsToRedeem > 0 && loyaltyConfig && (
                  <div className="text-xs text-amber-600 mt-2">
                    Saving approx. R{((pointsToRedeem / loyaltyConfig.redemptionRate) * 10).toFixed(0)} on your treatment
                  </div>
                )}
              </div>
            )}

            <button
              disabled={!contact.name || !contact.email}
              onClick={() => setStep("confirm")}
              className="mt-6 w-full bg-teal-700 text-white py-4 rounded-xl hover:bg-teal-800 disabled:opacity-40 transition-colors font-medium"
            >
              Review Booking →
            </button>
            <button onClick={() => setStep("datetime")} className="mt-3 text-sm text-teal-600 hover:underline">← Back</button>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div>
            <h2 className="font-display text-3xl font-bold text-stone-900 mb-2">Confirm your booking</h2>
            <p className="text-stone-500 text-sm mb-6">Review the details of your treatment</p>
            <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4 mb-5">
              <div className="flex justify-between items-center py-1">
                <span className="text-stone-500 text-sm">Treatment</span>
                <span className="font-semibold text-stone-800 flex items-center gap-1">{CATEGORY_ICONS[selectedService?.category] ?? "✨"} {selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-stone-50">
                <span className="text-stone-500 text-sm">Therapist</span>
                <span className="font-semibold text-stone-800">{selectedStaff?.user.name ?? "Any Available"}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-stone-50">
                <span className="text-stone-500 text-sm">Date & Time</span>
                <span className="font-semibold text-stone-800 text-right text-sm">{new Date(selectedSlot).toLocaleString("en-ZA")}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-stone-50">
                <span className="text-stone-500 text-sm">Duration</span>
                <span className="font-semibold text-stone-800">{selectedService?.durationMins} min</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-stone-50">
                <span className="text-stone-500 text-sm">Price</span>
                <span className="font-bold text-teal-700 text-lg">R{selectedService?.price}</span>
              </div>
              {pointsToRedeem > 0 && (
                <div className="flex justify-between items-center py-1 border-t border-stone-50">
                  <span className="text-amber-600 text-sm">Points redeemed</span>
                  <span className="font-semibold text-amber-600">−{pointsToRedeem} pts</span>
                </div>
              )}
              {skinNotes && (
                <div className="border-t border-stone-50 pt-3">
                  <div className="text-stone-400 text-xs mb-1">Your notes</div>
                  <div className="text-stone-600 text-sm italic">{skinNotes}</div>
                </div>
              )}
            </div>

            {estimatedPoints > 0 && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-5 flex items-center gap-3">
                <span className="text-2xl">✨</span>
                <div>
                  <div className="font-semibold text-teal-800 text-sm">You'll earn approx. {estimatedPoints} points</div>
                  <div className="text-xs text-teal-600">Points credited once your treatment is marked complete</div>
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
              className="w-full bg-teal-700 text-white py-4 rounded-xl text-base font-medium hover:bg-teal-800 disabled:opacity-40 transition-colors"
            >
              {createAppointment.isPending ? "Confirming..." : "Confirm Booking ✓"}
            </button>
            {!session?.user && (
              <p className="mt-3 text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-center">
                Please <a href="/login" className="underline font-medium">sign in</a> or <a href="/signup" className="underline font-medium">create an account</a> to complete your booking.
              </p>
            )}
            {createAppointment.error && (
              <p className="mt-3 text-red-600 text-sm text-center">{createAppointment.error.message}</p>
            )}
            <button onClick={() => setStep("contact")} className="mt-3 text-sm text-teal-600 hover:underline">← Back</button>
          </div>
        )}

        <div className="pb-16" />
      </div>
    </main>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-stone-400">Loading…</div></div>}>
      <BookPageInner />
    </Suspense>
  );
}
