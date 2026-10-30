type DateInput = Date | string;

export function formatRand(amount: number) {
  return `R${Math.round(amount).toLocaleString("en-ZA")}`;
}

export function formatDay(d: DateInput) {
  return new Date(d).toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
}

export function formatLongDay(d: DateInput) {
  return new Date(d).toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" });
}

export function formatTime(d: DateInput) {
  return new Date(d).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
}

export function formatDayTime(d: DateInput) {
  return `${formatDay(d)} · ${formatTime(d)}`;
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
