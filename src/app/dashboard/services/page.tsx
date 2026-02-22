"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const CATEGORY_ICONS: Record<string, string> = {
  Facials: "🧖‍♀️",
  Peels: "✨",
  Massage: "💆",
  "Body Treatments": "🌿",
  "Brows & Lashes": "👁️",
  Waxing: "🪷",
  Nails: "💅",
};

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/clients", label: "Guests", icon: "👥" },
  { href: "/dashboard/services", label: "Treatments", icon: "🌿" },
  { href: "/dashboard/staff", label: "Therapists", icon: "🧖‍♀️" },
  { href: "/dashboard/loyalty", label: "Loyalty", icon: "✨" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export default function ServicesPage() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const utils = trpc.useUtils();

  const { data: services, isLoading } = trpc.services.list.useQuery(
    { spaId: SPA_ID },
    { enabled: !!SPA_ID }
  );

  const updateService = trpc.services.update.useMutation({
    onSuccess: () => utils.services.list.invalidate(),
  });

  const createService = trpc.services.create.useMutation({
    onSuccess: () => {
      utils.services.list.invalidate();
      setShowForm(false);
      setForm({ name: "", category: "Facials", durationMins: 60, price: 0, description: "" });
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Facials",
    durationMins: 60,
    price: 0,
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    category: string;
    durationMins: number;
    price: number;
    description: string;
  } | null>(null);

  const categories = ["Facials", "Massage", "Body Treatments", "Brows & Lashes", "Waxing", "Nails"];

  const grouped = (services ?? []).reduce<Record<string, typeof services>>((acc, s) => {
    if (!acc[s!.category]) acc[s!.category] = [];
    acc[s!.category]!.push(s);
    return acc;
  }, {} as Record<string, typeof services>);

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display text-stone-800">Treatment Menu</h2>
            <p className="text-stone-500 text-sm mt-1">Manage your services, pricing and availability</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            + Add Treatment
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-stone-200 p-6 mb-8">
            <h3 className="font-medium text-stone-800 mb-4">New Treatment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Name</label>
                <input
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Hydrating Facial"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Category</label>
                <select
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Duration (mins)</label>
                <input
                  type="number"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  value={form.durationMins}
                  onChange={(e) => setForm({ ...form, durationMins: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Price (R)</label>
                <input
                  type="number"
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-stone-600 mb-1">Description</label>
                <textarea
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm"
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => createService.mutate({ spaId: SPA_ID, ...form })}
                disabled={!form.name || createService.isPending}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50"
              >
                {createService.isPending ? "Saving…" : "Save Treatment"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="text-stone-500 px-4 py-2 rounded-lg text-sm hover:bg-stone-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <p className="text-stone-400 text-sm">Loading treatments…</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-base font-semibold text-stone-700 mb-3 flex items-center gap-2">
                  <span>{CATEGORY_ICONS[category] ?? "💆"}</span>
                  {category}
                  <span className="text-xs text-stone-400 font-normal">({items?.length})</span>
                </h3>
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wide">
                      <tr>
                        <th className="text-left px-6 py-3">Treatment</th>
                        <th className="text-left px-6 py-3">Duration</th>
                        <th className="text-left px-6 py-3">Price</th>
                        <th className="text-left px-6 py-3">Status</th>
                        <th className="px-6 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {items?.map((service) => (
                        <tr key={service!.id} className="hover:bg-stone-50">
                          {editingId === service!.id && editForm ? (
                            <>
                              <td className="px-6 py-3">
                                <input
                                  className="border border-stone-200 rounded px-2 py-1 text-sm w-full"
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                              </td>
                              <td className="px-6 py-3">
                                <input
                                  type="number"
                                  className="border border-stone-200 rounded px-2 py-1 text-sm w-20"
                                  value={editForm.durationMins}
                                  onChange={(e) => setEditForm({ ...editForm, durationMins: Number(e.target.value) })}
                                />
                                <span className="text-stone-400 ml-1">min</span>
                              </td>
                              <td className="px-6 py-3">
                                <span className="text-stone-500 mr-1">R</span>
                                <input
                                  type="number"
                                  className="border border-stone-200 rounded px-2 py-1 text-sm w-20"
                                  value={editForm.price}
                                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                />
                              </td>
                              <td className="px-6 py-3" />
                              <td className="px-6 py-3 text-right">
                                <button
                                  onClick={() => {
                                    updateService.mutate({ id: service!.id, ...editForm });
                                    setEditingId(null);
                                  }}
                                  className="text-teal-600 hover:text-teal-800 font-medium mr-3"
                                >
                                  Save
                                </button>
                                <button onClick={() => setEditingId(null)} className="text-stone-400 hover:text-stone-600">
                                  Cancel
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-6 py-4">
                                <p className="font-medium text-stone-800">{service!.name}</p>
                                {service!.description && (
                                  <p className="text-xs text-stone-400 mt-0.5">{service!.description}</p>
                                )}
                              </td>
                              <td className="px-6 py-4 text-stone-600">{service!.durationMins} min</td>
                              <td className="px-6 py-4 text-stone-800 font-medium">R {service!.price}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() =>
                                    updateService.mutate({
                                      id: service!.id,
                                      isActive: !service!.isActive,
                                    })
                                  }
                                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                                    service!.isActive
                                      ? "bg-teal-50 text-teal-700 hover:bg-red-50 hover:text-red-600"
                                      : "bg-stone-100 text-stone-400 hover:bg-teal-50 hover:text-teal-600"
                                  }`}
                                >
                                  {service!.isActive ? "Active" : "Inactive"}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => {
                                    setEditingId(service!.id);
                                    setEditForm({
                                      name: service!.name,
                                      category: service!.category,
                                      durationMins: service!.durationMins,
                                      price: service!.price,
                                      description: service!.description ?? "",
                                    });
                                  }}
                                  className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                                >
                                  Edit
                                </button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
