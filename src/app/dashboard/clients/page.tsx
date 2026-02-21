"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useState } from "react";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const { data: clients } = trpc.clients.list.useQuery({ spaId: SPA_ID, search: search || undefined });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-60 bg-white border-r border-slate-200 p-6">
        <Link href="/dashboard" className="text-xl font-bold text-teal-600 mb-6 block">LoyalBook</Link>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-teal-600">← Dashboard</Link>
      </aside>
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Clients</h1>
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2 w-72 focus:outline-none focus:border-teal-500"
          />
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {["Name", "Email", "Phone", "Visits", "Points Balance"].map((h) => (
                  <th key={h} className="text-left text-sm font-medium text-slate-500 px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients?.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{c.email}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{c.phone ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{c._count.appointments}</td>
                  <td className="px-6 py-4">
                    <span className="bg-teal-100 text-teal-700 text-sm font-medium px-3 py-1 rounded-full">
                      {c.loyaltyAccount?.balance ?? 0} pts
                    </span>
                  </td>
                </tr>
              ))}
              {clients?.length === 0 && (
                <tr><td colSpan={5} className="text-center text-slate-400 py-10">No clients found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
