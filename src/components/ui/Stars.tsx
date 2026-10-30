export function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} out of 5`} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} className="h-3.5 w-3.5" viewBox="0 0 20 20" fill={n <= rating ? "#fe329c" : "#efdcd8"}>
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L10 14.9l-5.3 2.8 1.1-5.9L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}
