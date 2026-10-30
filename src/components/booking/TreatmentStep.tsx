"use client";

import { useMemo, useState } from "react";
import { formatRand } from "@/lib/format";
import { CardListSkeleton } from "@/components/ui/Skeleton";
import { StepHeading } from "./StepHeading";

export type ServiceRow = {
  id: string;
  name: string;
  category: string;
  durationMins: number;
  price: number;
  description?: string | null;
};

function groupByCategory(services: ServiceRow[]) {
  const groups = new Map<string, ServiceRow[]>();
  for (const s of services) groups.set(s.category, [...(groups.get(s.category) ?? []), s]);
  return Array.from(groups.entries());
}

function matches(s: ServiceRow, q: string) {
  const hay = `${s.name} ${s.category} ${s.description ?? ""}`.toLowerCase();
  return q.split(/\s+/).every((w) => hay.includes(w));
}

export function TreatmentStep({
  services,
  loading,
  initialCategory,
  onlyServiceIds,
  therapistName,
  onSelect,
}: {
  services: ServiceRow[];
  loading: boolean;
  initialCategory?: string;
  onlyServiceIds?: string[];
  therapistName?: string;
  onSelect: (serviceId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "All");

  const visible = useMemo(() => {
    const allowed = onlyServiceIds ? new Set(onlyServiceIds) : null;
    return services.filter((s) => !allowed || allowed.has(s.id));
  }, [services, onlyServiceIds]);

  const categories = useMemo(() => ["All", ...Array.from(new Set(visible.map((s) => s.category)))], [visible]);
  const q = query.trim().toLowerCase();
  const browsingAll = !q && category === "All" && categories.length > 2;
  const filtered = visible.filter((s) => (q ? matches(s, q) : category === "All" || s.category === category));
  const groups = groupByCategory(filtered);
  const overview = groupByCategory(visible).map(([name, rows]) => ({
    name,
    count: rows.length,
    from: Math.min(...rows.map((r) => r.price)),
  }));

  return (
    <section>
      <StepHeading
        step={1}
        title="Choose a treatment"
        lede={therapistName ? `Showing treatments ${therapistName.split(" ")[0]} offers.` : "Full menu with prices. Tap a treatment to continue."}
      />

      <div className="relative">
        <svg className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search treatments"
          className="field pl-11"
          aria-label="Search treatments"
        />
      </div>

      {!q && categories.length > 2 && (
        <div className="no-scrollbar sticky top-14 z-10 -mx-5 flex gap-2 overflow-x-auto bg-paper/95 px-5 py-3 backdrop-blur-md md:top-16">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`chip ${category === c ? "chip-active" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="mt-4">
          <CardListSkeleton rows={6} />
        </div>
      ) : browsingAll ? (
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {overview.map((c, i) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setCategory(c.name)}
              className="card-interactive rise flex flex-col justify-between gap-6 p-5 text-left"
              style={{ "--i": i } as React.CSSProperties}
            >
              <span className="font-display text-[19px] leading-tight text-ink">{c.name}</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted">
                {c.count} treatments · from {formatRand(c.from)}
              </span>
            </button>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <p className="py-16 text-center font-display text-[20px] text-muted">No treatments match “{query}”.</p>
      ) : (
        <div className="mt-2 flex flex-col gap-8">
          {groups.map(([name, rows]) => (
            <div key={name}>
              <div className="mb-3 flex items-baseline justify-between">
                <h2 className="font-display text-[22px] text-ink">{name}</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted">{rows.length}</span>
              </div>
              <ul className="card divide-y divide-hairline">
                {rows.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(s.id)}
                      className="group flex w-full items-start justify-between gap-5 px-5 py-4 text-left transition-colors hover:bg-shell"
                    >
                      <span className="min-w-0">
                        <span className="block font-display text-[17px] leading-snug text-ink group-hover:text-pink-dark">{s.name}</span>
                        {s.description && <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-muted">{s.description}</span>}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[15px] text-ink">{formatRand(s.price)}</span>
                        <span className="block text-[10px] uppercase tracking-[0.18em] text-muted">{s.durationMins} min</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
