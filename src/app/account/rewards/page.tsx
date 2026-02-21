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

  const typeLabel: Record<string, string> = {
    earned: "Earned",
    redeemed: "Redeemed",
    birthday: "🎂 Birthday Bonus",
    rebooking_bonus: "🔁 Rebooking Bonus",
    referral: "👥 Referral",
    milestone: "🏆 Milestone",
    expired: "Expired",
    refunded: "Refunded",
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center gap-4">
        <Link href="/" className="text-2xl font-bold text-teal-600">LoyalBook</Link>
        <span className="text-slate-400">/</span>
        <Link href="/account" className="text-slate-600 hover:text-teal-600">Account</Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-600">Rewards</span>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-gradient-to-r from-teal-500 to-teal-700 rounded-2xl p-8 text-white mb-8">
          <div className="text-sm opacity-80 mb-1">Current Balance</div>
          <div className="text-5xl font-bold">{account?.balance ?? 0} pts</div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-4">Points History</h2>
        <div className="space-y-2">
          {account?.transactions.map((tx) => (
            <div key={tx.id} className="bg-white rounded-xl border border-slate-200 p-4 flex justify-between items-center">
              <div>
                <div className="font-medium text-slate-800">{typeLabel[tx.type] ?? tx.type}</div>
                <div className="text-sm text-slate-400">{tx.description}</div>
                <div className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleDateString("en-ZA")}</div>
              </div>
              <div className={`font-bold text-lg ${tx.amount > 0 ? "text-teal-600" : "text-red-500"}`}>
                {tx.amount > 0 ? "+" : ""}{tx.amount}
              </div>
            </div>
          ))}
          {(!account?.transactions || account.transactions.length === 0) && (
            <div className="text-center text-slate-400 py-8">No points activity yet. Book an appointment to start earning!</div>
          )}
        </div>
      </div>
    </main>
  );
}
