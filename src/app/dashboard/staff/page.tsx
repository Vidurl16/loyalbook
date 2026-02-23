"use client";

import { trpc } from "@/lib/trpc";
import { useState } from "react";
import Link from "next/link";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const COLORS = [
  "#C9262E", "#000000", "#4A4A4A", "#8D8E8F",
  "#6366F1", "#EC4899", "#F97316", "#06B6D4", "#84CC16", "#10B981",
];

export default function StaffPage() {
  const utils = trpc.useUtils();

  const { data: staff, isLoading } = trpc.staff.list.useQuery(
    { spaId: SPA_ID },
    { enabled: !!SPA_ID }
  );

  const updateStaff = trpc.staff.update.useMutation({
    onSuccess: () => utils.staff.list.invalidate(),
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBio, setEditBio] = useState("");
  const [editColor, setEditColor] = useState("");

  return (
    <div className="min-h-screen flex bg-[#EBEBEC]">
      <DashboardSidebar />

      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black">Therapists</h2>
          <p className="text-[#8D8E8F] text-sm mt-1">Manage your team, bios and treatment specialties</p>
        </div>

        {isLoading ? (
          <p className="text-[#8D8E8F] text-sm">Loading therapists…</p>
        ) : !staff || staff.length === 0 ? (
          <div className="bg-white border border-[#D1D2D4] p-12 text-center">
            <p className="text-4xl mb-3">🧖‍♀️</p>
            <p className="text-black font-medium">No therapists yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {staff.map((member) => (
              <div key={member.id} className="bg-white border border-[#D1D2D4] overflow-hidden">
                <div className="h-1.5" style={{ backgroundColor: member.color ?? "#C9262E" }} />
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ backgroundColor: member.color ?? "#C9262E" }}
                    >
                      {(member.user?.name ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-black truncate">{member.user?.name ?? "Unknown"}</h3>
                      <p className="text-sm text-[#8D8E8F] truncate">{member.user?.email}</p>
                    </div>
                  </div>

                  {editingId === member.id ? (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#8D8E8F] uppercase tracking-widest mb-1">Bio</label>
                        <textarea
                          className="w-full border border-[#D1D2D4] px-3 py-2 text-sm focus:outline-none focus:border-black"
                          rows={3}
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#8D8E8F] uppercase tracking-widest mb-2">Colour</label>
                        <div className="flex gap-2 flex-wrap">
                          {COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => setEditColor(c)}
                              className="w-7 h-7 border-2 transition-all"
                              style={{ backgroundColor: c, borderColor: editColor === c ? "#000" : "transparent" }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => { updateStaff.mutate({ id: member.id, bio: editBio, color: editColor }); setEditingId(null); }}
                          className="text-white px-4 py-1.5 text-sm font-semibold hover:opacity-90"
                          style={{ background: "#000" }}
                        >Save</button>
                        <button onClick={() => setEditingId(null)} className="text-[#4A4A4A] px-4 py-1.5 text-sm border border-[#D1D2D4] hover:bg-[#EBEBEC]">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      {member.bio
                        ? <p className="text-sm text-[#4A4A4A] leading-relaxed">{member.bio}</p>
                        : <p className="text-sm text-[#8D8E8F] italic">No bio yet</p>}
                      {member.services && member.services.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold text-[#8D8E8F] uppercase tracking-widest mb-1.5">Specialties</p>
                          <div className="flex flex-wrap gap-1.5">
                            {member.services.slice(0, 4).map((s) => (
                              <span key={s.serviceId} className="text-xs border border-[#D1D2D4] text-[#4A4A4A] px-2 py-0.5">{s.service.name}</span>
                            ))}
                            {member.services.length > 4 && (
                              <span className="text-xs text-[#8D8E8F]">+{member.services.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-3 mt-4 items-center">
                        <button
                          onClick={() => { setEditingId(member.id); setEditBio(member.bio ?? ""); setEditColor(member.color ?? COLORS[0]!); }}
                          className="text-sm font-semibold hover:underline"
                          style={{ color: "#C9262E" }}
                        >Edit profile</button>
                        <Link
                          href={`/dashboard/staff/${member.id}`}
                          className="text-sm font-semibold text-[#4A4A4A] hover:text-black hover:underline"
                        >View Analytics →</Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
