"use client";

import { useEffect } from "react";
import Link from "next/link";
import { formatRand } from "@/lib/format";
import { GalleryImage } from "./GalleryImage";
import type { GalleryItemData } from "./GalleryCard";

export function GalleryDetail({ item, onClose }: { item: GalleryItemData; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={item.title} className="fixed inset-0 z-50" onClick={onClose}>
      <div className="fade-in absolute inset-0 bg-ink/80" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-up absolute inset-x-0 bottom-0 max-h-[92dvh] overflow-y-auto rounded-t-md bg-paper md:inset-auto md:left-1/2 md:top-1/2 md:grid md:w-[min(760px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:grid-cols-2 md:overflow-hidden md:rounded-sm"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink shadow-card backdrop-blur transition-colors hover:bg-paper"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>

        <div className="aspect-[4/3] md:aspect-auto md:h-full">
          <GalleryImage src={item.imageUrl} alt={item.title} category={item.category} />
        </div>

        <div className="flex flex-col p-6 md:p-8" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
          <p className="eyebrow">{item.category}</p>
          <h2 className="display-md mt-2">{item.title}</h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted">
            {item.therapist} · {item.durationMins} min
          </p>
          {item.description && <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{item.description}</p>}
          <div className="mt-auto pt-6">
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted">From</div>
            <div className="font-display text-[30px] text-ink">{formatRand(item.price)}</div>
            <Link href={`/book?category=${encodeURIComponent(item.category)}`} className="btn-primary mt-4 w-full">
              Book this look
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
