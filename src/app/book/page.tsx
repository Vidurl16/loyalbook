"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

type Step = "service" | "staff" | "datetime" | "contact" | "confirm";

export default function BookPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
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

  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: (data) => router.push(`/book/confirm?id=${data.id}`),
  });

  const steps: Step[] = ["service", "staff", "datetime", "contact", "confirm"];
  const stepIdx = steps.indexOf(step);

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <a href="/" className="text-2xl font-bold text-teal-600">LoyalBook</a>
        <span className="text-slate-400">/</span>
        <span className="text-slate-600">Book Appointment</span>
      </nav>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${i <= stepIdx ? "bg-teal-500" : "bg-slate-200"}`}
            />
          ))}
        </div>

        {/* Step: Select Service */}
        {step === "service" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Choose a service</h2>
            <div className="grid gap-3">
              {services?.map((svc) => (
                <button
                  key={svc.id}
                  onClick={() => { setSelectedService(svc); setStep("staff"); }}
                  className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-500 hover:shadow-sm transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-slate-800">{svc.name}</div>
                      <div className="text-sm text-slate-500">{svc.category} · {svc.durationMins} min</div>
                    </div>
                    <div className="text-teal-600 font-bold">R{svc.price}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Select Staff */}
        {step === "staff" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Choose a therapist</h2>
            <div className="grid gap-3">
              <button
                onClick={() => { setSelectedStaff(null); setStep("datetime"); }}
                className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-500 transition-all"
              >
                <div className="font-semibold text-slate-800">Any Available</div>
                <div className="text-sm text-slate-500">We'll assign the first available therapist</div>
              </button>
              {staffList?.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSelectedStaff(s); setStep("datetime"); }}
                  className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 hover:border-teal-500 transition-all"
                >
                  <div className="font-semibold text-slate-800">{s.user.name}</div>
                  {s.bio && <div className="text-sm text-slate-500">{s.bio}</div>}
                </button>
              ))}
            </div>
            <button onClick={() => setStep("service")} className="mt-4 text-sm text-teal-600 hover:underline">← Back</button>
          </div>
        )}

        {/* Step: Date & Time */}
        {step === "datetime" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Pick a date & time</h2>
            <input
              type="datetime-local"
              className="w-full border border-slate-200 rounded-xl p-4 text-slate-800 focus:outline-none focus:border-teal-500"
              onChange={(e) => setSelectedSlot(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
            />
            <button
              disabled={!selectedSlot}
              onClick={() => setStep("contact")}
              className="mt-6 w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              Continue →
            </button>
            <button onClick={() => setStep("staff")} className="mt-2 text-sm text-teal-600 hover:underline">← Back</button>
          </div>
        )}

        {/* Step: Contact Details */}
        {step === "contact" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Your details</h2>
            {session?.user && (
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4 text-sm text-teal-700">
                ✅ Logged in as <strong>{session.user.email}</strong> — points will be earned on this booking.
              </div>
            )}
            <div className="space-y-4">
              {(["name", "email", "phone"] as const).map((field) => (
                <input
                  key={field}
                  type={field === "email" ? "email" : "text"}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={contact[field]}
                  onChange={(e) => setContact((c) => ({ ...c, [field]: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl p-4 focus:outline-none focus:border-teal-500"
                />
              ))}
            </div>

            {/* Points redemption */}
            {loyaltyAccount && loyaltyAccount.balance > 0 && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="font-semibold text-amber-800 mb-2">🏅 Use loyalty points</div>
                <div className="text-sm text-amber-700 mb-3">You have {loyaltyAccount.balance} points available.</div>
                <input
                  type="number"
                  min={0}
                  max={loyaltyAccount.balance}
                  step={100}
                  value={pointsToRedeem}
                  onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                  className="w-full border border-amber-300 rounded-lg p-2"
                />
              </div>
            )}

            <button
              disabled={!contact.name || !contact.email}
              onClick={() => setStep("confirm")}
              className="mt-6 w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              Review Booking →
            </button>
            <button onClick={() => setStep("datetime")} className="mt-2 text-sm text-teal-600 hover:underline">← Back</button>
          </div>
        )}

        {/* Step: Confirm */}
        {step === "confirm" && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Confirm your booking</h2>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 mb-6">
              <div className="flex justify-between"><span className="text-slate-500">Service</span><span className="font-semibold">{selectedService?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Therapist</span><span className="font-semibold">{selectedStaff?.user.name ?? "Any Available"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Date & Time</span><span className="font-semibold">{new Date(selectedSlot).toLocaleString("en-ZA")}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Price</span><span className="font-semibold text-teal-600">R{selectedService?.price}</span></div>
              {pointsToRedeem > 0 && (
                <div className="flex justify-between text-amber-600"><span>Points redeemed</span><span>-{pointsToRedeem} pts</span></div>
              )}
            </div>
            <button
              disabled={createAppointment.isPending}
              onClick={() => {
                const start = new Date(selectedSlot);
                const end = new Date(start.getTime() + selectedService.durationMins * 60000);
                createAppointment.mutate({
                  spaId: SPA_ID,
                  clientId: (session?.user as any)?.id ?? "guest",
                  staffId: selectedStaff?.id ?? staffList?.[0]?.id ?? "",
                  serviceId: selectedService.id,
                  startAt: start.toISOString(),
                  endAt: end.toISOString(),
                  pointsRedeemed: pointsToRedeem,
                });
              }}
              className="w-full bg-teal-600 text-white py-4 rounded-xl text-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {createAppointment.isPending ? "Booking..." : "Confirm Booking ✓"}
            </button>
            {createAppointment.error && (
              <p className="mt-3 text-red-600 text-sm text-center">{createAppointment.error.message}</p>
            )}
            <button onClick={() => setStep("contact")} className="mt-2 text-sm text-teal-600 hover:underline">← Back</button>
          </div>
        )}
      </div>
    </main>
  );
}
