"use client";

import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import Image from "next/image";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

export default function RewardsPage() {
  const { data: session } = useSession();
  const userId = (session?.user as any)?.id;
  const { data: account } = trpc.loyalty.getAccount.useQuery(
    { clientId: userId },
    { enabled: !!userId }
  );
  const { data: config } = trpc.loyalty.getConfig.useQuery(
    { spaId: SPA_ID },
    { enabled: !!SPA_ID }
  );

  const lifetime = account?.lifetimeEarned ?? 0;
  const balance = account?.balance ?? 0;
  const minRedeem = config?.minRedeem ?? 500;
  const redemptionRate = config?.redemptionRate ?? 100;
  // e.g. 500 pts / 100 per R10 * 10 = R50
  const pointsValueRands = (balance / redemptionRate) * 10;
  const canRedeem = balance >= minRedeem;

  const TIERS = [
    { name: "Bronze", icon: "🥉", min: 0, max: 999, color: "tier-bronze", perk: "Earn 10 pts / R100" },
    { name: "Silver", icon: "🥈", min: 1000, max: 4999, color: "tier-silver", perk: "Priority booking" },
    { name: "Gold", icon: "🥇", min: 5000, max: 14999, color: "tier-gold", perk: "Free add-on treatment" },
    { name: "Platinum", icon: "💎", min: 15000, max: Infinity, color: "tier-platinum", perk: "VIP concierge & gifts" },
  ];
  const currentTier = TIERS.findLast((t) => lifetime >= t.min) ?? TIERS[0];
  const nextTier = TIERS[TIERS.indexOf(currentTier) + 1];

  const TX_META: Record<string, { label: string; icon: string }> = {
    earned:          { label: "Treatment Reward",    icon: "✨" },
    redeemed:        { label: "Points Redeemed",     icon: "🛍️" },
    birthday:        { label: "Birthday Bonus",      icon: "🎂" },
    rebooking_bonus: { label: "Rebooking Bonus",     icon: "🔁" },
    referral:        { label: "Referral Reward",     icon: "👥" },
    milestone:       { label: "Admin Adjustment",    icon: "🏆" },
    expired:         { label: "Points Adjustment",   icon: "⚙️" },
    refunded:        { label: "Points Refunded",     icon: "↩️" },
  };

  return (
    <main className="min-h-screen" style={{ background: "var(--background)" }}>
      <nav className="bg-white border-b border-stone-100 px-6 py-4 flex items-center gap-3 sticky top-0 z-40">
        <Link href="/">
          <Image src="/brand/perfect10-logo.png" alt="Perfect 10" width={120} height={28} className="h-7 w-auto" />
        </Link>
        <span className="text-stone-300">/</span>
        <Link href="/account" className="text-stone-500 text-sm hover:text-teal-700">Account</Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-600 text-sm">Rewards</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {/* Balance card */}
        <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(196,168,130,0.2)_0%,_transparent_60%)] pointer-events-none" />
          <div className="absolute top-4 right-6 text-6xl opacity-10">{currentTier.icon}</div>

          <div className="relative">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-xs tracking-widest text-stone-400 uppercase mb-2">Available Balance</div>
                <div className="text-5xl font-bold" style={{ color: "var(--accent-gold)" }}>
                  {balance.toLocaleString()}
                  <span className="text-xl font-normal text-stone-400 ml-2">pts</span>
                </div>
                <div className="text-xs text-stone-500 mt-1.5">Lifetime earned: {lifetime.toLocaleString()} pts</div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${currentTier.color}`}>
                {currentTier.icon} {currentTier.name}
              </span>
            </div>

            {/* Tier progress */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex justify-between text-xs text-stone-400 mb-2">
                <span>{currentTier.name}</span>
                {nextTier && <span>{nextTier.min.toLocaleString()} pts → {nextTier.name}</span>}
                {!nextTier && <span>✨ Maximum tier</span>}
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: nextTier ? `${Math.min(100, ((lifetime - currentTier.min) / (nextTier.min - currentTier.min)) * 100).toFixed(1)}%` : "100%",
                    background: "linear-gradient(90deg, var(--accent-gold), #e8c99a)",
                  }}
                />
              </div>
              {nextTier && (
                <div className="text-xs text-stone-500 mt-1.5">{Math.max(0, nextTier.min - lifetime).toLocaleString()} pts to {nextTier.name}</div>
              )}
            </div>
          </div>
        </div>

        {/* Redeem points card */}
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <div className="px-6 pt-6 pb-5">
            <h2 className="font-display text-xl font-bold text-stone-900 mb-1">Redeem Your Points</h2>
            <p className="text-stone-400 text-sm">Use your points as a discount when booking your next treatment.</p>
          </div>

          {canRedeem ? (
            <div className="px-6 pb-6 space-y-4">
              {/* Points voucher visual */}
              <div className="relative rounded-xl overflow-hidden border border-dashed border-stone-200 bg-gradient-to-r from-stone-50 to-white">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl" style={{ background: "var(--accent-gold)" }} />
                <div className="pl-8 pr-6 py-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs tracking-widest text-stone-400 uppercase mb-1">Your points are worth</div>
                    <div className="text-3xl font-bold text-stone-900">R{pointsValueRands.toFixed(0)}</div>
                    <div className="text-xs text-stone-400 mt-0.5">{balance.toLocaleString()} pts · redeemable at checkout</div>
                  </div>
                  <div className="text-5xl opacity-20">🎫</div>
                </div>
                {/* Ticket perforations */}
                <div className="absolute left-6 -top-3 w-6 h-6 rounded-full bg-stone-100 border border-stone-200" />
                <div className="absolute left-6 -bottom-3 w-6 h-6 rounded-full bg-stone-100 border border-stone-200" />
              </div>

              <div className="bg-teal-50 rounded-xl p-4 text-sm text-teal-800 border border-teal-100">
                <strong>How it works:</strong> In step 4 of the booking process, use the points slider to apply your balance as a discount. Every {redemptionRate} pts = R10 off.
              </div>

              <Link
                href="/book"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-stone-900 text-sm transition-opacity hover:opacity-90 shadow-sm"
                style={{ background: "var(--accent-gold)" }}
              >
                Book & Redeem Points →
              </Link>
            </div>
          ) : (
            <div className="px-6 pb-6">
              <div className="bg-stone-50 rounded-xl p-5 text-center">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-semibold text-stone-700 mb-1">
                  {minRedeem - balance} pts to go
                </div>
                <p className="text-stone-400 text-sm">
                  You need <strong>{minRedeem.toLocaleString()} pts</strong> to start redeeming. Keep earning — you're {Math.round((balance / minRedeem) * 100)}% there!
                </p>
                <Link href="/book" className="inline-block mt-4 bg-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
                  Book a treatment to earn
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Tier guide */}
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h3 className="font-semibold text-stone-800 mb-4">Loyalty Tiers & Perks</h3>
          <div className="grid grid-cols-2 gap-2">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className={`rounded-xl p-4 ${t.name === currentTier.name ? "ring-2 ring-offset-1 ring-teal-500" : ""} ${t.color}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{t.icon}</span>
                  <span className="font-bold text-sm">{t.name}</span>
                </div>
                <div className="text-xs opacity-70 mb-1.5">
                  {t.max === Infinity ? `${t.min.toLocaleString()}+` : `${t.min.toLocaleString()}–${t.max.toLocaleString()}`} pts
                </div>
                <div className="text-xs font-medium opacity-80">{t.perk}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Earn more */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "✨", label: "Book a treatment", desc: "Earn 10 pts / R100", href: "/book" },
            { icon: "🎂", label: "Birthday bonus", desc: "+200 pts your birth month", href: "/account" },
            { icon: "🔁", label: "Rebook & earn", desc: "+50 pts if within 8 weeks", href: "/book" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="bg-white rounded-xl border border-stone-100 p-4 hover:border-teal-300 hover:shadow-sm transition-all">
              <div className="text-2xl mb-1.5">{item.icon}</div>
              <div className="text-xs text-stone-700 font-semibold mb-0.5">{item.label}</div>
              <div className="text-xs text-stone-400">{item.desc}</div>
            </Link>
          ))}
        </div>

        {/* Transaction history */}
        <div>
          <h2 className="font-display text-xl font-bold text-stone-900 mb-4">Points History</h2>
          <div className="space-y-2">
            {account?.transactions.map((tx) => {
              const meta = TX_META[tx.type] ?? { label: tx.type, icon: "•" };
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
                    {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
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

