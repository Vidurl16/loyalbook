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

const empty = { authorName: "", rating: 5, body: "", serviceName: "", therapist: "", imageUrl: "", consentToPublish: true };

export default function ReviewsAdminPage() {
  const utils = trpc.useUtils();
  const { data: reviews } = trpc.reviews.adminList.useQuery({ locationId: LOCATION_ID });
  const [form, setForm] = useState(empty);

  const invalidate = () => utils.reviews.adminList.invalidate();
  const create = trpc.reviews.create.useMutation({ onSuccess: () => { invalidate(); setForm(empty); } });
  const update = trpc.reviews.update.useMutation({ onSuccess: invalidate });
  const del = trpc.reviews.delete.useMutation({ onSuccess: invalidate });

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      <aside className="w-60 bg-white border-r border-stone-100 p-6 flex flex-col gap-0.5 shrink-0">
        <Link href="/" className="font-display text-xl font-bold text-teal-700 mb-8 block">Perfect 10</Link>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={`flex items-center gap-2.5 text-sm rounded-xl px-3 py-2.5 transition-colors ${item.href === "/dashboard/reviews" ? "bg-teal-50 text-teal-700 font-medium" : "text-stone-500 hover:text-teal-700 hover:bg-stone-50"}`}>
            <span>{item.icon}</span>{item.label}
          </Link>
        ))}
      </aside>

      <main className="flex-1 p-8 max-w-3xl">
        <h1 className="font-display text-2xl font-bold text-stone-900 mb-2">Client Reviews</h1>
        <p className="text-stone-400 text-sm mb-8">Add reviews on behalf of clients. Only add with the client&apos;s permission — the consent box records that.</p>

        <form
          className="bg-white rounded-2xl border border-stone-100 p-6 mb-8 grid grid-cols-2 gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.consentToPublish) return;
            create.mutate({ locationId: LOCATION_ID, ...form, imageUrl: form.imageUrl || undefined });
          }}
        >
          <input required placeholder="Client name" value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-teal-500" />
          <select value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-teal-500">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n === 1 ? "" : "s"}</option>)}
          </select>
          <textarea required placeholder="Review" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} rows={3} className="col-span-2 border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-teal-500" />
          <input placeholder="Treatment (optional)" value={form.serviceName} onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))} className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-teal-500" />
          <input placeholder="Therapist (optional)" value={form.therapist} onChange={(e) => setForm((f) => ({ ...f, therapist: e.target.value }))} className="border border-stone-200 rounded-lg px-3 py-2.5 text-sm text-stone-900 outline-none focus:border-teal-500" />
          <div className="col-span-2"><ImageUpload folder="reviews" value={form.imageUrl} onUploaded={(url) => setForm((f) => ({ ...f, imageUrl: url }))} label="Photo (optional)" /></div>
          <label className="col-span-2 flex items-center gap-2 text-sm text-stone-600">
            <input type="checkbox" checked={form.consentToPublish} onChange={(e) => setForm((f) => ({ ...f, consentToPublish: e.target.checked }))} />
            I have this client&apos;s permission to publish their review and photo.
          </label>
          <button type="submit" disabled={create.isPending || !form.consentToPublish} className="col-span-2 py-3 text-sm font-semibold text-white rounded-lg disabled:opacity-40" style={{ background: "#0d9488" }}>
            {create.isPending ? "Adding…" : "Add review"}
          </button>
        </form>

        <div className="space-y-3">
          {reviews?.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-stone-100 p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-stone-900 text-sm">{r.authorName}</span>
                  <span className="text-amber-500 text-xs">{"★".repeat(r.rating)}</span>
                </div>
                <p className="text-sm text-stone-500">{r.body}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button onClick={() => update.mutate({ id: r.id, isPublished: !r.isPublished })} className={`text-xs font-medium ${r.isPublished ? "text-teal-700" : "text-stone-400"}`}>
                  {r.isPublished ? "● Published" : "○ Hidden"}
                </button>
                <button onClick={() => del.mutate({ id: r.id })} className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
          ))}
          {reviews?.length === 0 && <p className="text-stone-400 text-sm">No reviews yet.</p>}
        </div>
      </main>
    </div>
  );
}
