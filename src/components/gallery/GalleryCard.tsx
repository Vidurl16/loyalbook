"use client";

import { formatRand } from "@/lib/format";
import { GalleryImage } from "./GalleryImage";

export interface GalleryItemData {
  id: string;
  category: string;
  title: string;
  therapist: string;
  price: number;
  durationMins: number;
  description?: string | null;
  imageUrl?: string | null;
  isTall: boolean;
  sortOrder: number;
}

export function GalleryCard({ item, index, onOpen }: { item: GalleryItemData; index: number; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="card-interactive rise block w-full break-inside-avoid overflow-hidden text-left"
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className={`relative overflow-hidden ${item.isTall ? "aspect-[4/5]" : "aspect-square"}`}>
        <GalleryImage src={item.imageUrl} alt={item.title} category={item.category} />
        <span className="absolute left-3 top-3 rounded-sm bg-paper/90 px-2 py-1 text-[9px] uppercase tracking-[0.2em] text-blush-deep backdrop-blur">
          {item.category}
        </span>
      </div>
      <div className="p-3.5">
        <div className="font-display text-[16px] leading-tight text-ink">{item.title}</div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-muted">
          <span>{item.therapist}</span>
          <span className="text-ink">{formatRand(item.price)}</span>
        </div>
      </div>
    </button>
  );
}
