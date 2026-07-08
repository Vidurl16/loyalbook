"use client";

import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { useState } from "react";
import { ImageUpload } from "@/components/dashboard/ImageUpload";

const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID!;

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/clients", label: "Guests", icon: "👥" },
  { href: "/dashboard/services", label: "Treatments", icon: "🌿" },
  { href: "/dashboard/staff", label: "Therapists", icon: "🧖‍♀️" },
  { href: "/dashboard/gallery", label: "Gallery", icon: "🖼️" },
  { href: "/dashboard/reviews", label: "Reviews", icon: "⭐" },
  { href: "/dashboard/loyalty", label: "Loyalty", icon: "✨" },
  { href: "/dashboard/vouchers", label: "Vouchers", icon: "🎟️" },
  { href: "/dashboard/marketing", label: "Marketing", icon: "✉️" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

const empty = { category: "", title: "", therapist: "", price: 0, durationMins: 0, description: "", imageUrl: "" };

export default function GalleryAdminPage() {
  const utils = trpc.useUtils();
  const { data: items } = trpc.gallery.adminList.useQuery({ locationId: LOCATION_ID });
  const [form, setForm] = useState(empty);

  const invalidate = () => utils.gallery.adminList.invalidate();
  const create = trpc.gallery.create.useMutation({ onSuccess: () => { invalidate(); setForm(empty); } });
  const update = trpc.gallery.update.useMutation({ onSuccess: invalidate });
  const del = trpc.gallery.delete.useMutation({ onSuccess: invalidate });

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      <aside className="w-60 bg-white border-r border-stone-100 p-6 flex flex-col gap-0.5 shrink-0">
        <Link href="/" className="font-display text-xl font-bold text-teal-700 mb-8 block">Perfect 10</Link>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 text-sm rounded-xl px-3 py-2.5 transition-colors ${item.href === "/dashboard/gallery" ? "bg-teal-50 text-teal-700 font-medium" : "text-stone-500 hover:text-teal-700 hover:bg-stone-50"}`}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 p-8 max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">Gallery</h1>
        <p className="text-stone-400 text-sm mb-8">Curate the lookbook clients see. Only published items appear on the site.</p>

        {/* Add form */}
        <form
          className="bg-white rounded-2xl border border-stone-100 p-6 mb-8 grid grid-cols-2 gap-4"
          onSubmit={(e) => { e.preventDefault(); create.mutate({ locationId: LOCATION_ID, ...form, imageUrl: form.imageUrl || undefined }); }}
        >
          <div className="col-span-2"><ImageUpload folder="gallery" value={form.imageUrl} onUploaded={(url) => setForm((f) => ({ ...f, imageUrl: url }))} label="Photo" /></div>
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-teal-500" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-teal-500" />
          <input placeholder="Therapist" value={form.therapist} onChange={(e) => setForm((f) => ({ ...f, therapist: e.target.value }))} className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-teal-500" />
          <input type="number" placeholder="Price (R)" value={form.price || ""} onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))} className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-teal-500" />
          <button type="submit" disabled={create.isPending} className="col-span-2 py-3 text-sm font-semibold text-white rounded-lg disabled:opacity-40" style={{ background: "#0d9488" }}>
            {create.isPending ? "Adding…" : "Add to gallery"}
          </button>
        </form>

        {/* List */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {items?.map((it) => (
            <div key={it.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="h-32 bg-stone-100">
                {it.imageUrl && /* eslint-disable-next-line @next/next/no-img-element */ <img src={it.imageUrl} alt={it.title} className="w-full h-full object-cover" />}
              </div>
              <div className="p-3">
                <div className="font-medium text-stone-900 text-sm truncate">{it.title}</div>
                <div className="text-xs text-stone-400 mb-2">{it.category}</div>
                <div className="flex items-center justify-between">
                  <button onClick={() => update.mutate({ id: it.id, isPublished: !it.isPublished })} className={`text-xs font-medium ${it.isPublished ? "text-teal-700" : "text-stone-400"}`}>
                    {it.isPublished ? "● Published" : "○ Hidden"}
                  </button>
                  <button onClick={() => del.mutate({ id: it.id })} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items?.length === 0 && <p className="text-stone-400 text-sm">No gallery items yet.</p>}
      </main>
    </div>
  );
}
