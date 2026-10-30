"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatDay, formatDayTime, formatRand, formatTime, greeting } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID ?? "";
const OPEN = ["pending", "confirmed"];

export default function AccountPage() {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login?callbackUrl=/account");

  const { data: me } = trpc.clients.me.useQuery(undefined, { enabled: !!session?.user });
  const { data: config } = trpc.loyalty.getConfig.useQuery({ spaId: SPA_ID }, { enabled: !!session?.user });

  const [now] = useState(() => Date.now());
  const appointments = me?.appointments ?? [];
  const upcoming = appointments
    .filter((a) => new Date(a.startAt).getTime() >= now && OPEN.includes(a.status))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const past = appointments
    .filter((a) => new Date(a.startAt).getTime() < now || a.status === "completed")
    .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));
  const next = upcoming[0];
  const rebook = Array.from(new Map(past.filter((a) => a.status === "completed").map((a) => [a.service.id, a])).values()).slice(0, 3);

  const balance = me?.loyaltyAccount?.balance ?? 0;
  const minRedeem = config?.minRedeem ?? 500;
  const randValue = config ? Math.round((balance / config.redemptionRate) * config.currencyUnitAmount) : 0;
  const progress = Math.min(balance / minRedeem, 1);
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <main className="container-x max-w-3xl pb-16 pt-8 md:pt-12">
      <header className="mb-8">
        <p className="eyebrow mb-2">My account</p>
        <h1 className="display-lg">
          {greeting(new Date(now))}
          {firstName ? `, ${firstName}.` : "."}
        </h1>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card flex flex-col p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Next visit</p>
            {next && <StatusBadge status={next.status} />}
          </div>
          {!me ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : next ? (
            <>
              <h2 className="font-display text-[24px] leading-tight text-ink">{next.service.name}</h2>
              <p className="mt-1 text-[14px] text-ink-soft">
                {next.staff ? `with ${next.staff.user.name} · ` : ""}
                {formatDayTime(next.startAt)}
              </p>
              <div className="mt-auto flex items-center justify-between pt-6">
                <span className="font-display text-[20px] text-ink">{formatRand(next.service.price)}</span>
                <Link href="/account/bookings" className="btn-ghost text-pink-dark hover:text-pink">
                  Manage →
                </Link>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-display text-[22px] leading-tight text-ink">Nothing booked yet.</h2>
              <p className="mt-1 text-[14px] text-ink-soft">Pick a treatment, a therapist and a time in under a minute.</p>
              <Link href="/book" className="btn-primary mt-6 w-full">
                Book a treatment
              </Link>
            </>
          )}
        </section>

        <section className="card flex flex-col bg-ink p-6 text-paper">
          <p className="text-[10px] uppercase tracking-[0.2em] text-paper/60">Points</p>
          {!me ? (
            <Skeleton className="mt-3 h-12 w-32 bg-paper/10" />
          ) : (
            <>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-[44px] leading-none">{balance.toLocaleString("en-ZA")}</span>
                <span className="text-[13px] text-paper/70">≈ {formatRand(randValue)}</span>
              </div>
              <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-paper/15">
                <div className="h-full rounded-full bg-pink transition-[width] duration-700 ease-out-soft" style={{ width: `${progress * 100}%` }} />
              </div>
              <p className="mt-2 text-[12px] text-paper/70">
                {balance >= minRedeem ? "You can redeem a voucher now." : `${(minRedeem - balance).toLocaleString("en-ZA")} points to your next voucher.`}
              </p>
            </>
          )}
          <Link href="/account/rewards" className="btn mt-auto w-full border-paper/40 pt-3.5 text-paper hover:border-paper hover:bg-paper hover:text-ink">
            Rewards
          </Link>
        </section>
      </div>

      {rebook.length > 0 && (
        <section className="mt-10">
          <h2 className="eyebrow mb-4">Book again</h2>
          <div className="flex flex-col gap-2">
            {rebook.map((a) => (
              <Link
                key={a.service.id}
                href={`/book?service=${a.service.id}&step=therapist${a.staff ? `&staff=${a.staff.id}` : ""}`}
                className="card-interactive flex items-center justify-between px-5 py-4"
              >
                <span>
                  <span className="block font-display text-[17px] text-ink">{a.service.name}</span>
                  <span className="block text-[12px] text-muted">
                    Last visit {formatDay(a.startAt)}
                    {a.staff ? ` with ${a.staff.user.name}` : ""}
                  </span>
                </span>
                <span className="btn-ghost text-pink-dark">Rebook →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {past.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="eyebrow">Recent treatments</h2>
            <Link href="/account/bookings" className="btn-ghost">
              All bookings →
            </Link>
          </div>
          <ul className="card divide-y divide-hairline">
            {past.slice(0, 4).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <span>
                  <span className="block text-[15px] text-ink">{a.service.name}</span>
                  <span className="block text-[12px] text-muted">
                    {formatDay(a.startAt)} · {formatTime(a.startAt)}
                  </span>
                </span>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 flex items-center justify-between border-t border-hairline pt-6 text-[12px] text-muted">
        <span>{session?.user?.email}</span>
        <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost">
          Sign out
        </button>
      </div>
    </main>
  );
}
