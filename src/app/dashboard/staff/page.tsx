"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/clients", label: "Guests", icon: "👥" },
  { href: "/dashboard/services", label: "Treatments", icon: "🌿" },
  { href: "/dashboard/staff", label: "Therapists", icon: "🧖‍♀️" },
  { href: "/dashboard/loyalty", label: "Loyalty", icon: "✨" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

const COLORS = [
  "#F59E0B", "#10B981", "#6366F1", "#EC4899", "#14B8A6",
  "#8B5CF6", "#F97316", "#06B6D4", "#84CC16", "#EF4444",
];

export default function StaffPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
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
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
        <div className="p-6 border-b border-stone-100">
          <h1 className="font-display text-xl text-stone-800">🌸 LoyalBook</h1>
          <p className="text-xs text-stone-400 mt-1">Spa Management</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-teal-50 text-teal-700"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-stone-100">
          <p className="text-xs text-stone-500">{session?.user?.name ?? "Staff"}</p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-display text-stone-800">Therapists</h2>
          <p className="text-stone-500 text-sm mt-1">Manage your team, bios, and treatment specialties</p>
        </div>

        {isLoading ? (
          <p className="text-stone-400 text-sm">Loading therapists…</p>
        ) : !staff || staff.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
            <p className="text-4xl mb-3">🧖‍♀️</p>
            <p className="text-stone-600 font-medium">No therapists yet</p>
            <p className="text-stone-400 text-sm mt-1">
              Add staff members by registering them and setting their role to{" "}
              <span className="font-mono bg-stone-100 px-1 rounded">staff</span> in the database.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {staff.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden"
              >
                {/* Color bar */}
                <div
                  className="h-2"
                  style={{ backgroundColor: member.color ?? "#10B981" }}
                />
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"
                      style={{ backgroundColor: member.color ?? "#10B981" }}
                    >
                      {(member.user?.name ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-stone-800 truncate">
                        {member.user?.name ?? "Unknown"}
                      </h3>
                      <p className="text-sm text-stone-400 truncate">
                        {member.user?.email}
                      </p>
                    </div>
                  </div>

                  {editingId === member.id ? (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-1">Bio</label>
                        <textarea
                          className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                          rows={3}
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          placeholder="Therapist bio…"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-stone-600 mb-2">Colour</label>
                        <div className="flex gap-2 flex-wrap">
                          {COLORS.map((c) => (
                            <button
                              key={c}
                              onClick={() => setEditColor(c)}
                              className="w-7 h-7 rounded-full border-2 transition-all"
                              style={{
                                backgroundColor: c,
                                borderColor: editColor === c ? "#1C1917" : "transparent",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => {
                            updateStaff.mutate({
                              id: member.id,
                              bio: editBio,
                              color: editColor,
                            });
                            setEditingId(null);
                          }}
                          className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-stone-500 px-3 py-1.5 rounded-lg text-sm hover:bg-stone-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      {member.bio ? (
                        <p className="text-sm text-stone-500 leading-relaxed">{member.bio}</p>
                      ) : (
                        <p className="text-sm text-stone-300 italic">No bio yet</p>
                      )}

                      {/* Services */}
                      {member.services && member.services.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-stone-500 mb-1.5">Specialties</p>
                          <div className="flex flex-wrap gap-1.5">
                            {member.services.slice(0, 4).map((s) => (
                              <span
                                key={s.serviceId}
                                className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full"
                              >
                                {s.service.name}
                              </span>
                            ))}
                            {member.services.length > 4 && (
                              <span className="text-xs text-stone-400">
                                +{member.services.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => {
                          setEditingId(member.id);
                          setEditBio(member.bio ?? "");
                          setEditColor(member.color ?? COLORS[0]!);
                        }}
                        className="mt-4 text-sm text-teal-600 hover:text-teal-800 font-medium"
                      >
                        Edit profile
                      </button>
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
