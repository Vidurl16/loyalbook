"use client";

import { useEffect, useRef } from "react";

interface ParticleBurstProps {
  trigger: number;
  width?: number;
  height?: number;
}

export function ParticleBurst({ trigger, width = 400, height = 400 }: ParticleBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H * 0.40;
    const cols = ["#c9a85c", "#dfc07a", "#ede0cc", "#b8922e", "#fff8e7"];

    const ps = Array.from({ length: 48 }, () => {
      const a = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * 6;
      return {
        x: cx, y: cy,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 2.5,
        alpha: 1, size: 1.5 + Math.random() * 3,
        color: cols[Math.floor(Math.random() * cols.length)],
        rect: Math.random() > 0.45,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.25,
      };
    });

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      ps.forEach((p) => {
        if (p.alpha <= 0) return;
        alive = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.14;
        p.alpha -= 0.017; p.rot += p.rotV;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.rect) {
          ctx.fillRect(-p.size, -p.size * 0.4, p.size * 2, p.size * 0.8);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (alive) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50, width: "100%", height: "100%" }}
    />
  );
}
