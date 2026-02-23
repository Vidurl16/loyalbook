"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  no_show: "bg-red-100 text-red-500",
  cancelled_by_client: "bg-rose-100 text-rose-500",
  cancelled_by_spa: "bg-rose-100 text-rose-500",
};

const CATEGORY_ICONS: Record<string, string> = {
  Facials: "🧖‍♀️",
  Peels: "✨",
  Massage: "💆",
  "Body Treatments": "🌿",
  "Brows & Lashes": "👁️",
  Waxing: "🪷",
  Nails: "💅",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const today = new Date().toISOString().split("T")[0];
  const { data: todayAppts, refetch } = trpc.appointments.list.useQuery({ spaId: SPA_ID, date: today });
  const { data: revenue } = trpc.analytics.revenue.useQuery({ spaId: SPA_ID, period: "month" });
  const { data: birthdays } = trpc.clients.upcomingBirthdays.useQuery({ spaId: SPA_ID });
  const { data: economy } = trpc.analytics.pointsEconomy.useQuery({ spaId: SPA_ID });

  const updateStatus = trpc.appointments.updateStatus.useMutation({ onSuccess: () => refetch() });

  const completedToday = todayAppts?.filter((a) => a.status === "completed").length ?? 0;
  const remainingToday = (todayAppts?.length ?? 0) - completedToday;

  return (
    <div className="min-h-screen flex bg-[#EBEBEC]">
      <DashboardSidebar />

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black" style={{ fontFamily: "Didot, Georgia, serif" }}>
              Good morning, {session?.user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-[#8D8E8F] text-sm mt-1">
              {new Date().toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <Link href="/dashboard/analytics" className="text-sm font-semibold text-white px-5 py-2 hover:opacity-90 transition-opacity" style={{ background: "#C9262E", borderRadius: 2 }}>
            View Analytics →
          </Link>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Treatments Today", value: todayAppts?.length ?? 0, sub: `${completedToday} completed · ${remainingToday} remaining`, icon: "🧖‍♀️" },
            { label: "Revenue This Month", value: `R${(revenue?.total ?? 0).toFixed(0)}`, sub: "From completed treatments", icon: "💰" },
            { label: "Points Issued", value: (economy?.totalIssued ?? 0).toLocaleString(), sub: "All time", icon: "✨" },
            { label: "Points Outstanding", value: (economy?.totalOutstanding ?? 0).toLocaleString(), sub: "Member balances", icon: "🏅" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white border border-[#D1D2D4] p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs text-[#8D8E8F] font-semibold uppercase tracking-widest">{stat.label}</span>
                <span className="text-lg">{stat.icon}</span>
              </div>
              <div className="text-3xl font-bold text-black mb-1">{stat.value}</div>
              <div className="text-xs text-[#8D8E8F]">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Today's schedule + birthdays */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#D1D2D4] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-black">Today&apos;s Treatments</h2>
              <span className="text-xs text-[#8D8E8F]">{todayAppts?.length ?? 0} scheduled</span>
            </div>
            {!todayAppts || todayAppts.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-3xl mb-2">🌸</div>
                <p className="text-[#8D8E8F] text-sm">No treatments scheduled for today.</p>
                <Link href="/book" className="inline-block mt-3 text-sm hover:underline" style={{ color: "#C9262E" }}>+ Add booking</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {todayAppts.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between py-3 border-b border-[#EBEBEC] last:border-0 gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{CATEGORY_ICONS[apt.service?.category] ?? "✨"}</span>
                      <div className="min-w-0">
                        <div className="font-medium text-black text-sm truncate">{apt.client?.name}</div>
                        <div className="text-xs text-[#8D8E8F] truncate">{apt.service?.name} · {apt.staff?.user?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[#8D8E8F]">
                        {new Date(apt.startAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[apt.status] ?? "bg-stone-100 text-stone-500"}`}>
                        {apt.status.replace(/_/g, " ")}
                      </span>
                      {apt.status === "confirmed" && (
                        <button
                          onClick={() => updateStatus.mutate({ id: apt.id, status: "completed" })}
                          className="text-xs text-white px-2 py-0.5 hover:opacity-80 transition-opacity"
                          style={{ background: "#C9262E", borderRadius: 2 }}
                        >
                          ✓ Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming birthdays */}
          <div className="bg-white border border-[#D1D2D4] p-6">
            <h2 className="font-semibold text-black mb-5">🎂 Upcoming Birthdays</h2>
            {!birthdays || birthdays.length === 0 ? (
              <p className="text-[#8D8E8F] text-sm">No birthdays in the next 30 days.</p>
            ) : (
              <div className="space-y-3">
                {birthdays.slice(0, 6).map((c) => (
                  <div key={c.id} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-black text-sm">{c.name}</div>
                      <div className="text-xs text-[#8D8E8F]">
                        {c.dob ? new Date(c.dob).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }) : ""}
                      </div>
                    </div>
                    <Link href="/dashboard/clients" className="text-xs font-semibold hover:underline" style={{ color: "#C9262E" }}>Send bonus</Link>
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
