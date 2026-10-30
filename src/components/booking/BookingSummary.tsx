"use client";

import { formatDayTime, formatRand } from "@/lib/format";
import type { Step } from "./useBookingDraft";

type Service = { name: string; durationMins: number; price: number };

function Row({ label, value, onChange }: { label: string; value: string; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-muted">{label}</div>
        <div className="truncate font-display text-[16px] text-ink">{value}</div>
      </div>
      <button type="button" onClick={onChange} className="btn-ghost text-pink-dark hover:text-pink">
        Change
      </button>
    </div>
  );
}

export function BookingSummary({
  service,
  therapistName,
  at,
  onChange,
}: {
  service: Service;
  therapistName?: string;
  at?: string;
  onChange: (step: Step) => void;
}) {
  return (
    <aside className="mt-6 divide-y divide-hairline rounded-sm border-l-2 border-l-pink bg-shell px-5">
      <Row
        label="Treatment"
        value={`${service.name} · ${service.durationMins} min · ${formatRand(service.price)}`}
        onChange={() => onChange("treatment")}
      />
      {therapistName && <Row label="Therapist" value={therapistName} onChange={() => onChange("therapist")} />}
      {at && <Row label="When" value={formatDayTime(at)} onChange={() => onChange("time")} />}
    </aside>
  );
}
