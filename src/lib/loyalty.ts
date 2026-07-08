import { randomInt } from "crypto";

export type TierDef = { name: string; minLifetimeEarned: number; perks?: string[] };

const DEFAULT_TIERS: TierDef[] = [
  { name: "Bronze", minLifetimeEarned: 0 },
  { name: "Silver", minLifetimeEarned: 2500 },
  { name: "Gold", minLifetimeEarned: 5000 },
  { name: "Perfect 10", minLifetimeEarned: 10000 },
];

/** Parse the tiers JSON from LoyaltyConfig, sorted ascending, with a safe fallback. */
export function parseTiers(raw: unknown): TierDef[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_TIERS;
  const tiers = (raw as TierDef[])
    .filter((t) => t && typeof t.name === "string" && typeof t.minLifetimeEarned === "number")
    .sort((a, b) => a.minLifetimeEarned - b.minLifetimeEarned);
  return tiers.length ? tiers : DEFAULT_TIERS;
}

/**
 * Given lifetime points earned and a tier ladder, return the current tier, the
 * next tier (if any), and progress toward it (0–1).
 */
export function computeTier(lifetimeEarned: number, tiersRaw: unknown) {
  const tiers = parseTiers(tiersRaw);
  let currentIndex = 0;
  for (let i = 0; i < tiers.length; i++) {
    if (lifetimeEarned >= tiers[i].minLifetimeEarned) currentIndex = i;
  }
  const current = tiers[currentIndex];
  const next = tiers[currentIndex + 1] ?? null;

  let progress = 1;
  if (next) {
    const span = next.minLifetimeEarned - current.minLifetimeEarned;
    progress = span > 0 ? Math.min(1, (lifetimeEarned - current.minLifetimeEarned) / span) : 1;
  }

  return {
    tiers,
    current: current.name,
    next: next?.name ?? null,
    pointsToNext: next ? Math.max(0, next.minLifetimeEarned - lifetimeEarned) : 0,
    progress,
  };
}

// Unambiguous alphabet — no O/0/I/1 to avoid mis-reads at the till.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generate a human-typable voucher code, e.g. P10-7KF9-QM3X. */
export function generateVoucherCode(prefix = "P10"): string {
  const block = () =>
    Array.from({ length: 4 }, () => CODE_ALPHABET[randomInt(0, CODE_ALPHABET.length)]).join("");
  return `${prefix}-${block()}-${block()}`;
}
