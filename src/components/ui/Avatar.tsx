const SIZE = {
  sm: "h-9 w-9 text-[14px]",
  md: "h-12 w-12 text-[17px]",
  lg: "h-20 w-20 text-[26px]",
};

export function Avatar({
  name,
  imageUrl,
  color,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  color?: string | null;
  size?: keyof typeof SIZE;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  if (imageUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={imageUrl} alt={name} className={`${SIZE[size]} shrink-0 rounded-full object-cover`} />;
  }

  return (
    <span
      className={`${SIZE[size]} flex shrink-0 items-center justify-center rounded-full font-display text-paper`}
      style={{ background: color ?? "#c98d82" }}
    >
      {initials}
    </span>
  );
}
