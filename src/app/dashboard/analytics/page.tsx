"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/clients", label: "Guests", icon: "👥" },
  { href: "/dashboard/services", label: "Treatments", icon: "🌿" },
  { href: "/dashboard/staff", label: "Therapists", icon: "🧖‍♀️" },
  { href: "/dashboard/loyalty", label: "Loyalty", icon: "✨" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

type Period = "day" | "week" | "month" | "year";

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [period, setPeriod] = useState<Period>("month");

  const { data: revenue } = trpc.analytics.revenue.useQuery(
    { spaId: SPA_ID, period },
    { enabled: !!SPA_ID }
  );

  const { data: topServices } = trpc.analytics.topServices.useQuery(
    { spaId: SPA_ID },
    { enabled: !!SPA_ID }
  );

  const { data: pointsEconomy } = trpc.analytics.pointsEconomy.useQuery(
    { spaId: SPA_ID },
    { enabled: !!SPA_ID }
  );

  const periodLabels: Record<Period, string> = {
    day: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
        <div className="p-6 border-b border-stone-100">
          <h1 className="font-display text-xl text-stone-800">🌸 LoyalBook</h1>
          <p className="text-xs text-stone-400 mt-1">Spa Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-teal-50 text-teal-700"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-100">
          <p className="text-xs text-stone-500">{session?.user?.name ?? "Staff"}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display text-stone-800">Analytics</h2>
            <p className="text-stone-500 text-sm mt-1">Revenue, bookings, and loyalty insights</p>
          </div>
          <div className="flex gap-1 bg-white border border-stone-200 rounded-lg p-1">
            {(["day", "week", "month", "year"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  period === p ? "bg-teal-600 text-white" : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue cards */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Revenue</p>
            <p className="text-3xl font-display text-stone-800 mt-2">
              R {revenue?.total.toLocaleString() ?? "—"}
            </p>
            <p className="text-sm text-stone-400 mt-1">{periodLabels[period]}</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Completed Treatments</p>
            <p className="text-3xl font-display text-stone-800 mt-2">{revenue?.count ?? "—"}</p>
            <p className="text-sm text-stone-400 mt-1">{periodLabels[period]}</p>
          </div>
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wide">Avg. Per Treatment</p>
            <p className="text-3xl font-display text-stone-800 mt-2">
              {revenue?.count
                ? `R ${Math.round((revenue.total / revenue.count)).toLocaleString()}`
                : "—"}
            </p>
            <p className="text-sm text-stone-400 mt-1">Revenue ÷ bookings</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Top Services */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Top Treatments</h3>
            {!topServices || topServices.length === 0 ? (
              <p className="text-stone-400 text-sm">No completed treatments yet</p>
            ) : (
              <div className="space-y-3">
                {topServices.map((item, i) => (
                  <div key={item.serviceId} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-stone-400 w-5">{i + 1}</span>
                    <div className="flex-1">
                      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{
                            width: `${Math.round(
                              (item._count.id / (topServices[0]?._count.id ?? 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-stone-700 w-8 text-right">
                      {item._count.id}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Points Economy */}
          <div className="bg-white rounded-xl border border-stone-200 p-6">
            <h3 className="font-semibold text-stone-800 mb-4">Loyalty Economy</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Total Points Issued</span>
                <span className="font-semibold text-stone-800">
                  {pointsEconomy?.totalIssued.toLocaleString() ?? "—"} pts
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Total Redeemed</span>
                <span className="font-semibold text-rose-600">
                  {pointsEconomy?.totalRedeemed.toLocaleString() ?? "—"} pts
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-500">Outstanding Balance</span>
                <span className="font-semibold text-teal-600">
                  {pointsEconomy?.totalOutstanding.toLocaleString() ?? "—"} pts
                </span>
              </div>
              {pointsEconomy && pointsEconomy.totalIssued > 0 && (
                <div className="pt-2">
                  <div className="flex justify-between text-xs text-stone-400 mb-1">
                    <span>Redemption rate</span>
                    <span>
                      {Math.round((pointsEconomy.totalRedeemed / pointsEconomy.totalIssued) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-400 rounded-full"
                      style={{
                        width: `${Math.round(
                          (pointsEconomy.totalRedeemed / pointsEconomy.totalIssued) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
