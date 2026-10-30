"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatDay, formatRand } from "@/lib/format";
import { PointsMeter } from "@/components/rewards/PointsMeter";
import { Skeleton } from "@/components/ui/Skeleton";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID ?? "";
const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID ?? "";

const TX_LABELS: Record<string, string> = {
  earned: "Treatment reward",
  redeemed: "Points redeemed",
  birthday: "Birthday bonus",
  rebooking_bonus: "Rebooking bonus",
  referral: "Referral reward",
  milestone: "Adjustment",
  expired: "Points expired",
  refunded: "Points refunded",
};

export default function RewardsPage() {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login?callbackUrl=/account/rewards");
  const enabled = !!session?.user;
  const utils = trpc.useUtils();

  const { data: account } = trpc.loyalty.getAccount.useQuery(undefined, { enabled });
  const { data: config } = trpc.loyalty.getConfig.useQuery({ spaId: SPA_ID }, { enabled });
  const { data: vouchers } = trpc.loyalty.listMyVouchers.useQuery(undefined, { enabled });
  const { data: suggested } = trpc.loyalty.suggestedProducts.useQuery({ locationId: LOCATION_ID }, { enabled: enabled && !!LOCATION_ID });

  const [redeemError, setRedeemError] = useState("");
  const redeem = trpc.loyalty.redeemVoucher.useMutation({
    onSuccess: () => {
      utils.loyalty.getAccount.invalidate();
      utils.loyalty.listMyVouchers.invalidate();
      setRedeemError("");
    },
    onError: (e) => setRedeemError(e.message),
  });

  const balance = account?.balance ?? 0;
  const redemptionRate = config?.redemptionRate ?? 100;
  const unit = config?.currencyUnitAmount ?? 10;
  const minRedeem = config?.minRedeem ?? 500;
  const toRand = (pts: number) => Math.round((pts / redemptionRate) * unit);
  const options = [minRedeem, 1000, 2500, balance].filter((v, i, arr) => v >= minRedeem && v <= balance && arr.indexOf(v) === i);
  const activeVouchers = (vouchers ?? []).filter((v) => v.status === "active");

  return (
    <main className="container-x max-w-3xl pb-16 pt-8 md:pt-12">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <Link href="/account" className="btn-ghost mb-3">
            ← Account
          </Link>
          <h1 className="display-lg">Rewards</h1>
        </div>
      </header>

      <section className="card grid gap-8 p-6 md:grid-cols-[auto_1fr] md:items-center md:p-8">
        {account ? <PointsMeter points={balance} minRedeem={minRedeem} randValue={toRand(balance)} /> : <Skeleton className="h-[200px] w-[200px] rounded-full" />}
        <div>
          {balance >= minRedeem ? (
            <>
              <p className="eyebrow">Redeem</p>
              <h2 className="display-md mt-2">Turn points into a voucher.</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Choose an amount. You get a one-time code to show at the till on your next visit.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {options.map((pts) => (
                  <button key={pts} type="button" disabled={redeem.isPending} onClick={() => redeem.mutate({ points: pts })} className="btn-outline btn-sm">
                    {pts.toLocaleString("en-ZA")} pts → {formatRand(toRand(pts))}
                  </button>
                ))}
              </div>
              {redeemError && <p className="mt-3 text-[13px] text-pink-dark">{redeemError}</p>}
            </>
          ) : (
            <>
              <p className="eyebrow">Almost there</p>
              <h2 className="display-md mt-2">{(minRedeem - balance).toLocaleString("en-ZA")} points to your first voucher.</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                Points are added automatically when a treatment is completed, at {config?.pointsPerUnit ?? 10} points per {formatRand(config?.currencyUnitAmount ?? 100)}.
              </p>
              <Link href="/book" className="btn-primary mt-5">
                Book a treatment
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="eyebrow">Your vouchers</h2>
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted">{activeVouchers.length} active</span>
        </div>
        {activeVouchers.length === 0 ? (
          <p className="text-[14px] text-muted">No vouchers yet. Redeem points above to create one.</p>
        ) : (
          <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
            {activeVouchers.map((v) => (
              <article key={v.id} className="card w-[230px] shrink-0 snap-start overflow-hidden">
                <div className="h-1 bg-pink" />
                <div className="p-4">
                  <p className="text-[9px] uppercase tracking-[0.24em] text-pink-dark">Voucher</p>
                  <p className="mt-1 font-display text-[28px] leading-none text-ink">{formatRand(v.discountValue)}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-muted">off any treatment</p>
                  <div className="mt-4 rounded-sm border border-dashed border-pink bg-shell px-3 py-2 text-center font-display text-[16px] tracking-[0.12em] text-ink">
                    {v.code}
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted">
                    Show in salon · {v.expiresAt ? `exp ${formatDay(v.expiresAt)}` : "no expiry"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {suggested && suggested.products.length > 0 && (
        <section className="mt-10">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 className="eyebrow">Treat yourself</h2>
            <span className="text-[10px] uppercase tracking-[0.2em] text-pink-dark">{formatRand(suggested.randValue)} in points</span>
          </div>
          <p className="mb-4 text-[13px] text-muted">What your points could go towards. Ask us in the salon.</p>
          <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
            {suggested.products.map((p) => (
              <article key={p.id} className="card w-[140px] shrink-0 snap-start overflow-hidden">
                <div className="relative aspect-square bg-blush-tint">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />}
                  {p.covered && <span className="absolute right-2 top-2 rounded-sm bg-pink px-1.5 py-0.5 text-[8px] uppercase tracking-[0.14em] text-paper">Covered</span>}
                </div>
                <div className="p-3">
                  <p className="font-display text-[14px] leading-tight text-ink">{p.name}</p>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-muted">{p.brand}</p>
                  <p className="mt-1.5 text-[13px] text-ink">
                    {formatRand(p.covered ? 0 : p.discountedPrice)}
                    {!p.covered && p.discountedPrice < p.price && <span className="ml-1.5 text-[11px] text-muted line-through">{formatRand(p.price)}</span>}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="eyebrow mb-4">History</h2>
        {account?.transactions && account.transactions.length > 0 ? (
          <ul className="card divide-y divide-hairline">
            {account.transactions.map((tx) => (
              <li key={tx.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[15px] text-ink">{TX_LABELS[tx.type] ?? tx.type}</p>
                  <p className="truncate text-[12px] text-muted">
                    {formatDay(tx.createdAt)}
                    {tx.description ? ` · ${tx.description}` : ""}
                  </p>
                </div>
                <span className={`shrink-0 font-display text-[18px] ${tx.amount > 0 ? "text-pink-dark" : "text-muted"}`}>
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount.toLocaleString("en-ZA")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14px] text-muted">No activity yet. Your first completed treatment starts the count.</p>
        )}
      </section>
    </main>
  );
}
