"use client";

import { useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { formatDay, formatLongDay, formatTime } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CardListSkeleton } from "@/components/ui/Skeleton";

const OPEN = ["pending", "confirmed"];

export default function AccountBookingsPage() {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login?callbackUrl=/account/bookings");

  const { data: appointments, refetch } = trpc.appointments.myAppointments.useQuery({ take: 100 }, { enabled: !!session?.user });
  const cancelMine = trpc.appointments.cancelMine.useMutation({ onSuccess: () => refetch() });

  const [now] = useState(() => Date.now());
  const upcoming = (appointments ?? [])
    .filter((a) => new Date(a.startAt).getTime() >= now && OPEN.includes(a.status))
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const history = (appointments ?? [])
    .filter((a) => new Date(a.startAt).getTime() < now || !OPEN.includes(a.status))
    .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt))
    .slice(0, 20);

  function cancel(id: string) {
    if (window.confirm("Cancel this appointment?")) cancelMine.mutate({ id });
  }

  return (
    <main className="container-x max-w-3xl pb-16 pt-8 md:pt-12">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <Link href="/account" className="btn-ghost mb-3">
            ← Account
          </Link>
          <h1 className="display-lg">My bookings</h1>
        </div>
      </header>

      <section>
        <h2 className="eyebrow mb-4">Upcoming</h2>
        {!appointments ? (
          <CardListSkeleton rows={2} />
        ) : upcoming.length === 0 ? (
          <div className="card flex flex-col items-center p-8 text-center">
            <p className="font-display text-[20px] text-ink">No upcoming treatments.</p>
            <Link href="/book" className="btn-primary mt-5">
              Book a treatment
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {upcoming.map((a) => (
              <li key={a.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-[20px] leading-tight text-ink">{a.service?.name ?? "Treatment"}</h3>
                    {a.staff?.user?.name && <p className="mt-1 text-[12px] uppercase tracking-[0.16em] text-blush-deep">with {a.staff.user.name}</p>}
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4">
                  <span className="text-[14px] text-ink">
                    {formatLongDay(a.startAt)} · {formatTime(a.startAt)}
                  </span>
                  <button type="button" onClick={() => cancel(a.id)} disabled={cancelMine.isPending} className="btn-ghost">
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {history.length > 0 && (
        <section className="mt-10">
          <h2 className="eyebrow mb-4">History</h2>
          <ul className="card divide-y divide-hairline">
            {history.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-[15px] text-ink">{a.service?.name ?? "Treatment"}</p>
                  <p className="text-[12px] text-muted">{formatDay(a.startAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  {a.status === "completed" && a.service && (
                    <Link href={`/book?service=${a.service.id}&step=therapist`} className="btn-ghost text-pink-dark hover:text-pink">
                      Rebook
                    </Link>
                  )}
                  <StatusBadge status={a.status} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
