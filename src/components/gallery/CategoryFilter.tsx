"use client";

const DEFAULT_FILTERS = ["All", "Nails", "Facials", "Lashes", "Waxing", "Massage"];

interface CategoryFilterProps {
  active: string;
  onChange: (cat: string) => void;
  categories?: string[];
}

export function CategoryFilter({ active, onChange, categories }: CategoryFilterProps) {
  const FILTERS = categories ?? DEFAULT_FILTERS;
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
            fontFamily: "var(--font-abel), Abel, sans-serif",
            fontSize: 11,
            fontWeight: 400,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: active === f ? "#fe329c" : "#8d8e8f",
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
