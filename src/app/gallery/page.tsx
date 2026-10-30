"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { GalleryCard, type GalleryItemData } from "@/components/gallery/GalleryCard";
import { GalleryDetail } from "@/components/gallery/GalleryDetail";
import { Skeleton } from "@/components/ui/Skeleton";

const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID ?? "";

function EmptyGallery() {
  return (
    <div className="flex flex-col items-center py-20 text-center">
      <span className="hairline mb-8 w-10" />
      <h2 className="display-md">The gallery is being curated.</h2>
      <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-ink-soft">
        Real results from real clients will appear here, each shared with permission.
      </p>
      <Link href="/book" className="btn-primary mt-8">
        Book a treatment
      </Link>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className={i % 3 === 0 ? "aspect-[4/5]" : "aspect-square"} />
      ))}
    </div>
  );
}

export default function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<GalleryItemData | null>(null);

  const { data: items, isLoading } = trpc.gallery.list.useQuery({ locationId: LOCATION_ID }, { enabled: !!LOCATION_ID });

  const categories = useMemo(() => ["All", ...Array.from(new Set((items ?? []).map((i) => i.category)))], [items]);
  const visible = (items ?? []).filter((i) => filter === "All" || i.category === filter);

  return (
    <main className="container-x pb-16 pt-8 md:pt-12">
      <header className="mb-6 max-w-2xl">
        <p className="eyebrow mb-3">The gallery</p>
        <h1 className="display-lg">Real results, real clients.</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Every photo is a treatment done here. Tap one to meet the therapist behind it and book the same look.
        </p>
      </header>

      {categories.length > 2 && (
        <div className="no-scrollbar sticky top-14 z-10 -mx-5 mb-5 flex gap-2 overflow-x-auto bg-paper/95 px-5 py-3 backdrop-blur-md md:top-16">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setFilter(c)} className={`chip ${filter === c ? "chip-active" : ""}`}>
              {c}
            </button>
          ))}
        </div>
      )}

      {isLoading && LOCATION_ID ? (
        <GridSkeleton />
      ) : visible.length === 0 ? (
        <EmptyGallery />
      ) : (
        <div className="columns-2 gap-3 md:columns-3 [&>*]:mb-3">
          {visible.map((item, i) => (
            <GalleryCard key={item.id} item={item} index={i} onOpen={() => setOpen(item)} />
          ))}
        </div>
      )}

      {open && <GalleryDetail item={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
