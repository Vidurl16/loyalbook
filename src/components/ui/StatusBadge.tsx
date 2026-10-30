const STATUS: Record<string, { label: string; tone: "accent" | "neutral" | "quiet" }> = {
  pending: { label: "Awaiting confirmation", tone: "neutral" },
  confirmed: { label: "Confirmed", tone: "accent" },
  completed: { label: "Completed", tone: "neutral" },
  no_show: { label: "No show", tone: "quiet" },
  cancelled_by_client: { label: "Cancelled", tone: "quiet" },
  cancelled_by_spa: { label: "Cancelled", tone: "quiet" },
};

const TONE = {
  accent: "border-pink/30 bg-pink/8 text-pink-dark",
  neutral: "border-hairline bg-shell text-ink-soft",
  quiet: "border-hairline bg-paper text-muted",
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS[status] ?? { label: status, tone: "quiet" as const };
  return (
    <span className={`inline-flex rounded-sm border px-2 py-1 text-[9px] uppercase tracking-[0.16em] ${TONE[cfg.tone]}`}>
      {cfg.label}
    </span>
  );
}
