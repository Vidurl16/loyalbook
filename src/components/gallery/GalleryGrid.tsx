"use client";

import { GalleryCard, type GalleryItemData } from "./GalleryCard";

interface GalleryGridProps {
  items: GalleryItemData[];
  onTap: (item: GalleryItemData) => void;
}

export function GalleryGrid({ items, onTap }: GalleryGridProps) {
  const left = items.filter((_, i) => i % 2 === 0);
  const right = items.filter((_, i) => i % 2 === 1);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 8,
      padding: "6px 12px 48px",
    }}>
      {/* Left column */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {left.map((item, i) => (
          <GalleryCard key={item.id} item={item} index={i * 2} onTap={onTap} />
        ))}
      </div>
      {/* Right column — editorial stagger */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 20 }}>
        {right.map((item, i) => (
          <GalleryCard key={item.id} item={item} index={i * 2 + 1} onTap={onTap} />
        ))}
      </div>
    </div>
  );
}
