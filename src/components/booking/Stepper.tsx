"use client";

import { STEPS, STEP_LABELS, type Step } from "./useBookingDraft";

export function Stepper({ current, onJump }: { current: Step; onJump: (step: Step) => void }) {
  const idx = STEPS.indexOf(current);
  return (
    <ol className="flex gap-1.5" aria-label="Booking progress">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <li key={s} className="flex flex-1 flex-col gap-2">
            <button
              type="button"
              disabled={!done}
              onClick={() => onJump(s)}
              aria-current={active ? "step" : undefined}
              className="group flex w-full flex-col gap-2 text-left disabled:cursor-default"
            >
              <span
                className={`h-[2px] w-full transition-colors duration-300 ${
                  done || active ? "bg-pink" : "bg-hairline"
                } ${done ? "group-hover:bg-pink-dark" : ""}`}
              />
              <span
                className={`hidden text-[10px] uppercase tracking-[0.18em] sm:block ${
                  active ? "text-ink" : done ? "text-pink-dark" : "text-muted"
                }`}
              >
                {STEP_LABELS[s]}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
