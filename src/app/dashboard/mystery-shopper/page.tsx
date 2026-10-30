"use client";

import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { trpc } from "@/lib/trpc";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;


export default function MysteryShopperAdminPage() {
  const utils = trpc.useUtils();
  const { data: entries, error } = trpc.mysteryShopper.listEntries.useQuery({ spaId: SPA_ID }, { retry: false });
  const markRedeemed = trpc.mysteryShopper.markRedeemed.useMutation({
    onSuccess: () => utils.mysteryShopper.listEntries.invalidate(),
  });

  return (
    <div className="min-h-screen flex" style={{ background: "#faf6f5" }}>
      <DashboardSidebar />

      <main className="flex-1 p-8 max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">Secret Shopper</h1>
        <p className="text-stone-400 text-sm mb-8">Owner-only. Entrant identities are hidden from staff. Winners agreed to leave a review and to internal photo sharing.</p>

        {error ? (
          <div className="rounded-xl bg-stone-100 border border-stone-200 px-4 py-3 text-sm text-stone-500">
            This page is visible to the salon owner only.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-stone-400 border-b border-stone-100">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Prize</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {entries?.map((e) => (
                  <tr key={e.id} className="border-b border-stone-50 last:border-0">
                    <td className="px-4 py-3 text-stone-900">{e.name}</td>
                    <td className="px-4 py-3 text-stone-500">{e.email}{e.phone ? ` · ${e.phone}` : ""}</td>
                    <td className="px-4 py-3 text-stone-700">{e.prize ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${e.status === "selected" ? "bg-amber-50 text-amber-700" : e.status === "redeemed" ? "bg-teal-50 text-teal-700" : "bg-stone-100 text-stone-500"}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {e.status === "selected" && (
                        <button onClick={() => markRedeemed.mutate({ id: e.id })} disabled={markRedeemed.isPending} className="text-xs font-medium text-teal-700 hover:underline">
                          Mark redeemed
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {entries?.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-stone-400">No entries yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
