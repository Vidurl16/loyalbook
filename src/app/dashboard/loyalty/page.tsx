"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useState } from "react";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

export default function LoyaltyConfigPage() {
  const { data: config, refetch } = trpc.loyalty.getConfig.useQuery({ spaId: SPA_ID });
  const update = trpc.loyalty.updateConfig.useMutation({ onSuccess: () => refetch() });
  const [form, setForm] = useState<any>(null);
  const current = form ?? config;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      <aside className="w-60 bg-white border-r border-stone-100 p-6 flex flex-col gap-0.5 shrink-0">
        <Link href="/" className="font-display text-xl font-bold text-teal-700 mb-8 block">LoyalBook</Link>
        {[
          { href: "/dashboard", label: "Overview", icon: "🏠" },
          { href: "/dashboard/clients", label: "Guests", icon: "👥" },
          { href: "/dashboard/services", label: "Treatments", icon: "🌿" },
          { href: "/dashboard/staff", label: "Therapists", icon: "🧖‍♀️" },
          { href: "/dashboard/loyalty", label: "Loyalty", icon: "✨" },
          { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
          { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 text-sm rounded-xl px-3 py-2.5 transition-colors ${item.href === "/dashboard/loyalty" ? "bg-teal-50 text-teal-700 font-medium" : "text-stone-500 hover:text-teal-700 hover:bg-stone-50"}`}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </aside>
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">Loyalty Configuration</h1>
        <p className="text-stone-400 text-sm mb-8">Configure how members earn & redeem points at your spa</p>
        {config && (
          <form
            className="bg-white rounded-2xl border border-stone-100 p-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate({ spaId: SPA_ID, ...current });
            }}
          >
            {([
              ["pointsPerUnit", "Points earned per unit spent", "e.g. 1"],
              ["currencyUnitAmount", "Currency unit amount (R)", "e.g. 10"],
              ["rebookingBonus", "Rebooking bonus points", "e.g. 50"],
              ["rebookingWindowDays", "Rebooking window (days)", "e.g. 56"],
              ["birthdayBonus", "Birthday bonus points", "e.g. 200"],
              ["redemptionRate", "Redemption rate (pts per R10 discount)", "e.g. 100"],
              ["minRedeem", "Minimum points to redeem", "e.g. 500"],
              ["expiryDays", "Points expiry in days (blank = never)", ""],
            ] as [keyof typeof config, string, string][]).map(([field, label, placeholder]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
                <input
                  type="number"
                  placeholder={placeholder}
                  value={current?.[field] ?? ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...(f ?? config), [field]: e.target.value === "" ? null : Number(e.target.value) }))
                  }
                  className="w-full border border-stone-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-teal-500 bg-stone-50 text-stone-800"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={update.isPending}
              className="w-full bg-teal-700 text-white py-3 rounded-xl hover:bg-teal-800 disabled:opacity-50 transition-colors font-medium"
            >
              {update.isPending ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
