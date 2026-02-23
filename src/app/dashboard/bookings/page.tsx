"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "#8D8E8F" },
  confirmed: { label: "Confirmed", color: "#2563eb" },
  completed: { label: "Completed", color: "#16a34a" },
  no_show: { label: "No Show", color: "#dc2626" },
  cancelled_by_client: { label: "Cancelled (Client)", color: "#C9262E" },
  cancelled_by_spa: { label: "Cancelled (Spa)", color: "#C9262E" },
};

const STATUSES = ["", "pending", "confirmed", "completed", "no_show", "cancelled_by_client", "cancelled_by_spa"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookingsPage() {
  const [from, setFrom] = useState(todayStr());
  const [to, setTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [confirmAction, setConfirmAction] = useState<{ id: string; status: string; name: string } | null>(null);

  const utils = trpc.useUtils();

  const { data: bookings, isLoading } = trpc.appointments.listAll.useQuery({
    spaId: SPA_ID,
    from: from ? `${from}T00:00:00.000Z` : undefined,
    to: to ? `${to}T23:59:59.999Z` : undefined,
    status: statusFilter || undefined,
    staffId: staffFilter || undefined,
    take: 200,
  });

  const { data: staff } = trpc.staff.list.useQuery({ spaId: SPA_ID });

  const updateStatus = trpc.appointments.updateStatus.useMutation({
    onSuccess: () => {
      utils.appointments.listAll.invalidate();
      setConfirmAction(null);
    },
  });

  const handleAction = (id: string, status: string, clientName: string) => {
    setConfirmAction({ id, status, name: clientName });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    updateStatus.mutate({ id: confirmAction.id, status: confirmAction.status as never });
  };

  const grouped: Record<string, typeof bookings> = {};
  if (bookings) {
    for (const b of bookings) {
      const day = new Date(b.startAt).toLocaleDateString("en-ZA", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      if (!grouped[day]) grouped[day] = [];
      grouped[day]!.push(b);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#EBEBEC]">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-semibold tracking-wide text-black mb-1">Bookings</h1>
          <p className="text-sm text-[#8D8E8F] mb-6">Manage all appointments and update their status</p>

          {/* Filters */}
          <div className="bg-white border border-[#D1D2D4] p-4 mb-6 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs text-[#8D8E8F] mb-1 uppercase tracking-wider">From</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="border border-[#D1D2D4] px-3 py-1.5 text-sm text-black focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8D8E8F] mb-1 uppercase tracking-wider">To</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="border border-[#D1D2D4] px-3 py-1.5 text-sm text-black focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="block text-xs text-[#8D8E8F] mb-1 uppercase tracking-wider">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-[#D1D2D4] px-3 py-1.5 text-sm text-black focus:outline-none focus:border-black"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s ? STATUS_LABELS[s]?.label : "All Statuses"}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#8D8E8F] mb-1 uppercase tracking-wider">Therapist</label>
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value)}
                className="border border-[#D1D2D4] px-3 py-1.5 text-sm text-black focus:outline-none focus:border-black"
              >
                <option value="">All Therapists</option>
                {staff?.map((s) => (
                  <option key={s.id} value={s.id}>{s.user?.name ?? s.id}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => { setFrom(""); setTo(""); setStatusFilter(""); setStaffFilter(""); }}
              className="text-xs text-[#8D8E8F] hover:text-black underline self-end pb-2"
            >
              Clear filters
            </button>
            <div className="ml-auto self-end">
              <span className="text-sm text-[#8D8E8F]">{bookings?.length ?? 0} bookings</span>
            </div>
          </div>

          {/* Booking Table */}
          {isLoading ? (
            <div className="text-center py-16 text-[#8D8E8F]">Loading bookings…</div>
          ) : !bookings?.length ? (
            <div className="text-center py-16 text-[#8D8E8F]">No bookings found for the selected filters.</div>
          ) : (
            Object.entries(grouped).map(([day, dayBookings]) => (
              <div key={day} className="mb-6">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-[#8D8E8F] mb-2">{day}</h2>
                <div className="bg-white border border-[#D1D2D4] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#D1D2D4] bg-[#EBEBEC]">
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Time</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Guest</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Treatment</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Therapist</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Value</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-2.5 text-xs font-semibold text-[#8D8E8F] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayBookings?.map((booking, i) => {
                        const s = STATUS_LABELS[booking.status] ?? { label: booking.status, color: "#8D8E8F" };
                        const isActive = ["pending", "confirmed"].includes(booking.status);
                        const time = new Date(booking.startAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });

                        return (
                          <tr key={booking.id} className={`border-b border-[#D1D2D4] last:border-0 ${i % 2 === 0 ? "" : "bg-[#EBEBEC]/30"}`}>
                            <td className="px-4 py-3 font-mono text-xs text-black">{time}</td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-black">{booking.client?.name ?? "Unknown"}</div>
                              <div className="text-xs text-[#8D8E8F]">{booking.client?.email}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-black">{booking.service?.name}</div>
                              <div className="text-xs text-[#8D8E8F]">{booking.service?.durationMins} min · {booking.service?.category}</div>
                            </td>
                            <td className="px-4 py-3 text-black">
                              {booking.staff?.user?.name ?? <span className="text-[#8D8E8F] italic">Unassigned</span>}
                            </td>
                            <td className="px-4 py-3 text-black font-medium">R{booking.service?.price?.toLocaleString()}</td>
                            <td className="px-4 py-3">
                              <span className="inline-block px-2 py-0.5 text-xs font-medium text-white" style={{ background: s.color }}>
                                {s.label}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-1.5 flex-wrap">
                                {booking.status === "pending" && (
                                  <button
                                    onClick={() => handleAction(booking.id, "confirmed", booking.client?.name ?? "")}
                                    className="text-xs px-2 py-1 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                  >
                                    Confirm
                                  </button>
                                )}
                                {["pending", "confirmed"].includes(booking.status) && (
                                  <button
                                    onClick={() => handleAction(booking.id, "completed", booking.client?.name ?? "")}
                                    className="text-xs px-2 py-1 text-white hover:opacity-90 transition-opacity"
                                    style={{ background: "#16a34a" }}
                                  >
                                    Complete ✓
                                  </button>
                                )}
                                {isActive && (
                                  <button
                                    onClick={() => handleAction(booking.id, "no_show", booking.client?.name ?? "")}
                                    className="text-xs px-2 py-1 bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                                  >
                                    No Show
                                  </button>
                                )}
                                {isActive && (
                                  <button
                                    onClick={() => handleAction(booking.id, "cancelled_by_spa", booking.client?.name ?? "")}
                                    className="text-xs px-2 py-1 text-white hover:opacity-90 transition-opacity"
                                    style={{ background: "#C9262E" }}
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-6 max-w-sm w-full mx-4">
            <h3 className="font-semibold text-black mb-2">Confirm Action</h3>
            <p className="text-sm text-[#4A4A4A] mb-4">
              Mark booking for <strong>{confirmAction.name}</strong> as{" "}
              <strong>{STATUS_LABELS[confirmAction.status]?.label ?? confirmAction.status}</strong>?
              {confirmAction.status === "completed" && (
                <span className="block mt-1 text-[#16a34a]">✓ Loyalty points will be credited automatically.</span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={executeAction}
                disabled={updateStatus.isPending}
                className="flex-1 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                style={{ background: "#C9262E" }}
              >
                {updateStatus.isPending ? "Updating…" : "Confirm"}
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 text-sm border border-[#D1D2D4] text-black hover:bg-[#EBEBEC]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
