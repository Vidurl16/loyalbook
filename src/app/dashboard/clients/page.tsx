"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

function getTier(pts: number) {
  if (pts >= 15000) return { name: "Platinum", icon: "💎", color: "tier-platinum" };
  if (pts >= 5000)  return { name: "Gold",     icon: "🥇", color: "tier-gold" };
  if (pts >= 1000)  return { name: "Silver",   icon: "🥈", color: "tier-silver" };
  return                   { name: "Bronze",   icon: "🥉", color: "tier-bronze" };
}

type Client = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  _count: { appointments: number };
  loyaltyAccount: { balance: number; lifetimeEarned: number } | null;
};

function AdjustPointsModal({ client, onClose }: { client: Client; onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState<"add" | "remove" | "redeem">("add");
  const utils = trpc.useUtils();

  const adjust = trpc.loyalty.adjustPoints.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); onClose(); },
  });

  const redeem = trpc.loyalty.adminRedeem.useMutation({
    onSuccess: () => { utils.clients.list.invalidate(); onClose(); },
  });

  const pts = parseInt(amount) || 0;
  const randValue = Math.floor(pts / 100) * 10;
  const balance = client.loyaltyAccount?.balance ?? 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pts || pts <= 0) return;
    if (mode === "redeem") {
      redeem.mutate({ clientId: client.id, points: pts, reason: reason || "Redeemed in salon by admin" });
    } else {
      if (!reason.trim()) return;
      adjust.mutate({ clientId: client.id, amount: mode === "add" ? pts : -pts, reason });
    }
  }

  const isPending = adjust.isPending || redeem.isPending;
  const error = adjust.error || redeem.error;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white shadow-xl w-full max-w-md p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-black">Manage Points</h2>
            <p className="text-[#8D8E8F] text-sm mt-0.5">{client.name} · {balance.toLocaleString()} pts balance</p>
          </div>
          <button onClick={onClose} className="text-[#8D8E8F] hover:text-black text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex border border-[#D1D2D4] overflow-hidden">
            {(["add", "remove", "redeem"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                style={mode === m
                  ? { background: m === "add" ? "#000" : m === "remove" ? "#C9262E" : "#6d28d9", color: "#fff" }
                  : { background: "#fff", color: "#4A4A4A" }}
              >
                {m === "add" ? "➕ Add" : m === "remove" ? "➖ Remove" : "🎁 Redeem"}
              </button>
            ))}
          </div>

          {mode === "redeem" && (
            <div className="bg-[#EBEBEC] border border-[#D1D2D4] p-3 text-sm text-[#4A4A4A]">
              100 pts = R10 value · Available: {balance.toLocaleString()} pts (R{Math.floor(balance / 100) * 10} max)
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8D8E8F] uppercase tracking-wide mb-1.5">Points Amount</label>
            <input
              type="number"
              min={1}
              max={mode !== "add" ? balance : undefined}
              placeholder="e.g. 200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border border-[#D1D2D4] px-4 py-3 focus:outline-none focus:border-black bg-[#EBEBEC] text-black text-sm"
            />
            {mode === "redeem" && pts > 0 && (
              <p className="text-xs text-[#8D8E8F] mt-1">= R{randValue} discount value</p>
            )}
          </div>

          {mode !== "redeem" && (
            <div>
              <label className="block text-xs font-semibold text-[#8D8E8F] uppercase tracking-wide mb-1.5">Reason</label>
              <input
                type="text"
                placeholder="e.g. Goodwill gesture, data correction…"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                className="w-full border border-[#D1D2D4] px-4 py-3 focus:outline-none focus:border-black bg-[#EBEBEC] text-black text-sm"
              />
            </div>
          )}

          {mode === "redeem" && (
            <div>
              <label className="block text-xs font-semibold text-[#8D8E8F] uppercase tracking-wide mb-1.5">Note (optional)</label>
              <input
                type="text"
                placeholder="e.g. Redeemed at checkout for treatment discount"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-[#D1D2D4] px-4 py-3 focus:outline-none focus:border-black bg-[#EBEBEC] text-black text-sm"
              />
            </div>
          )}

          {error && <p className="text-[#C9262E] text-sm">{error.message}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-[#D1D2D4] text-[#4A4A4A] py-3 text-sm font-medium hover:bg-[#EBEBEC]">Cancel</button>
            <button
              type="submit"
              disabled={isPending || (mode !== "add" && pts > balance)}
              className="flex-1 text-white py-3 text-sm font-semibold disabled:opacity-50 transition-opacity"
              style={{ background: mode === "add" ? "#000" : mode === "remove" ? "#C9262E" : "#6d28d9" }}
            >
              {isPending ? "Saving…" : mode === "add" ? "Add Points" : mode === "remove" ? "Remove Points" : `Redeem ${pts > 0 ? `${pts} pts (R${randValue})` : "Points"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [adjustingClient, setAdjustingClient] = useState<Client | null>(null);
  const { data: clients } = trpc.clients.list.useQuery({ spaId: SPA_ID, search: search || undefined });

  return (
    <div className="min-h-screen flex bg-[#EBEBEC]">
      {adjustingClient && <AdjustPointsModal client={adjustingClient} onClose={() => setAdjustingClient(null)} />}
      <DashboardSidebar />

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-black">Guests</h1>
            <p className="text-[#8D8E8F] text-sm mt-1">{clients?.length ?? 0} members</p>
          </div>
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-[#D1D2D4] px-4 py-2.5 w-72 focus:outline-none focus:border-black bg-white text-black text-sm"
          />
        </div>

        <div className="bg-white border border-[#D1D2D4] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#EBEBEC] border-b border-[#D1D2D4]">
              <tr>
                {["Guest", "Contact", "Visits", "Tier", "Points Balance", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#8D8E8F] px-5 py-3 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients?.map((c) => {
                const pts = c.loyaltyAccount?.balance ?? 0;
                const lifetime = c.loyaltyAccount?.lifetimeEarned ?? 0;
                const tier = getTier(lifetime);
                return (
                  <tr key={c.id} className="border-b border-[#EBEBEC] hover:bg-[#EBEBEC]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold text-xs">
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-black text-sm">{c.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-[#4A4A4A] text-sm">{c.email}</div>
                      {c.phone && <div className="text-[#8D8E8F] text-xs">{c.phone}</div>}
                    </td>
                    <td className="px-5 py-4 text-[#4A4A4A] text-sm">{c._count.appointments}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.color}`}>
                        {tier.icon} {tier.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-black text-white text-xs font-bold px-3 py-1">
                        {pts.toLocaleString()} pts
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setAdjustingClient(c as Client)}
                        className="text-xs px-3 py-1.5 border border-[#D1D2D4] text-[#4A4A4A] hover:border-black hover:text-black transition-colors font-medium"
                      >
                        Adjust pts
                      </button>
                    </td>
                  </tr>
                );
              })}
              {clients?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-[#8D8E8F] py-12">No guests found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

