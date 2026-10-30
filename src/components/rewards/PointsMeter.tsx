"use client";

import { useEffect, useState } from "react";
import { formatRand } from "@/lib/format";

const SIZE = 200;
const R = 86;
const CIRC = 2 * Math.PI * R;

export function PointsMeter({ points, minRedeem, randValue }: { points: number; minRedeem: number; randValue: number }) {
  const target = minRedeem > 0 ? Math.min(points / minRedeem, 1) : 1;
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setPct(target), 80);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#f7eae7" strokeWidth="6" />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={R}
          fill="none"
          stroke="#fe329c"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[40px] leading-none text-ink">{points.toLocaleString("en-ZA")}</span>
        <span className="mt-1 text-[9px] uppercase tracking-[0.28em] text-muted">points</span>
        <span className="mt-1 text-[13px] text-ink-soft">≈ {formatRand(randValue)}</span>
      </div>
    </div>
  );
}
