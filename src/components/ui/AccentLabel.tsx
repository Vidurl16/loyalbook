import { HTMLAttributes } from "react";

interface AccentLabelProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "muted" | "dark";
}

const variants = {
  gold: { color: "#c9a85c", background: "rgba(201,168,92,0.12)", border: "1px solid rgba(201,168,92,0.3)" },
  muted: { color: "#8a6f3e", background: "rgba(138,111,62,0.1)", border: "1px solid rgba(138,111,62,0.2)" },
  dark: { color: "#f5f0e8", background: "#1a1714", border: "1px solid #2a2420" },
};

export function AccentLabel({ variant = "gold", children, style, ...props }: AccentLabelProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
        fontSize: "10px",
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        borderRadius: "2px",
        padding: "3px 8px",
        ...variants[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
