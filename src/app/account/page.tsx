"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { redirect } from "next/navigation";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

export default function AccountPage() {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login");

  const userId = (session?.user as any)?.id;
  const { data: client } = trpc.clients.get.useQuery(
    { id: userId },
    { enabled: !!userId }
  );

  const upcoming = client?.appointments?.filter((a) =>
    new Date(a.startAt) >= new Date() && ["pending", "confirmed"].includes(a.status)
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-teal-600">LoyalBook</Link>
        <span className="text-slate-600">{session?.user?.name}</span>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Points balance card */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-8 text-white">
          <div className="text-sm font-medium opacity-80 mb-1">Your Points Balance</div>
          <div className="text-5xl font-bold mb-2">{client?.loyaltyAccount?.balance ?? 0}</div>
          <div className="text-sm opacity-70">Lifetime earned: {client?.loyaltyAccount?.lifetimeEarned ?? 0} pts</div>
          <Link href="/account/rewards" className="inline-block mt-4 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg transition-colors">
            View Rewards →
          </Link>
        </div>

        {/* Upcoming appointments */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">Upcoming Appointments</h2>
          {upcoming?.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-slate-400">
              No upcoming appointments.{" "}
              <Link href="/book" className="text-teal-600 hover:underline">Book now →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming?.map((apt) => (
                <div key={apt.id} className="bg-white rounded-xl border border-slate-200 p-5 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-slate-800">{apt.service.name}</div>
                    <div className="text-sm text-slate-500">
                      with {apt.staff.user.name} · {new Date(apt.startAt).toLocaleString("en-ZA")}
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    apt.status === "confirmed" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
