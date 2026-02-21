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
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-white border-r border-slate-200 p-6">
        <Link href="/dashboard" className="text-xl font-bold text-teal-600 mb-6 block">LoyalBook</Link>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-teal-600">← Back to Dashboard</Link>
      </aside>
      <main className="flex-1 p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">Loyalty Configuration</h1>
        {config && (
          <form
            className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              update.mutate({ spaId: SPA_ID, ...current });
            }}
          >
            {([
              ["pointsPerUnit", "Points per unit spent", "number"],
              ["currencyUnitAmount", "Currency unit amount (e.g. R10)", "number"],
              ["rebookingBonus", "Rebooking bonus points", "number"],
              ["rebookingWindowDays", "Rebooking window (days)", "number"],
              ["birthdayBonus", "Birthday bonus points", "number"],
              ["redemptionRate", "Redemption rate (pts per R10)", "number"],
              ["minRedeem", "Minimum points to redeem", "number"],
              ["expiryDays", "Points expiry (days, blank = never)", "number"],
            ] as [keyof typeof config, string, string][]).map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input
                  type="number"
                  value={current?.[field] ?? ""}
                  onChange={(e) =>
                    setForm((f: any) => ({ ...(f ?? config), [field]: e.target.value === "" ? null : Number(e.target.value) }))
                  }
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:border-teal-500"
                />
              </div>
            ))}
            <button
              type="submit"
              disabled={update.isPending}
              className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {update.isPending ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
