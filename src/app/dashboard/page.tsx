"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

export default function DashboardPage() {
  const { data: session } = useSession();
  const today = new Date().toISOString().split("T")[0];
  const { data: todayAppts } = trpc.appointments.list.useQuery({ spaId: SPA_ID, date: today });
  const { data: revenue } = trpc.analytics.revenue.useQuery({ spaId: SPA_ID, period: "month" });
  const { data: birthdays } = trpc.clients.upcomingBirthdays.useQuery({ spaId: SPA_ID });
  const { data: economy } = trpc.analytics.pointsEconomy.useQuery({ spaId: SPA_ID });

  const navItems = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/calendar", label: "Calendar" },
    { href: "/dashboard/clients", label: "Clients" },
    { href: "/dashboard/services", label: "Services" },
    { href: "/dashboard/staff", label: "Staff" },
    { href: "/dashboard/loyalty", label: "Loyalty" },
    { href: "/dashboard/analytics", label: "Analytics" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-200 p-6 flex flex-col gap-1 shrink-0">
        <Link href="/" className="text-xl font-bold text-teal-600 mb-6 block">LoyalBook</Link>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg px-3 py-2 text-sm transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-8">
          Good morning, {session?.user?.name?.split(" ")[0]} 👋
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Today's Appointments", value: todayAppts?.length ?? 0, color: "teal" },
            { label: "Revenue This Month", value: `R${(revenue?.total ?? 0).toFixed(0)}`, color: "teal" },
            { label: "Points Issued (Total)", value: economy?.totalIssued ?? 0, color: "amber" },
            { label: "Points Outstanding", value: economy?.totalOutstanding ?? 0, color: "slate" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="text-sm text-slate-500 mb-2">{stat.label}</div>
              <div className="text-3xl font-bold text-slate-800">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Today's schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Today's Schedule</h2>
            {todayAppts?.length === 0 ? (
              <p className="text-slate-400">No appointments today.</p>
            ) : (
              <div className="space-y-3">
                {todayAppts?.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <div>
                      <div className="font-medium text-slate-800">{apt.client?.name}</div>
                      <div className="text-sm text-slate-500">{apt.service?.name} · {apt.staff?.user?.name}</div>
                    </div>
                    <div className="text-sm text-slate-500">{new Date(apt.startAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming birthdays */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">🎂 Upcoming Birthdays</h2>
            {birthdays?.length === 0 ? (
              <p className="text-slate-400 text-sm">No birthdays in the next 30 days.</p>
            ) : (
              <div className="space-y-3">
                {birthdays?.slice(0, 5).map((c) => (
                  <div key={c.id} className="flex justify-between items-center">
                    <div className="font-medium text-slate-700 text-sm">{c.name}</div>
                    <div className="text-xs text-slate-400">
                      {c.dob ? new Date(c.dob).toLocaleDateString("en-ZA", { day: "numeric", month: "short" }) : ""}
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
