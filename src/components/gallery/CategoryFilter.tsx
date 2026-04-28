"use client";

const FILTERS = ["All", "Nails", "Facials", "Lashes", "Waxing", "Massage"];

interface CategoryFilterProps {
  active: string;
  onChange: (cat: string) => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div style={{
      display: "flex",
      overflowX: "auto",
      scrollbarWidth: "none",
      paddingBottom: 2,
      gap: 0,
      msOverflowStyle: "none",
    }}>
      {FILTERS.map((f, i) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`gallery-filter-item${active === f ? " active" : ""}`}
          style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 11,
            fontWeight: active === f ? 500 : 300,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: active === f ? "var(--gold-400)" : "var(--onyx-500)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            paddingLeft: i === 0 ? 0 : 14,
            paddingRight: 2,
            whiteSpace: "nowrap",
            transition: "color 0.18s ease",
          }}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
