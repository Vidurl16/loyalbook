"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useState } from "react";

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
  const [mode, setMode] = useState<"add" | "remove">("add");
  const utils = trpc.useUtils();

  const adjust = trpc.loyalty.adjustPoints.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      onClose();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const pts = parseInt(amount);
    if (!pts || pts <= 0 || !reason.trim()) return;
    adjust.mutate({ clientId: client.id, amount: mode === "add" ? pts : -pts, reason });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-display text-xl font-bold text-stone-900">Adjust Points</h2>
            <p className="text-stone-400 text-sm mt-0.5">{client.name} · {(client.loyaltyAccount?.balance ?? 0).toLocaleString()} pts current balance</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Add / Remove toggle */}
          <div className="flex rounded-xl border border-stone-200 overflow-hidden">
            {(["add", "remove"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  mode === m
                    ? m === "add" ? "bg-teal-600 text-white" : "bg-rose-500 text-white"
                    : "bg-white text-stone-500 hover:bg-stone-50"
                }`}
              >
                {m === "add" ? "➕ Add Points" : "➖ Remove Points"}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Points Amount</label>
            <input
              type="number"
              min={1}
              placeholder="e.g. 200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 bg-stone-50 text-stone-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5">Reason</label>
            <input
              type="text"
              placeholder="e.g. Goodwill gesture, data correction…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="w-full border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-500 bg-stone-50 text-stone-800"
            />
          </div>

          {adjust.error && <p className="text-red-500 text-sm">{adjust.error.message}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-stone-200 text-stone-600 py-3 rounded-xl hover:bg-stone-50 text-sm font-medium">Cancel</button>
            <button
              type="submit"
              disabled={adjust.isPending}
              className={`flex-1 text-white py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors ${mode === "add" ? "bg-teal-600 hover:bg-teal-700" : "bg-rose-500 hover:bg-rose-600"}`}
            >
              {adjust.isPending ? "Saving…" : mode === "add" ? "Add Points" : "Remove Points"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/clients", label: "Guests", icon: "👥" },
  { href: "/dashboard/services", label: "Treatments", icon: "🌿" },
  { href: "/dashboard/staff", label: "Therapists", icon: "🧖‍♀️" },
  { href: "/dashboard/loyalty", label: "Loyalty", icon: "✨" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [adjustingClient, setAdjustingClient] = useState<Client | null>(null);
  const { data: clients } = trpc.clients.list.useQuery({ spaId: SPA_ID, search: search || undefined });

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {adjustingClient && <AdjustPointsModal client={adjustingClient} onClose={() => setAdjustingClient(null)} />}

      <aside className="w-60 bg-white border-r border-stone-100 p-6 flex flex-col gap-0.5 shrink-0">
        <Link href="/" className="font-display text-xl font-bold text-teal-700 mb-8 block">Perfect 10</Link>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 text-sm rounded-xl px-3 py-2.5 transition-colors ${
              item.href === "/dashboard/clients"
                ? "bg-teal-50 text-teal-700 font-medium"
                : "text-stone-500 hover:text-teal-700 hover:bg-stone-50"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <div className="mt-auto pt-6">
          <Link href="/book" className="w-full flex items-center justify-center gap-2 bg-teal-700 text-white text-sm py-2.5 rounded-xl hover:bg-teal-800 transition-colors font-medium">
            + New Booking
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-stone-900">Guests</h1>
            <p className="text-stone-400 text-sm mt-1">{clients?.length ?? 0} members</p>
          </div>
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-stone-200 rounded-xl px-4 py-2.5 w-72 focus:outline-none focus:border-teal-500 bg-white text-stone-800 text-sm"
          />
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-stone-50 border-b border-stone-100">
              <tr>
                {["Guest", "Contact", "Visits", "Tier", "Points Balance", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-stone-400 px-5 py-3 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients?.map((c) => {
                const pts = c.loyaltyAccount?.balance ?? 0;
                const lifetime = c.loyaltyAccount?.lifetimeEarned ?? 0;
                const tier = getTier(lifetime);
                return (
                  <tr key={c.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs">
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-medium text-stone-800 text-sm">{c.name}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-stone-500 text-sm">{c.email}</div>
                      {c.phone && <div className="text-stone-400 text-xs">{c.phone}</div>}
                    </td>
                    <td className="px-5 py-4 text-stone-500 text-sm">{c._count.appointments}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tier.color}`}>
                        {tier.icon} {tier.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="bg-teal-50 text-teal-700 text-sm font-semibold px-3 py-1 rounded-full">
                        {pts.toLocaleString()} pts
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setAdjustingClient(c as Client)}
                        className="text-xs text-stone-400 hover:text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-lg transition-colors font-medium border border-stone-200 hover:border-teal-200"
                      >
                        Adjust pts
                      </button>
                    </td>
                  </tr>
                );
              })}
              {clients?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-stone-400 py-12">
                    <div className="text-2xl mb-2">🌸</div>
                    No guests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
