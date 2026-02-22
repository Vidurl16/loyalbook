"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { redirect } from "next/navigation";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const CATEGORY_ICONS: Record<string, string> = {
  Nails: "💅",
  Facials: "🧖‍♀️",
  Peels: "✨",
  Massage: "💆",
  "Body Treatments": "🌿",
  "Brows & Lashes": "👁️",
  Waxing: "🪷",
};

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  pending:              { label: "Awaiting Confirmation", classes: "bg-amber-50 text-amber-700 border border-amber-200" },
  confirmed:            { label: "Confirmed",             classes: "bg-green-50 text-green-700 border border-green-200" },
  completed:            { label: "Completed",             classes: "bg-stone-100 text-stone-500" },
  no_show:              { label: "No Show",               classes: "bg-red-50 text-red-500" },
  cancelled_by_client:  { label: "Cancelled",             classes: "bg-red-50 text-red-400" },
  cancelled_by_spa:     { label: "Cancelled",             classes: "bg-red-50 text-red-400" },
};

function getTier(pts: number) {
  if (pts >= 15000) return { name: "Platinum", icon: "💎", color: "tier-platinum", next: null, nextAt: null };
  if (pts >= 5000) return { name: "Gold", icon: "🥇", color: "tier-gold", next: "Platinum", nextAt: 15000 };
  if (pts >= 1000) return { name: "Silver", icon: "🥈", color: "tier-silver", next: "Gold", nextAt: 5000 };
  return { name: "Bronze", icon: "🥉", color: "tier-bronze", next: "Silver", nextAt: 1000 };
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login");

  const userId = (session?.user as any)?.id;
  const { data: client } = trpc.clients.get.useQuery(
    { id: userId },
    { enabled: !!userId }
  );

  const lifetime = client?.loyaltyAccount?.lifetimeEarned ?? 0;
  const balance = client?.loyaltyAccount?.balance ?? 0;
  const tier = getTier(lifetime);

  const upcoming = client?.appointments?.filter((a) =>
    new Date(a.startAt) >= new Date() && ["pending", "confirmed"].includes(a.status)
  );
  const past = client?.appointments?.filter((a) =>
    new Date(a.startAt) < new Date() || a.status === "completed"
  ).slice(0, 5);

  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <nav className="bg-white border-b border-stone-100 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <Link href="/" className="font-display text-xl font-bold text-teal-700">Perfect 10</Link>
        <div className="flex items-center gap-4">
          <Link href="/book" className="bg-teal-700 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-teal-800 transition-colors">
            + Book Treatment
          </Link>
          <span className="text-stone-500 text-sm">{session?.user?.name}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Points & tier card */}
        <div className="bg-stone-900 rounded-2xl p-8 text-white relative overflow-hidden">
          {/* Subtle decorative ring */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full border border-white/5 pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-medium opacity-60 mb-1 tracking-wide uppercase text-xs">Points Balance</div>
              <div className="text-5xl font-bold mb-1">{balance.toLocaleString()}</div>
              <div className="text-sm opacity-50">Lifetime earned: {lifetime.toLocaleString()} pts</div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${tier.color}`}>
              {tier.icon} {tier.name}
            </span>
          </div>

          {/* Tier progress */}
          {tier.next && tier.nextAt && (
            <div className="mt-6">
              <div className="flex justify-between text-xs mb-1.5 opacity-70">
                <span>{tier.name}</span>
                <span>{tier.next} at {tier.nextAt.toLocaleString()} pts</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/70 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (lifetime / tier.nextAt) * 100).toFixed(1)}%` }}
                />
              </div>
              <div className="text-xs opacity-60 mt-1.5">{Math.max(0, tier.nextAt - lifetime).toLocaleString()} pts to {tier.next}</div>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Link href="/account/rewards" className="inline-block bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors">
              Points History →
            </Link>
            <Link href="/book" className="inline-block text-stone-900 text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-colors font-medium" style={{ background: "var(--accent-gold)" }}>
              Book & Earn ✨
            </Link>
          </div>
        </div>

        {/* Upcoming appointments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-stone-900">Upcoming Treatments</h2>
            <Link href="/book" className="text-sm text-teal-600 hover:underline">+ Book new</Link>
          </div>
          {!upcoming || upcoming.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 p-8 text-center">
              <div className="text-3xl mb-3">🌸</div>
              <div className="text-stone-500 mb-3">No upcoming treatments scheduled.</div>
              <Link href="/book" className="inline-block bg-teal-700 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-teal-800 transition-colors">
                Book Now →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <div key={apt.id} className="bg-white rounded-2xl border border-stone-100 p-5 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl">
                      {CATEGORY_ICONS[apt.service.category] ?? "✨"}
                    </div>
                    <div>
                      <div className="font-semibold text-stone-800">{apt.service.name}</div>
                      <div className="text-sm text-stone-400">
                        {apt.staff ? `with ${apt.staff.user.name} · ` : ""}{new Date(apt.startAt).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" })} at {new Date(apt.startAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      (STATUS_LABELS[apt.status] ?? { classes: "bg-stone-100 text-stone-500" }).classes
                    }`}>
                      {(STATUS_LABELS[apt.status] ?? { label: apt.status }).label}
                    </span>
                    <span className="text-xs text-stone-400">R{apt.service.price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past treatments */}
        {past && past.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900 mb-4">Recent Treatments</h2>
            <div className="space-y-2">
              {past.map((apt) => (
                <div key={apt.id} className="bg-white rounded-xl border border-stone-100 px-5 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{CATEGORY_ICONS[apt.service.category] ?? "✨"}</span>
                    <div>
                      <div className="font-medium text-stone-700 text-sm">{apt.service.name}</div>
                      <div className="text-xs text-stone-400">{new Date(apt.startAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/book?category=${encodeURIComponent(apt.service.category)}`}
                      className="text-xs text-teal-600 hover:underline"
                    >
                      Rebook →
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      (STATUS_LABELS[apt.status] ?? { classes: "bg-stone-100 text-stone-500" }).classes
                    }`}>
                      {(STATUS_LABELS[apt.status] ?? { label: apt.status }).label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
