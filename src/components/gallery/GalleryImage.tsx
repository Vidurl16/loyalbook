export function GalleryImage({ src, alt, category }: { src?: string | null; alt: string; category: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.03]" />;
  }
  return (
    <div className="flex h-full w-full items-center justify-center bg-blush-tint">
      <span className="font-display text-[14px] uppercase tracking-[0.3em] text-blush-deep">{category}</span>
    </div>
  );
}
