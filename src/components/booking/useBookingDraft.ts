"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export const STEPS = ["treatment", "therapist", "time", "details", "confirm"] as const;
export type Step = (typeof STEPS)[number];
export const STEP_LABELS: Record<Step, string> = {
  treatment: "Treatment",
  therapist: "Therapist",
  time: "Date & time",
  details: "Details",
  confirm: "Confirm",
};

export const ANY_THERAPIST = "any";

export type Draft = {
  step: Step;
  serviceId?: string;
  staffId?: string;
  at?: string;
  category?: string;
};

type Patch = Partial<Record<keyof Draft, string | null | undefined>>;

function readStep(raw: string | null): Step {
  return (STEPS as readonly string[]).includes(raw ?? "") ? (raw as Step) : "treatment";
}

/** Booking state lives in the URL so the browser back button, refresh and the
 *  sign-in round trip all land the client exactly where they were. */
export function useBookingDraft() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const draft: Draft = {
    step: readStep(params.get("step")),
    serviceId: params.get("service") ?? undefined,
    staffId: params.get("staff") ?? undefined,
    at: params.get("at") ?? undefined,
    category: params.get("category") ?? undefined,
  };

  const set = useCallback(
    (patch: Patch, opts: { replace?: boolean } = {}) => {
      const next = new URLSearchParams(params.toString());
      const keys: Record<keyof Draft, string> = { step: "step", serviceId: "service", staffId: "staff", at: "at", category: "category" };
      for (const [k, v] of Object.entries(patch) as [keyof Draft, string | null | undefined][]) {
        if (v) next.set(keys[k], v);
        else next.delete(keys[k]);
      }
      const url = `${pathname}?${next.toString()}`;
      if (opts.replace) router.replace(url, { scroll: false });
      else router.push(url);
    },
    [params, pathname, router]
  );

  return { draft, set, href: `${pathname}?${params.toString()}` };
}
