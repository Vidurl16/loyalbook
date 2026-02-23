"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#8D8E8F" },
  confirmed: { label: "Confirmed", color: "#2563eb" },
  completed: { label: "Completed", color: "#16a34a" },
  no_show: { label: "No Show", color: "#dc2626" },
  cancelled_by_client: { label: "Cancelled", color: "#C9262E" },
  cancelled_by_spa: { label: "Cancelled (Spa)", color: "#C9262E" },
};

type Period = "day" | "week" | "month" | "year";

export default function TherapistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const staffId = params.id as string;
  const [period, setPeriod] = useState<Period>("month");

  const { data, isLoading } = trpc.analytics.therapistDetail.useQuery({
    spaId: SPA_ID,
    staffId,
    period,
  });

  const periodLabel = { day: "Today", week: "This Week", month: "This Month", year: "This Year" };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#EBEBEC]">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center text-[#8D8E8F]">Loading therapist data…</main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen bg-[#EBEBEC]">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center text-[#8D8E8F]">Therapist not found.</main>
      </div>
    );
  }

  const completionRate = data.totalBookings > 0
    ? Math.round((data.completedBookings / data.totalBookings) * 100)
    : 0;

  return (
    <div className="flex min-h-screen bg-[#EBEBEC]">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <button
              onClick={() => router.push("/dashboard/staff")}
              className="text-sm text-[#8D8E8F] hover:text-black mt-1"
            >
              ← Back
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 flex items-center justify-center text-white text-xl font-semibold"
                  style={{ background: "#C9262E" }}
                >
                  {data.staff?.user?.name?.charAt(0) ?? "?"}
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-black tracking-wide">
                    {data.staff?.user?.name ?? "Therapist"}
                  </h1>
                  <p className="text-sm text-[#8D8E8F]">{data.staff?.user?.email}</p>
                </div>
              </div>
            </div>
            {/* Period selector */}
            <div className="flex border border-[#D1D2D4] overflow-hidden">
              {(["day", "week", "month", "year"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 text-xs font-medium transition-colors"
                  style={{
                    background: period === p ? "#000" : "#fff",
                    color: period === p ? "#fff" : "#8D8E8F",
                  }}
                >
                  {periodLabel[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
            <div className="bg-white border border-[#D1D2D4] p-5">
              <div className="text-xs text-[#8D8E8F] uppercase tracking-wider mb-1">Revenue</div>
              <div className="text-2xl font-semibold text-black">R{data.revenue.toLocaleString()}</div>
              <div className="text-xs text-[#8D8E8F] mt-1">{periodLabel[period]}</div>
            </div>
            <div className="bg-white border border-[#D1D2D4] p-5">
              <div className="text-xs text-[#8D8E8F] uppercase tracking-wider mb-1">Bookings</div>
              <div className="text-2xl font-semibold text-black">{data.totalBookings}</div>
              <div className="text-xs text-[#8D8E8F] mt-1">{data.completedBookings} completed</div>
            </div>
            <div className="bg-white border border-[#D1D2D4] p-5">
              <div className="text-xs text-[#8D8E8F] uppercase tracking-wider mb-1">Completion Rate</div>
              <div className="text-2xl font-semibold text-black">{completionRate}%</div>
              <div className="text-xs text-[#8D8E8F] mt-1">of all bookings</div>
            </div>
            <div className="bg-white border border-[#D1D2D4] p-5">
              <div className="text-xs text-[#8D8E8F] uppercase tracking-wider mb-1">Avg per Service</div>
              <div className="text-2xl font-semibold text-black">
                R{data.completedBookings > 0 ? Math.round(data.revenue / data.completedBookings).toLocaleString() : 0}
              </div>
              <div className="text-xs text-[#8D8E8F] mt-1">per completed booking</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
            {/* Booking status breakdown */}
            <div className="bg-white border border-[#D1D2D4] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8D8E8F] mb-4">Booking Breakdown</h2>
              {Object.keys(data.statusCount).length === 0 ? (
                <p className="text-sm text-[#8D8E8F]">No bookings in this period.</p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(data.statusCount).map(([status, count]) => {
                    const s = STATUS_LABELS[status] ?? { label: status, color: "#8D8E8F" };
                    const pct = Math.round((count / data.totalBookings) * 100);
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-black">{s.label}</span>
                          <span className="text-[#8D8E8F]">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-[#EBEBEC] w-full">
                          <div className="h-1.5" style={{ width: `${pct}%`, background: s.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top services */}
            <div className="bg-white border border-[#D1D2D4] p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8D8E8F] mb-4">Top Services</h2>
              {data.topServices.length === 0 ? (
                <p className="text-sm text-[#8D8E8F]">No completed services in this period.</p>
              ) : (
                <div className="space-y-3">
                  {data.topServices.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-black font-medium">{s.name}</div>
                        <div className="text-xs text-[#8D8E8F]">R{s.revenue.toLocaleString()} earned</div>
                      </div>
                      <span
                        className="text-xs text-white px-2 py-0.5 font-semibold"
                        style={{ background: "#C9262E" }}
                      >
                        ×{s.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent appointments */}
          <div className="bg-white border border-[#D1D2D4]">
            <div className="px-5 py-4 border-b border-[#D1D2D4]">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8D8E8F]">Recent Appointments</h2>
            </div>
            {data.recentAppointments.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-[#8D8E8F]">No appointments in this period.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D1D2D4] bg-[#EBEBEC]/60">
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Guest</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Treatment</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Value</th>
                    <th className="text-left px-5 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentAppointments.map((apt) => {
                    const s = STATUS_LABELS[apt.status] ?? { label: apt.status, color: "#8D8E8F" };
                    return (
                      <tr key={apt.id} className="border-b border-[#D1D2D4] last:border-0">
                        <td className="px-5 py-3 text-xs font-mono text-[#4A4A4A]">
                          {new Date(apt.startAt).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })}{" "}
                          {new Date(apt.startAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-5 py-3 text-black">{apt.client?.name ?? "—"}</td>
                        <td className="px-5 py-3 text-black">{apt.service?.name}</td>
                        <td className="px-5 py-3 text-black font-medium">R{apt.service?.price?.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span
                            className="inline-block px-2 py-0.5 text-xs font-medium text-white"
                            style={{ background: s.color }}
                          >
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
