"use client";

import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatLongDay, formatTime } from "@/lib/format";
import { Skeleton } from "@/components/ui/Skeleton";
import { BackButton, StepHeading } from "./StepHeading";

const WEEKDAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const SLOT_STEP_MINS = 30;
const DAYS_AHEAD = 14;

type WorkingHours = Record<string, { open: string; close: string } | undefined>;
type Booked = { startAt: Date | string; endAt: Date | string };

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function buildSlots(day: Date, hours: WorkingHours, booked: Booked[], durationMins: number, now = new Date()) {
  const dayHours = hours[WEEKDAY_KEYS[day.getDay()]];
  if (!dayHours?.open || !dayHours?.close) return [];
  const open = toMinutes(dayHours.open);
  const close = toMinutes(dayHours.close);
  const taken = booked.map((b) => ({ start: new Date(b.startAt).getTime(), end: new Date(b.endAt).getTime() }));
  const slots: string[] = [];
  for (let t = open; t + durationMins <= close; t += SLOT_STEP_MINS) {
    const start = new Date(day);
    start.setHours(Math.floor(t / 60), t % 60, 0, 0);
    const end = start.getTime() + durationMins * 60000;
    if (start.getTime() <= now.getTime()) continue;
    if (taken.some((b) => start.getTime() < b.end && end > b.start)) continue;
    slots.push(start.toISOString());
  }
  return slots;
}

export function TimeStep({
  staffId,
  durationMins,
  value,
  onPick,
  onContinue,
  onBack,
}: {
  staffId?: string;
  durationMins: number;
  value?: string;
  onPick: (iso: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const days = useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: DAYS_AHEAD }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
  }, []);
  const [selectedDay, setSelectedDay] = useState<Date>(() => (value ? new Date(new Date(value).setHours(0, 0, 0, 0)) : days[0]));

  const { data: availability, isLoading } = trpc.staff.getAvailability.useQuery(
    { staffId: staffId ?? "", date: dayKey(selectedDay), durationMins },
    { enabled: !!staffId }
  );

  const slots = availability
    ? buildSlots(selectedDay, (availability.workingHours ?? {}) as WorkingHours, availability.bookedSlots ?? [], durationMins)
    : [];

  return (
    <section>
      <StepHeading step={3} title="When suits you?" lede="Times shown fit your whole treatment, nothing overlaps." />

      <div className="no-scrollbar -mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1">
        {days.map((d) => {
          const active = dayKey(d) === dayKey(selectedDay);
          return (
            <button
              key={dayKey(d)}
              type="button"
              onClick={() => setSelectedDay(d)}
              className={`flex w-[64px] shrink-0 snap-start flex-col items-center rounded-sm border py-3 transition-colors ${
                active ? "border-ink bg-ink text-paper" : "border-hairline bg-paper text-ink hover:border-blush"
              }`}
            >
              <span className={`text-[9px] uppercase tracking-[0.16em] ${active ? "text-paper/70" : "text-muted"}`}>
                {d.toLocaleDateString("en-ZA", { weekday: "short" })}
              </span>
              <span className="font-display text-[22px] leading-tight">{d.getDate()}</span>
              <span className={`text-[9px] uppercase tracking-[0.16em] ${active ? "text-paper/70" : "text-muted"}`}>
                {d.toLocaleDateString("en-ZA", { month: "short" })}
              </span>
            </button>
          );
        })}
      </div>

      <div className="card mt-5 p-5">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-[18px] text-ink">{formatLongDay(selectedDay)}</h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">{durationMins} min</span>
        </div>

        {!staffId ? (
          <p className="py-6 text-center text-[14px] text-muted">No therapists are set up for bookings yet. Please call the salon.</p>
        ) : isLoading ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <p className="py-6 text-center text-[14px] text-muted">Nothing open on this day. Try the next one.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {slots.map((iso) => {
              const active = value === iso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => onPick(iso)}
                  className={`rounded-sm border py-3 text-[14px] transition-colors ${
                    active ? "border-pink bg-pink text-paper" : "border-hairline bg-paper text-ink hover:border-pink hover:text-pink-dark"
                  }`}
                >
                  {formatTime(iso)}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button type="button" disabled={!value} onClick={onContinue} className="btn-primary mt-5 w-full">
        {value ? `Continue · ${formatTime(value)}` : "Pick a time to continue"}
      </button>
      <BackButton onClick={onBack}>Change therapist</BackButton>
    </section>
  );
}
