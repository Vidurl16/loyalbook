"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import { BackButton, StepHeading } from "./StepHeading";

export function DetailsStep({
  session,
  returnTo,
  notes,
  onNotes,
  onContinue,
  onBack,
}: {
  session: Session | null;
  returnTo: string;
  notes: string;
  onNotes: (v: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const callback = `?callbackUrl=${encodeURIComponent(returnTo)}`;

  if (!session?.user) {
    return (
      <section>
        <StepHeading step={4} title="Almost there" lede="Sign in so this booking lands on your account and earns points." />
        <div className="card p-6">
          <p className="font-display text-[20px] text-ink">Your treatment and time are saved.</p>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">
            Sign in or join free in a few seconds. You&apos;ll come straight back to this step.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={`/login${callback}`} className="btn-primary flex-1">
              Sign in
            </Link>
            <Link href={`/signup${callback}`} className="btn-outline flex-1">
              Join free
            </Link>
          </div>
        </div>
        <BackButton onClick={onBack}>Change time</BackButton>
      </section>
    );
  }

  return (
    <section>
      <StepHeading step={4} title="Your details" lede="Anything your therapist should know before you arrive?" />

      <div className="card p-5">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Booking as</div>
            <div className="font-display text-[17px] text-ink">{session.user.name}</div>
            <div className="text-[13px] text-muted">{session.user.email}</div>
          </div>
          <span className="rounded-sm border border-pink/30 bg-pink/8 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-pink-dark">
            Earns points
          </span>
        </div>

        <label className="label mt-5" htmlFor="notes">
          Notes <span className="normal-case tracking-normal text-muted/70">(optional)</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Sensitive skin, a design you have in mind, running a few minutes late…"
          className="field resize-none"
        />
      </div>

      <button type="button" onClick={onContinue} className="btn-primary mt-5 w-full">
        Review booking
      </button>
      <BackButton onClick={onBack}>Change time</BackButton>
    </section>
  );
}
