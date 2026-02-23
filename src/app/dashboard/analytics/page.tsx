"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

type Period = "day" | "week" | "month" | "year";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  no_show: "No Show",
  cancelled_by_client: "Client Cancel",
  cancelled_by_spa: "Spa Cancel",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  completed: "#22c55e",
  no_show: "#ef4444",
  cancelled_by_client: "#f97316",
  cancelled_by_spa: "#ec4899",
};

const PERIOD_LABELS: Record<Period, string> = {
  day: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-white border border-[#D1D2D4] p-6">
      <p className="text-xs font-semibold text-[#8D8E8F] uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-bold" style={{ color: accent ? "#C9262E" : "#000000" }}>{value}</p>
      {sub && <p className="text-xs text-[#8D8E8F] mt-1.5">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("month");

  const { data: revenue } = trpc.analytics.revenue.useQuery({ spaId: SPA_ID, period }, { enabled: !!SPA_ID });
  const { data: topServices } = trpc.analytics.topServices.useQuery({ spaId: SPA_ID }, { enabled: !!SPA_ID });
  const { data: pointsEconomy } = trpc.analytics.pointsEconomy.useQuery({ spaId: SPA_ID }, { enabled: !!SPA_ID });
  const { data: statusBreakdown } = trpc.analytics.bookingStatusBreakdown.useQuery({ spaId: SPA_ID, period }, { enabled: !!SPA_ID });
  const { data: newMembers } = trpc.analytics.newMembers.useQuery({ spaId: SPA_ID, period }, { enabled: !!SPA_ID });
  const { data: therapists } = trpc.analytics.therapistPerformance.useQuery({ spaId: SPA_ID, period }, { enabled: !!SPA_ID });

  const avgRevenue = revenue?.count ? Math.round(revenue.total / revenue.count) : 0;
  const totalBookings = statusBreakdown?.reduce((s, x) => s + x.count, 0) ?? 0;
  const maxServiceCount = topServices?.[0]?.count ?? 1;
  const maxTherapistCount = therapists?.[0]?.count ?? 1;

  return (
    <div className="min-h-screen flex bg-[#EBEBEC]">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-black" style={{ fontFamily: "Didot, Georgia, serif" }}>Analytics</h2>
            <p className="text-[#8D8E8F] text-sm mt-1">Revenue, bookings & loyalty insights</p>
          </div>
          {/* Period selector */}
          <div className="flex gap-1 bg-white border border-[#D1D2D4] p-1">
            {(["day", "week", "month", "year"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-4 py-1.5 text-sm font-semibold transition-colors"
                style={period === p
                  ? { background: "#C9262E", color: "#fff" }
                  : { color: "#4A4A4A", background: "transparent" }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Top stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Revenue" value={`R ${(revenue?.total ?? 0).toLocaleString()}`} sub={PERIOD_LABELS[period]} accent />
          <StatCard label="Completed" value={revenue?.count ?? 0} sub="Treatments" />
          <StatCard label="Avg per Visit" value={avgRevenue ? `R ${avgRevenue}` : "—"} sub="Revenue ÷ bookings" />
          <StatCard label="New Members" value={newMembers?.count ?? 0} sub={`${newMembers?.total ?? 0} total clients`} />
          <StatCard label="Points Issued" value={(pointsEconomy?.totalIssued ?? 0).toLocaleString()} sub="Lifetime" />
        </div>

        {/* Row 2: Booking status + Points economy */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Booking status breakdown */}
          <div className="bg-white border border-[#D1D2D4] p-6">
            <h3 className="font-bold text-black text-sm uppercase tracking-widest mb-5">Booking Status — {PERIOD_LABELS[period]}</h3>
            {!statusBreakdown || statusBreakdown.length === 0 ? (
              <p className="text-[#8D8E8F] text-sm">No bookings in this period.</p>
            ) : (
              <div className="space-y-3">
                {statusBreakdown.map((item) => {
                  const pct = totalBookings > 0 ? Math.round((item.count / totalBookings) * 100) : 0;
                  return (
                    <div key={item.status}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-[#4A4A4A]">{STATUS_LABELS[item.status] ?? item.status}</span>
                        <span className="text-[#8D8E8F]">{item.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-[#EBEBEC]">
                        <div
                          className="h-full transition-all"
                          style={{ width: `${pct}%`, background: STATUS_COLORS[item.status] ?? "#8D8E8F" }}
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-[#8D8E8F] pt-1">{totalBookings} total bookings</p>
              </div>
            )}
          </div>

          {/* Points Economy */}
          <div className="bg-white border border-[#D1D2D4] p-6">
            <h3 className="font-bold text-black text-sm uppercase tracking-widest mb-5">Loyalty Economy</h3>
            <div className="space-y-4">
              {[
                { label: "Total Points Issued", value: (pointsEconomy?.totalIssued ?? 0).toLocaleString() + " pts", color: "#000" },
                { label: "Points Redeemed", value: (pointsEconomy?.totalRedeemed ?? 0).toLocaleString() + " pts", color: "#C9262E" },
                { label: "Outstanding Balance", value: (pointsEconomy?.totalOutstanding ?? 0).toLocaleString() + " pts", color: "#22c55e" },
                { label: "Active Members", value: (pointsEconomy?.memberCount ?? 0).toLocaleString(), color: "#3b82f6" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center border-b border-[#EBEBEC] pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-[#4A4A4A]">{row.label}</span>
                  <span className="font-bold text-sm" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
              {pointsEconomy && pointsEconomy.totalIssued > 0 && (
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-[#8D8E8F] mb-1.5">
                    <span>Redemption rate</span>
                    <span>{Math.round((pointsEconomy.totalRedeemed / pointsEconomy.totalIssued) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-[#EBEBEC]">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.round((pointsEconomy.totalRedeemed / pointsEconomy.totalIssued) * 100)}%`,
                        background: "#C9262E",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Top treatments + Therapist performance */}
        <div className="grid grid-cols-2 gap-6">
          {/* Top Treatments */}
          <div className="bg-white border border-[#D1D2D4] p-6">
            <h3 className="font-bold text-black text-sm uppercase tracking-widest mb-5">Top Treatments (All Time)</h3>
            {!topServices || topServices.length === 0 ? (
              <p className="text-[#8D8E8F] text-sm">No completed treatments yet.</p>
            ) : (
              <div className="space-y-4">
                {topServices.map((item, i) => (
                  <div key={item.serviceId}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-[#4A4A4A] truncate pr-2">
                        <span className="text-[#8D8E8F] mr-2">{i + 1}.</span>
                        {item.service?.name ?? "Unknown"}
                        {item.service?.category && (
                          <span className="text-[#8D8E8F] ml-1">· {item.service.category}</span>
                        )}
                      </span>
                      <span className="text-[#8D8E8F] shrink-0">{item.count}×</span>
                    </div>
                    <div className="h-1.5 bg-[#EBEBEC]">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.round((item.count / maxServiceCount) * 100)}%`,
                          background: "#C9262E",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Therapist Performance */}
          <div className="bg-white border border-[#D1D2D4] p-6">
            <h3 className="font-bold text-black text-sm uppercase tracking-widest mb-5">Therapist Performance — {PERIOD_LABELS[period]}</h3>
            {!therapists || therapists.length === 0 ? (
              <p className="text-[#8D8E8F] text-sm">No completed treatments in this period.</p>
            ) : (
              <div className="space-y-4">
                {therapists.map((t, i) => (
                  <div key={t.staffId}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-[#4A4A4A]">
                        <span className="text-[#8D8E8F] mr-2">{i + 1}.</span>
                        {t.name}
                      </span>
                      <span className="text-[#8D8E8F]">{t.count} treatments · R {t.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-[#EBEBEC]">
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.round((t.count / maxTherapistCount) * 100)}%`,
                          background: "#000",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
