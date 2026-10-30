"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { Spa } from "@prisma/client";
import { DashboardSidebar } from "@/components/dashboard/Sidebar";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { trpc } from "@/lib/trpc";
import { websiteFromSettings, type WebsiteSettings } from "@/lib/websiteSettings";

const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID ?? "";

const TIMEZONES = ["Africa/Johannesburg", "Africa/Cairo", "Africa/Lagos", "Europe/London", "Europe/Paris", "Asia/Dubai"];
const CURRENCIES = ["ZAR", "USD", "EUR", "GBP", "AED"];

type Prize = { label: string; weight: number; win: boolean };

const input = "w-full rounded-sm border border-[#efdcd8] bg-[#faf6f5] px-3 py-2.5 text-[14px] text-[#232122] outline-none focus:border-[#fe329c]";
const label = "mb-2 block text-[11px] uppercase tracking-[0.1em] text-[#c98d82]";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sm border border-[#efdcd8] bg-white p-6">
      <h3 className="text-[13px] uppercase tracking-[0.1em] text-[#232122]">{title}</h3>
      {hint && <p className="mt-1 text-[12px] text-[#8d8e8f]">{hint}</p>}
      <div className="mt-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  useSession({ required: true });
  const { data: spa, isLoading } = trpc.spa.get.useQuery({ spaId: SPA_ID }, { enabled: !!SPA_ID });

  return (
    <div className="flex min-h-screen bg-[#faf6f5]">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto p-8">
        <div className="mb-8">
          <h2 className="font-display text-[28px] text-[#232122]">Settings</h2>
          <p className="mt-1 text-[13px] text-[#8d8e8f]">Everything clients see on the website is edited here, no developer needed.</p>
        </div>
        {isLoading || !spa ? <p className="text-[14px] text-[#8d8e8f]">Loading…</p> : <SettingsForm key={spa.id} spa={spa} />}
      </main>
    </div>
  );
}

function SettingsForm({ spa }: { spa: Spa }) {
  const utils = trpc.useUtils();
  const updateSpa = trpc.spa.update.useMutation({ onSuccess: () => utils.spa.get.invalidate() });

  const [details, setDetails] = useState({ name: spa.name ?? "", address: spa.address ?? "", timezone: spa.timezone, currency: spa.currency });
  const [website, setWebsite] = useState<WebsiteSettings>(() => websiteFromSettings(spa.settings));
  const [prizes, setPrizes] = useState<Prize[]>(() => {
    const raw = (spa.settings as { mysteryPrizes?: Prize[] } | null)?.mysteryPrizes;
    return Array.isArray(raw) ? raw : [];
  });
  const [saved, setSaved] = useState(false);

  async function save() {
    await updateSpa.mutateAsync({ spaId: SPA_ID, ...details, website, mysteryPrizes: prizes });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const setW = (k: keyof WebsiteSettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setWebsite((w) => ({ ...w, [k]: e.target.value }));

  return (
          <div className="flex max-w-2xl flex-col gap-6">
            <Section title="Salon details">
              <div>
                <label className={label}>Salon name</label>
                <input className={input} value={details.name} onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))} />
              </div>
              <div>
                <label className={label}>Address</label>
                <textarea className={input} rows={2} value={details.address} onChange={(e) => setDetails((d) => ({ ...d, address: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Timezone</label>
                  <select className={input} value={details.timezone} onChange={(e) => setDetails((d) => ({ ...d, timezone: e.target.value }))}>
                    {TIMEZONES.map((tz) => (
                      <option key={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Currency</label>
                  <select className={input} value={details.currency} onChange={(e) => setDetails((d) => ({ ...d, currency: e.target.value }))}>
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Section>

            <Section title="Website" hint="Home page wording, contact details and the hero photo.">
              <div>
                <label className={label}>Headline</label>
                <textarea className={input} rows={2} value={website.headline} onChange={setW("headline")} />
                <p className="mt-1 text-[11px] text-[#8d8e8f]">Press Enter to control the line break.</p>
              </div>
              <div>
                <label className={label}>Introduction</label>
                <textarea className={input} rows={3} value={website.intro} onChange={setW("intro")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Phone</label>
                  <input className={input} value={website.phone} onChange={setW("phone")} placeholder="+27 31 000 0000" />
                </div>
                <div>
                  <label className={label}>Instagram handle</label>
                  <input className={input} value={website.instagram} onChange={setW("instagram")} placeholder="vivacious_hairandbeauty" />
                </div>
              </div>
              <div>
                <label className={label}>Opening hours</label>
                <textarea className={input} rows={3} value={website.hours} onChange={setW("hours")} placeholder={"Mon–Fri 08:30–17:30\nSat 08:00–14:00\nSun closed"} />
              </div>
              <ImageUpload folder="site" label="Hero photo" value={website.heroImageUrl} onUploaded={(url) => setWebsite((w) => ({ ...w, heroImageUrl: url }))} />
            </Section>

            <Section title="Mystery shopper rewards" hint="What an entrant can be drawn for. Weight is how likely it is relative to the others. Leave empty to use the defaults.">
              {prizes.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_70px_32px] items-end gap-3">
                  <div>
                    <label className={label}>Reward</label>
                    <input className={input} value={p.label} onChange={(e) => setPrizes((ps) => ps.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  </div>
                  <div>
                    <label className={label}>Weight</label>
                    <input className={input} type="number" min={0} value={p.weight} onChange={(e) => setPrizes((ps) => ps.map((x, j) => (j === i ? { ...x, weight: Number(e.target.value) } : x)))} />
                  </div>
                  <label className="flex items-center gap-2 pb-3 text-[12px] text-[#4a4547]">
                    <input type="checkbox" checked={p.win} onChange={(e) => setPrizes((ps) => ps.map((x, j) => (j === i ? { ...x, win: e.target.checked } : x)))} className="accent-[#fe329c]" />
                    Win
                  </label>
                  <button type="button" onClick={() => setPrizes((ps) => ps.filter((_, j) => j !== i))} className="pb-2.5 text-[#8d8e8f] hover:text-[#d41d7f]" aria-label="Remove">
                    ✕
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setPrizes((ps) => [...ps, { label: "", weight: 1, win: true }])} className="self-start text-[12px] tracking-[0.06em] text-[#d41d7f] hover:underline">
                + Add a reward
              </button>
            </Section>

            <div className="flex items-center gap-4">
              <button onClick={save} disabled={updateSpa.isPending} className="rounded-sm bg-[#232122] px-7 py-3 text-[12px] uppercase tracking-[0.1em] text-white disabled:opacity-60">
                {updateSpa.isPending ? "Saving…" : "Save changes"}
              </button>
              {saved && <span className="text-[13px] text-[#d41d7f]">✓ Saved. The website updates straight away.</span>}
              {updateSpa.isError && <span className="text-[13px] text-red-600">Failed to save. Try again.</span>}
            </div>
          </div>
  );
}
