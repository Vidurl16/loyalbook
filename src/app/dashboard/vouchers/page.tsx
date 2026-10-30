"use client";

import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { trpc } from "@/lib/trpc";
import { useState } from "react";


type Lookup = {
  usable: boolean;
  reason: string | null;
  voucher: { id: string; code: string; discountValue: number; status: string; client: { name: string | null } };
};

export default function VouchersPage() {
  const utils = trpc.useUtils();
  const [code, setCode] = useState("");
  const [lookup, setLookup] = useState<Lookup | null>(null);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);

  const apply = trpc.loyalty.applyVoucherCode.useMutation({
    onSuccess: () => { setApplied(true); setError(""); },
    onError: (e) => setError(e.message),
  });

  async function check() {
    setError(""); setLookup(null); setApplied(false);
    try {
      const res = await utils.loyalty.validateVoucherCode.fetch({ code });
      setLookup(res as Lookup);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Not found.");
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#faf6f5" }}>
      <DashboardSidebar />

      <main className="flex-1 p-8 max-w-xl">
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">Redeem a Voucher</h1>
        <p className="text-stone-400 text-sm mb-8">Enter a client&apos;s voucher code at the till to confirm and apply the discount.</p>

        <div className="bg-white rounded-2xl border border-stone-100 p-8">
          <label className="block text-sm font-medium text-stone-700 mb-1">Voucher code</label>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setLookup(null); setApplied(false); }}
              placeholder="VIV-XXXX-XXXX"
              className="flex-1 border border-stone-200 rounded-lg px-4 py-3 font-mono tracking-wider text-stone-900 outline-none focus:border-teal-500"
            />
            <button onClick={check} disabled={code.length < 3} className="px-5 py-3 text-sm font-semibold text-white rounded-lg disabled:opacity-40" style={{ background: "#232122" }}>
              Check
            </button>
          </div>

          {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

          {lookup && (
            <div className="mt-6 border-t border-stone-100 pt-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-display font-bold text-stone-900">R{lookup.voucher.discountValue} off</span>
                <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded ${lookup.usable ? "bg-teal-50 text-teal-700" : "bg-stone-100 text-stone-500"}`}>
                  {lookup.voucher.status}
                </span>
              </div>
              <p className="text-sm text-stone-500 mb-4">Client: {lookup.voucher.client?.name ?? "—"}</p>

              {applied ? (
                <div className="text-sm font-semibold text-teal-700">✓ Applied — reduce the in-store total by R{lookup.voucher.discountValue}.</div>
              ) : lookup.usable ? (
                <button
                  onClick={() => apply.mutate({ code })}
                  disabled={apply.isPending}
                  className="w-full py-3 text-sm font-semibold text-white rounded-lg disabled:opacity-50"
                  style={{ background: "#232122" }}
                >
                  {apply.isPending ? "Applying…" : `Apply R${lookup.voucher.discountValue} discount`}
                </button>
              ) : (
                <div className="text-sm text-red-600">{lookup.reason}</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
