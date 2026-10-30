"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";

const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID ?? "";
const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID ?? "";

export default function MysteryShopperRegisterVisitPage() {
  const { status } = useSession();
  const [form, setForm] = useState({ serviceToEvaluate: "", plannedVisitDate: "", preVisitNotes: "" });
  const [visitId, setVisitId] = useState("");

  const { data: services } = trpc.services.list.useQuery({ spaId: SPA_ID });
  const categories = Array.from(new Set(services?.map((s) => s.category) ?? []));

  const register = trpc.mysteryShoppers.register.useMutation({ onSuccess: (v) => setVisitId(v.id) });

  if (status === "unauthenticated") {
    return (
      <Frame title="Sign in to register your visit" lede="Your visit and review are tied to your account.">
        <Link href="/login?callbackUrl=/mystery-shopper/apply" className="btn-primary w-full">
          Sign in
        </Link>
      </Frame>
    );
  }

  if (visitId) {
    return (
      <Frame title="You're registered." lede="Book and enjoy your treatment as a regular client. Afterwards, come back to submit your review.">
        <div className="flex flex-col gap-3">
          <Link href="/book" className="btn-primary w-full">
            Book a treatment
          </Link>
          <Link href={`/mystery-shopper/submit?id=${visitId}`} className="btn-outline w-full">
            Submit my review
          </Link>
        </div>
      </Frame>
    );
  }

  return (
    <Frame title="Register your visit" lede="For chosen mystery shoppers. Tell us a little about the visit you're planning.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          register.mutate({
            locationId: LOCATION_ID,
            serviceToEvaluate: form.serviceToEvaluate || undefined,
            plannedVisitDate: form.plannedVisitDate || undefined,
            preVisitNotes: form.preVisitNotes || undefined,
          });
        }}
        className="card flex flex-col gap-5 p-6"
      >
        <div>
          <label className="label" htmlFor="category">
            Treatment category
          </label>
          <select id="category" className="field" value={form.serviceToEvaluate} onChange={(e) => setForm((f) => ({ ...f, serviceToEvaluate: e.target.value }))}>
            <option value="">Not decided yet</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="date">
            Planned visit date <span className="normal-case tracking-normal text-muted/70">(optional)</span>
          </label>
          <input id="date" type="date" className="field" min={new Date().toISOString().slice(0, 10)} value={form.plannedVisitDate} onChange={(e) => setForm((f) => ({ ...f, plannedVisitDate: e.target.value }))} />
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Notes <span className="normal-case tracking-normal text-muted/70">(optional)</span>
          </label>
          <textarea id="notes" rows={3} className="field resize-none" placeholder="First visit, or something you particularly want to evaluate…" value={form.preVisitNotes} onChange={(e) => setForm((f) => ({ ...f, preVisitNotes: e.target.value }))} />
        </div>
        {register.error && <p className="text-[13px] text-pink-dark">{register.error.message}</p>}
        <button type="submit" className="btn-primary w-full" disabled={register.isPending || !LOCATION_ID}>
          {register.isPending ? "Registering…" : "Register visit"}
        </button>
      </form>
    </Frame>
  );
}

function Frame({ title, lede, children }: { title: string; lede: string; children: React.ReactNode }) {
  return (
    <main className="container-x max-w-md pb-16 pt-8 md:pt-12">
      <Link href="/mystery-shopper" className="btn-ghost mb-4">
        ← Mystery shopper
      </Link>
      <p className="eyebrow mb-2">Mystery shopper</p>
      <h1 className="display-lg">{title}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{lede}</p>
      <div className="mt-8">{children}</div>
    </main>
  );
}
