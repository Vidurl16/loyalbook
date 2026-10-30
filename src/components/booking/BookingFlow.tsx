"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { ANY_THERAPIST, useBookingDraft, type Step } from "./useBookingDraft";
import { Stepper } from "./Stepper";
import { BookingSummary } from "./BookingSummary";
import { TreatmentStep } from "./TreatmentStep";
import { TherapistStep } from "./TherapistStep";
import { TimeStep } from "./TimeStep";
import { DetailsStep } from "./DetailsStep";
import { ConfirmStep } from "./ConfirmStep";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID ?? "";

function resolveStep(requested: Step, has: { service: boolean; staff: boolean; at: boolean }): Step {
  if (!has.service) return "treatment";
  if (!has.staff) return "therapist";
  if (!has.at) return requested === "time" || requested === "therapist" || requested === "treatment" ? requested : "time";
  return requested;
}

export function BookingFlow() {
  const router = useRouter();
  const { data: session } = useSession();
  const { draft, set, href } = useBookingDraft();
  const [notes, setNotes] = useState("");

  const { data: services, isLoading: servicesLoading } = trpc.services.list.useQuery({ spaId: SPA_ID });
  const { data: allStaff } = trpc.staff.list.useQuery({ spaId: SPA_ID });
  const { data: staffForService } = trpc.staff.list.useQuery(
    { spaId: SPA_ID, serviceId: draft.serviceId },
    { enabled: !!draft.serviceId }
  );
  const { data: loyaltyConfig } = trpc.loyalty.getConfig.useQuery({ spaId: SPA_ID }, { enabled: !!session?.user });

  const service = services?.find((s) => s.id === draft.serviceId);
  const staff = draft.staffId && draft.staffId !== ANY_THERAPIST ? allStaff?.find((s) => s.id === draft.staffId) : undefined;
  const staffPreselected = !!draft.staffId && !draft.serviceId;

  const candidates = staffForService && staffForService.length > 0 ? staffForService : (allStaff ?? []);
  const availabilityStaffId = staff?.id ?? candidates[0]?.id;

  const step = resolveStep(draft.step, { service: !!service, staff: !!draft.staffId, at: !!draft.at });

  const estimatedPoints =
    loyaltyConfig && service ? Math.floor((service.price / loyaltyConfig.currencyUnitAmount) * loyaltyConfig.pointsPerUnit) : 0;

  const createAppointment = trpc.appointments.create.useMutation({
    onSuccess: (data) => router.push(`/book/confirm?id=${data.id}&pts=${estimatedPoints}`),
  });

  function confirm() {
    if (!service || !draft.at || !session?.user) return;
    const start = new Date(draft.at);
    const end = new Date(start.getTime() + service.durationMins * 60000);
    createAppointment.mutate({
      spaId: SPA_ID,
      ...(availabilityStaffId ? { staffId: availabilityStaffId } : {}),
      serviceId: service.id,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      notes: notes || undefined,
    });
  }

  return (
    <main className="container-x max-w-3xl pb-16 pt-8 md:pt-12">
      <Stepper current={step} onJump={(s) => set({ step: s })} />

      {service && (
        <BookingSummary
          service={service}
          therapistName={draft.staffId === ANY_THERAPIST ? "Any therapist" : staff?.user.name ?? undefined}
          at={draft.at}
          onChange={(s) => set({ step: s })}
        />
      )}

      <div key={step} className="page-in mt-8">
        {step === "treatment" && (
          <TreatmentStep
            services={services ?? []}
            loading={servicesLoading}
            initialCategory={draft.category}
            onlyServiceIds={staffPreselected ? staff?.services.map((x) => x.serviceId) : undefined}
            therapistName={staffPreselected ? staff?.user.name ?? undefined : undefined}
            onSelect={(id) => set({ serviceId: id, step: staffPreselected ? "time" : "therapist", category: null })}
          />
        )}

        {step === "therapist" && service && (
          <TherapistStep
            therapists={staffForService ?? []}
            loading={!staffForService}
            onSelect={(id) => set({ staffId: id, step: "time" })}
            onBack={() => set({ step: "treatment", serviceId: null, staffId: null })}
          />
        )}

        {step === "time" && service && (
          <TimeStep
            staffId={availabilityStaffId}
            durationMins={service.durationMins}
            value={draft.at}
            onPick={(iso) => set({ at: iso }, { replace: true })}
            onContinue={() => set({ step: "details" })}
            onBack={() => set({ step: "therapist", staffId: null, at: null })}
          />
        )}

        {step === "details" && service && (
          <DetailsStep
            session={session}
            returnTo={href}
            notes={notes}
            onNotes={setNotes}
            onContinue={() => set({ step: "confirm" })}
            onBack={() => set({ step: "time" })}
          />
        )}

        {step === "confirm" && service && draft.at && (
          <ConfirmStep
            service={service}
            therapistName={draft.staffId === ANY_THERAPIST ? "Any available therapist" : staff?.user.name ?? "Any available therapist"}
            at={draft.at}
            notes={notes}
            estimatedPoints={estimatedPoints}
            pending={createAppointment.isPending}
            error={createAppointment.error?.message}
            canConfirm={!!session?.user}
            onConfirm={confirm}
            onBack={() => set({ step: "details" })}
          />
        )}
      </div>
    </main>
  );
}
