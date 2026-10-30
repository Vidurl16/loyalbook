"use client";

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { brand } from "@/lib/brand";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID ?? "";

type Stage = "enter" | "verify" | "consent" | "result";

const STAGE_TITLE: Record<Stage, string> = {
  enter: "Enter the programme",
  verify: "Check your inbox",
  consent: "Two quick agreements",
  result: "Your result",
};

export default function MysteryShopperEnterPage() {
  const [stage, setStage] = useState<Stage>("enter");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [consentReview, setConsentReview] = useState(false);
  const [consentPhoto, setConsentPhoto] = useState(false);
  const [outcome, setOutcome] = useState<{ prize: string; win: boolean } | null>(null);
  const [error, setError] = useState("");

  const next = (s: Stage) => () => {
    setError("");
    setStage(s);
  };
  const fail = (e: { message: string }) => setError(e.message);

  const enter = trpc.mysteryShopper.enter.useMutation({ onSuccess: next("verify"), onError: fail });
  const verify = trpc.mysteryShopper.verify.useMutation({ onSuccess: next("consent"), onError: fail });
  const draw = trpc.mysteryShopper.spin.useMutation({
    onSuccess: (r) => {
      setOutcome(r);
      next("result")();
    },
    onError: fail,
  });

  return (
    <main className="container-x max-w-md pb-16 pt-8 md:pt-12">
      <Link href="/mystery-shopper" className="btn-ghost mb-4">
        ← Mystery shopper
      </Link>
      <p className="eyebrow mb-2">Mystery shopper</p>
      <h1 className="display-lg mb-6">{STAGE_TITLE[stage]}</h1>

      <div key={stage} className="page-in card p-6">
        {stage === "enter" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enter.mutate({ spaId: SPA_ID, name, email, phone: phone || undefined });
            }}
            className="flex flex-col gap-3"
          >
            <p className="mb-2 text-[14px] leading-relaxed text-ink-soft">
              If you&apos;re chosen, you&apos;ll visit like any other client and share an honest review afterwards. Please
              don&apos;t tell our team you&apos;re the mystery shopper.
            </p>
            <input className="field" placeholder="Full name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="field" type="email" placeholder="Email address" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="field" type="tel" placeholder="Phone (optional)" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {error && <p className="text-[13px] text-pink-dark">{error}</p>}
            <button type="submit" className="btn-primary mt-2 w-full" disabled={enter.isPending}>
              {enter.isPending ? "Sending code…" : "Continue"}
            </button>
          </form>
        )}

        {stage === "verify" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify.mutate({ spaId: SPA_ID, email, code });
            }}
            className="flex flex-col gap-3"
          >
            <p className="mb-2 text-[14px] leading-relaxed text-ink-soft">
              We emailed a 6-digit code to <span className="text-ink">{email}</span>.
            </p>
            <input
              className="field text-center font-display text-[26px] tracking-[0.4em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
            {error && <p className="text-[13px] text-pink-dark">{error}</p>}
            <button type="submit" className="btn-primary mt-2 w-full" disabled={verify.isPending || code.length < 4}>
              {verify.isPending ? "Verifying…" : "Verify"}
            </button>
          </form>
        )}

        {stage === "consent" && (
          <div className="flex flex-col gap-4">
            {[
              { checked: consentReview, set: setConsentReview, text: "If chosen, I'll leave an honest review of my treatment and the service." },
              { checked: consentPhoto, set: setConsentPhoto, text: `My photo may be shared internally with the ${brand.name} team.` },
            ].map((c) => (
              <label key={c.text} className="flex cursor-pointer items-start gap-3 text-[14px] leading-relaxed text-ink-soft">
                <input type="checkbox" checked={c.checked} onChange={(e) => c.set(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-pink" />
                {c.text}
              </label>
            ))}
            {error && <p className="text-[13px] text-pink-dark">{error}</p>}
            <button
              type="button"
              className="btn-primary mt-2 w-full"
              disabled={draw.isPending || !consentReview || !consentPhoto}
              onClick={() => draw.mutate({ spaId: SPA_ID, email, consentReview, consentPhoto })}
            >
              {draw.isPending ? "Entering…" : "Enter the draw"}
            </button>
          </div>
        )}

        {stage === "result" && outcome && (
          <div className="py-4 text-center">
            <p className="eyebrow">{outcome.win ? "You've been chosen" : "Not this time"}</p>
            <p className="display-md mt-3 text-pink-dark">{outcome.prize}</p>
            <p className="mt-4 text-[14px] leading-relaxed text-ink-soft">
              {outcome.win
                ? "We'll email you the details. Book your visit, keep it discreet, and come back here afterwards to register your visit and leave your review."
                : "Thank you for entering. We'll let you know when the programme opens again."}
            </p>
            <Link href={outcome.win ? "/mystery-shopper/apply" : "/book"} className="btn-primary mt-6 w-full">
              {outcome.win ? "Register my visit" : "Book a treatment"}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
