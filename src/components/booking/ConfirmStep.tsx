"use client";

import { formatDayTime, formatRand } from "@/lib/format";
import { BackButton, StepHeading } from "./StepHeading";

type Service = { name: string; durationMins: number; price: number };

export function ConfirmStep({
  service,
  therapistName,
  at,
  notes,
  estimatedPoints,
  pending,
  error,
  canConfirm,
  onConfirm,
  onBack,
}: {
  service: Service;
  therapistName: string;
  at: string;
  notes: string;
  estimatedPoints: number;
  pending: boolean;
  error?: string;
  canConfirm: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) {
  const rows = [
    ["Treatment", service.name],
    ["Therapist", therapistName],
    ["When", formatDayTime(at)],
    ["Duration", `${service.durationMins} min`],
    ...(notes ? [["Notes", notes]] : []),
  ];

  return (
    <section>
      <StepHeading step={5} title="Confirm your booking" lede="Nothing is paid online. You settle in the salon as usual." />

      <dl className="card divide-y divide-hairline px-5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-start justify-between gap-6 py-4">
            <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</dt>
            <dd className="max-w-[65%] text-right font-display text-[16px] text-ink">{value}</dd>
          </div>
        ))}
        <div className="flex items-center justify-between py-4">
          <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">Price</dt>
          <dd className="font-display text-[24px] text-ink">{formatRand(service.price)}</dd>
        </div>
      </dl>

      {estimatedPoints > 0 && (
        <p className="mt-4 rounded-sm border-l-2 border-l-pink bg-shell px-4 py-3 text-[13px] text-ink-soft">
          About <span className="text-ink">{estimatedPoints} points</span> land on your account once this treatment is completed.
        </p>
      )}

      <button type="button" disabled={pending || !canConfirm} onClick={onConfirm} className="btn-primary mt-6 w-full">
        {pending ? "Confirming…" : "Confirm booking"}
      </button>

      {error && <p className="mt-3 text-center text-[13px] text-pink-dark">{error}</p>}

      <BackButton onClick={onBack}>Edit details</BackButton>
    </section>
  );
}
