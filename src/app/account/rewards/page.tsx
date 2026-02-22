"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

export default function RewardsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const { data: account } = trpc.loyalty.getAccount.useQuery(
    { clientId: userId },
    { enabled: !!userId }
  );

  const lifetime = account?.lifetimeEarned ?? 0;
  const balance = account?.balance ?? 0;

  const TIERS = [
    { name: "Bronze", icon: "🥉", min: 0, max: 999, color: "tier-bronze" },
    { name: "Silver", icon: "🥈", min: 1000, max: 4999, color: "tier-silver" },
    { name: "Gold", icon: "🥇", min: 5000, max: 14999, color: "tier-gold" },
    { name: "Platinum", icon: "💎", min: 15000, max: Infinity, color: "tier-platinum" },
  ];
  const currentTier = TIERS.findLast((t) => lifetime >= t.min) ?? TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];

  const TX_META: Record<string, { label: string; icon: string; sign: "+" | "-" }> = {
    earned:          { label: "Treatment Reward",    icon: "✨", sign: "+" },
    redeemed:        { label: "Points Redeemed",     icon: "🛍️", sign: "-" },
    birthday:        { label: "Birthday Bonus",      icon: "🎂", sign: "+" },
    rebooking_bonus: { label: "Rebooking Bonus",     icon: "🔁", sign: "+" },
    referral:        { label: "Referral Reward",     icon: "👥", sign: "+" },
    milestone:       { label: "Milestone Reward",    icon: "🏆", sign: "+" },
    expired:         { label: "Points Expired",      icon: "⏰", sign: "-" },
    refunded:        { label: "Points Refunded",     icon: "↩️", sign: "+" },
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <nav className="bg-white border-b border-stone-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/" className="font-display text-xl font-bold text-teal-700">LoyalBook</Link>
        <span className="text-stone-300">/</span>
        <Link href="/account" className="text-stone-500 text-sm hover:text-teal-700">Account</Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-600 text-sm">Rewards</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Balance card */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-4 right-6 text-5xl opacity-10">{currentTier.icon}</div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="text-sm opacity-70 mb-1">Available Balance</div>
              <div className="text-5xl font-bold">{balance.toLocaleString()} <span className="text-2xl font-normal opacity-70">pts</span></div>
              <div className="text-sm opacity-60 mt-1">Lifetime earned: {lifetime.toLocaleString()} pts</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${currentTier.color}`}>
              {currentTier.icon} {currentTier.name}
            </span>
          </div>

          {/* Tier progress */}
          <div className="bg-white/10 rounded-xl p-4 mt-2">
            <div className="flex justify-between text-xs opacity-70 mb-2">
              <span>{currentTier.name} {currentTier.min.toLocaleString()}+</span>
              {nextTier && <span>{nextTier.name} at {nextTier.min.toLocaleString()} pts</span>}
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-white/60 to-white rounded-full transition-all"
                style={{ width: nextTier ? `${Math.min(100, ((lifetime - currentTier.min) / (nextTier.min - currentTier.min)) * 100).toFixed(1)}%` : "100%" }}
              />
            </div>
            {nextTier && (
              <div className="text-xs opacity-60 mt-1.5 text-right">{Math.max(0, nextTier.min - lifetime).toLocaleString()} pts to {nextTier.name}</div>
            )}
            {!nextTier && (
              <div className="text-xs opacity-60 mt-1.5 text-center">✨ Maximum tier achieved</div>
            )}
          </div>
        </div>

        {/* Tier guide */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h3 className="font-semibold text-stone-800 mb-4">Loyalty Tiers</h3>
          <div className="grid grid-cols-4 gap-2">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`rounded-xl p-3 text-center ${t.name === currentTier.name ? "ring-2 ring-teal-500" : ""} ${t.color}`}
              >
                <div className="text-xl mb-0.5">{t.icon}</div>
                <div className="font-bold text-xs">{t.name}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {t.max === Infinity ? `${t.min.toLocaleString()}+` : `${t.min.toLocaleString()}–${t.max.toLocaleString()}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earn more */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "✨", label: "Book a treatment", href: "/book" },
            { icon: "🎂", label: "Birthday bonus", href: "/account" },
            { icon: "🔁", label: "Rebook & earn", href: "/book" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="bg-white rounded-xl border border-stone-100 p-4 text-center hover:border-teal-300 hover:shadow-sm transition-all">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs text-stone-600 font-medium">{item.label}</div>
            </Link>
          ))}
        </div>

        {/* Transaction history */}
        <div>
          <h2 className="font-display text-xl font-bold text-stone-900 mb-4">Points History</h2>
          <div className="space-y-2">
            {account?.transactions.map((tx) => {
              const meta = TX_META[tx.type] ?? { label: tx.type, icon: "•", sign: tx.amount > 0 ? "+" : "-" };
              return (
                <div key={tx.id} className="bg-white rounded-xl border border-stone-100 px-5 py-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-xl">
                      {meta.icon}
                    </div>
                    <div>
                      <div className="font-medium text-stone-800 text-sm">{meta.label}</div>
                      {tx.description && <div className="text-xs text-stone-400">{tx.description}</div>}
                      <div className="text-xs text-stone-300">{new Date(tx.createdAt).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</div>
                    </div>
                  </div>
                  <div className={`font-bold text-base ${tx.amount > 0 ? "text-teal-600" : "text-rose-500"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                  </div>
                </div>
              );
            })}
            {(!account?.transactions || account.transactions.length === 0) && (
              <div className="text-center text-stone-400 py-12">
                <div className="text-3xl mb-3">🌿</div>
                <div className="text-sm">No points activity yet.</div>
                <Link href="/book" className="inline-block mt-3 text-teal-600 text-sm hover:underline">Book your first treatment →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
