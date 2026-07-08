"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useState } from "react";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/clients", label: "Guests", icon: "👥" },
  { href: "/dashboard/services", label: "Treatments", icon: "🌿" },
  { href: "/dashboard/staff", label: "Therapists", icon: "🧖‍♀️" },
  { href: "/dashboard/loyalty", label: "Loyalty", icon: "✨" },
  { href: "/dashboard/vouchers", label: "Vouchers", icon: "🎟️" },
  { href: "/dashboard/marketing", label: "Marketing", icon: "✉️" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function MarketingPage() {
  const { data: audience } = trpc.email.audienceCount.useQuery({ spaId: SPA_ID });
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [result, setResult] = useState<{ recipients: number; sent: number } | null>(null);

  const send = trpc.email.sendCampaign.useMutation({
    onSuccess: (r) => { setResult(r); setSubject(""); setBody(""); },
  });

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      <aside className="w-60 bg-white border-r border-stone-100 p-6 flex flex-col gap-0.5 shrink-0">
        <Link href="/" className="font-display text-xl font-bold text-teal-700 mb-8 block">Perfect 10</Link>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 text-sm rounded-xl px-3 py-2.5 transition-colors ${item.href === "/dashboard/marketing" ? "bg-teal-50 text-teal-700 font-medium" : "text-stone-500 hover:text-teal-700 hover:bg-stone-50"}`}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">Email Marketing</h1>
        <p className="text-stone-400 text-sm mb-8">
          Send a campaign to your {audience ?? 0} opted-in {audience === 1 ? "client" : "clients"}. Only clients who opted in receive it.
        </p>

        {result && (
          <div className="mb-6 rounded-xl bg-teal-50 border border-teal-100 px-4 py-3 text-sm text-teal-800">
            Campaign sent to {result.sent} of {result.recipients} clients.
          </div>
        )}

        <form
          className="bg-white rounded-2xl border border-stone-100 p-8 space-y-5"
          onSubmit={(e) => { e.preventDefault(); send.mutate({ spaId: SPA_ID, subject, body }); }}
        >
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Easter Sunday special — 50% off nails"
              className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-900 outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={7}
              placeholder="Write your message… (basic HTML allowed)"
              className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-900 outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={send.isPending || !subject || !body}
            className="px-6 py-3 text-sm font-semibold text-white rounded-lg disabled:opacity-40"
            style={{ background: "#0d9488" }}
          >
            {send.isPending ? "Sending…" : `Send to ${audience ?? 0} clients`}
          </button>
          {send.error && <div className="text-sm text-red-600">{send.error.message}</div>}
        </form>
      </main>
    </div>
  );
}
