"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { Avatar } from "@/components/ui/Avatar";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;
const COLORS = ["#d41d7f", "#232122", "#c98d82", "#8d8e8f", "#6366f1", "#f97316", "#06b6d4", "#84cc16", "#10b981"];
const DAYS = [
  ["mon", "Mon"], ["tue", "Tue"], ["wed", "Wed"], ["thu", "Thu"], ["fri", "Fri"], ["sat", "Sat"], ["sun", "Sun"],
] as const;

type Hours = Record<string, { open: string; close: string } | null>;
type Draft = { name: string; email: string; bio: string; color: string; imageUrl: string | null; serviceIds: string[]; hours: Hours };

const DEFAULT_HOURS: Hours = {
  mon: { open: "09:00", close: "17:00" }, tue: { open: "09:00", close: "17:00" }, wed: { open: "09:00", close: "17:00" },
  thu: { open: "09:00", close: "17:00" }, fri: { open: "09:00", close: "17:00" }, sat: { open: "08:00", close: "14:00" }, sun: null,
};

const input = "w-full rounded-sm border border-[#efdcd8] bg-[#faf6f5] px-3 py-2 text-[14px] text-[#232122] outline-none focus:border-[#fe329c]";
const label = "mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-[#c98d82]";

type ServiceRow = { id: string; name: string; category: string };

function groupServices(services: ServiceRow[]) {
  const map = new Map<string, ServiceRow[]>();
  for (const s of services) map.set(s.category, [...(map.get(s.category) ?? []), s]);
  return Array.from(map.entries());
}

function TherapistForm({
  draft,
  services,
  onChange,
  onSave,
  onCancel,
  saving,
  isNew,
}: {
  draft: Draft;
  services: ServiceRow[];
  onChange: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isNew: boolean;
}) {
  const groups = useMemo(() => groupServices(services), [services]);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => onChange({ ...draft, [k]: v });
  const toggleService = (id: string) =>
    set("serviceIds", draft.serviceIds.includes(id) ? draft.serviceIds.filter((x) => x !== id) : [...draft.serviceIds, id]);
  const toggleCategory = (rows: ServiceRow[]) => {
    const ids = rows.map((r) => r.id);
    const all = ids.every((id) => draft.serviceIds.includes(id));
    set("serviceIds", all ? draft.serviceIds.filter((id) => !ids.includes(id)) : Array.from(new Set([...draft.serviceIds, ...ids])));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Full name</label>
          <input className={input} value={draft.name} onChange={(e) => set("name", e.target.value)} disabled={!isNew} />
        </div>
        <div>
          <label className={label}>Email</label>
          <input className={input} type="email" value={draft.email} onChange={(e) => set("email", e.target.value)} disabled={!isNew} />
        </div>
      </div>
      <div>
        <label className={label}>Bio</label>
        <textarea className={input} rows={3} value={draft.bio} onChange={(e) => set("bio", e.target.value)} placeholder="A sentence or two clients will read when choosing their therapist." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ImageUpload folder="staff" label="Photo" value={draft.imageUrl} onUploaded={(url) => set("imageUrl", url)} />
        <div>
          <label className={label}>Colour (used when there is no photo)</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => set("color", c)} className="h-7 w-7 rounded-full border-2" style={{ background: c, borderColor: draft.color === c ? "#232122" : "transparent" }} aria-label={c} />
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className={label}>Working hours</label>
        <div className="grid gap-2">
          {DAYS.map(([key, name]) => {
            const h = draft.hours[key] ?? null;
            return (
              <div key={key} className="grid grid-cols-[44px_70px_1fr_1fr] items-center gap-3 text-[13px]">
                <span className="text-[#232122]">{name}</span>
                <label className="flex items-center gap-1.5 text-[12px] text-[#8d8e8f]">
                  <input type="checkbox" checked={!!h} onChange={(e) => set("hours", { ...draft.hours, [key]: e.target.checked ? { open: "09:00", close: "17:00" } : null })} className="accent-[#fe329c]" />
                  Open
                </label>
                <input type="time" className={input} disabled={!h} value={h?.open ?? ""} onChange={(e) => set("hours", { ...draft.hours, [key]: { open: e.target.value, close: h?.close ?? "17:00" } })} />
                <input type="time" className={input} disabled={!h} value={h?.close ?? ""} onChange={(e) => set("hours", { ...draft.hours, [key]: { open: h?.open ?? "09:00", close: e.target.value } })} />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className={label}>Treatments this therapist offers</label>
        <div className="max-h-72 overflow-y-auto rounded-sm border border-[#efdcd8] bg-white p-3">
          {groups.map(([category, rows]) => {
            const all = rows.every((r) => draft.serviceIds.includes(r.id));
            return (
              <div key={category} className="mb-3">
                <label className="flex items-center gap-2 text-[12px] uppercase tracking-[0.08em] text-[#232122]">
                  <input type="checkbox" checked={all} onChange={() => toggleCategory(rows)} className="accent-[#fe329c]" />
                  {category}
                </label>
                <div className="mt-1.5 grid grid-cols-1 gap-1 pl-5 sm:grid-cols-2">
                  {rows.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 text-[13px] text-[#4a4547]">
                      <input type="checkbox" checked={draft.serviceIds.includes(s.id)} onChange={() => toggleService(s.id)} className="accent-[#fe329c]" />
                      {s.name}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-1 text-[11px] text-[#8d8e8f]">{draft.serviceIds.length} selected. Clients only see this therapist for treatments ticked here.</p>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onSave} disabled={saving || !draft.name || !draft.email} className="rounded-sm bg-[#232122] px-5 py-2 text-[12px] uppercase tracking-[0.1em] text-white disabled:opacity-50">
          {saving ? "Saving…" : isNew ? "Add therapist" : "Save"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-sm border border-[#efdcd8] px-5 py-2 text-[12px] uppercase tracking-[0.1em] text-[#4a4547]">
          Cancel
        </button>
      </div>
    </div>
  );
}

const EMPTY: Draft = { name: "", email: "", bio: "", color: COLORS[0], imageUrl: null, serviceIds: [], hours: DEFAULT_HOURS };

export default function StaffPage() {
  const utils = trpc.useUtils();
  const { data: staff, isLoading } = trpc.staff.list.useQuery({ spaId: SPA_ID }, { enabled: !!SPA_ID });
  const { data: services } = trpc.services.list.useQuery({ spaId: SPA_ID }, { enabled: !!SPA_ID });
  const refresh = () => utils.staff.list.invalidate();
  const create = trpc.staff.create.useMutation({ onSuccess: () => { refresh(); setAdding(false); } });
  const update = trpc.staff.update.useMutation({ onSuccess: () => { refresh(); setEditingId(null); } });
  const remove = trpc.staff.remove.useMutation({ onSuccess: refresh });

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);

  const serviceRows: ServiceRow[] = (services ?? []).map((s) => ({ id: s.id, name: s.name, category: s.category }));

  function startEdit(member: NonNullable<typeof staff>[number]) {
    setAdding(false);
    setEditingId(member.id);
    setDraft({
      name: member.user.name ?? "",
      email: member.user.email ?? "",
      bio: member.bio ?? "",
      color: member.color,
      imageUrl: member.user.image,
      serviceIds: member.services.map((s) => s.serviceId),
      hours: { ...DEFAULT_HOURS, ...((member.workingHours as Hours) ?? {}) },
    });
  }

  function saveEdit() {
    if (!editingId) return;
    update.mutate({
      id: editingId,
      bio: draft.bio,
      color: draft.color,
      imageUrl: draft.imageUrl,
      serviceIds: draft.serviceIds,
      workingHours: draft.hours,
    });
  }

  function saveNew() {
    create.mutate({ spaId: SPA_ID, name: draft.name, email: draft.email, bio: draft.bio, color: draft.color, imageUrl: draft.imageUrl ?? undefined, serviceIds: draft.serviceIds });
  }

  return (
    <div className="flex min-h-screen bg-[#faf6f5]">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[28px] text-[#232122]">Therapists</h2>
            <p className="mt-1 text-[13px] text-[#8d8e8f]">Photos, bios, working hours and which treatments each person offers.</p>
          </div>
          {!adding && (
            <button onClick={() => { setEditingId(null); setDraft(EMPTY); setAdding(true); }} className="rounded-sm bg-[#232122] px-5 py-2.5 text-[12px] uppercase tracking-[0.1em] text-white">
              + Add therapist
            </button>
          )}
        </div>

        {adding && (
          <div className="mb-6 max-w-3xl rounded-sm border border-[#efdcd8] bg-white p-6">
            <h3 className="mb-5 text-[13px] uppercase tracking-[0.1em] text-[#232122]">New therapist</h3>
            <TherapistForm draft={draft} services={serviceRows} onChange={setDraft} onSave={saveNew} onCancel={() => setAdding(false)} saving={create.isPending} isNew />
            {create.error && <p className="mt-3 text-[13px] text-[#d41d7f]">{create.error.message}</p>}
          </div>
        )}

        {isLoading ? (
          <p className="text-[14px] text-[#8d8e8f]">Loading therapists…</p>
        ) : !staff?.length ? (
          <div className="rounded-sm border border-[#efdcd8] bg-white p-12 text-center text-[#8d8e8f]">No therapists yet. Add your first one above.</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {staff.map((member) => (
              <div key={member.id} className="rounded-sm border border-[#efdcd8] bg-white">
                <div className="h-1" style={{ background: member.color }} />
                <div className="p-6">
                  {editingId === member.id ? (
                    <>
                      <TherapistForm draft={draft} services={serviceRows} onChange={setDraft} onSave={saveEdit} onCancel={() => setEditingId(null)} saving={update.isPending} isNew={false} />
                      {update.error && <p className="mt-3 text-[13px] text-[#d41d7f]">{update.error.message}</p>}
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-4">
                        <Avatar name={member.user.name ?? "?"} imageUrl={member.user.image} color={member.color} size="lg" />
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-display text-[20px] text-[#232122]">{member.user.name}</h3>
                          <p className="truncate text-[13px] text-[#8d8e8f]">{member.user.email}</p>
                          <p className="mt-2 text-[13px] leading-relaxed text-[#4a4547]">{member.bio || <span className="italic text-[#8d8e8f]">No bio yet</span>}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {Array.from(new Set(member.services.map((s) => s.service.category))).map((c) => (
                          <span key={c} className="rounded-sm border border-[#efdcd8] px-2 py-0.5 text-[11px] text-[#4a4547]">{c}</span>
                        ))}
                        <span className="px-1 py-0.5 text-[11px] text-[#8d8e8f]">{member.services.length} treatments</span>
                      </div>
                      <div className="mt-5 flex items-center gap-4 text-[13px]">
                        <button onClick={() => startEdit(member)} className="text-[#d41d7f] hover:underline">Edit</button>
                        <Link href={`/dashboard/staff/${member.id}`} className="text-[#4a4547] hover:underline">Analytics</Link>
                        <button
                          onClick={() => window.confirm(`Remove ${member.user.name}? Their past bookings are kept.`) && remove.mutate({ id: member.id })}
                          className="ml-auto text-[#8d8e8f] hover:text-[#d41d7f]"
                        >
                          Remove
                        </button>
                      </div>
                    </>
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
