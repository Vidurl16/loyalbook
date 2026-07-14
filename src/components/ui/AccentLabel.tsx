import { HTMLAttributes } from "react";

interface AccentLabelProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "gold" | "muted" | "dark";
}

const variants = {
  // "gold" is the primary accent variant (name kept for compatibility).
  gold: { color: "#d41d7f", background: "rgba(254,50,156,0.08)", border: "1px solid rgba(254,50,156,0.3)" },
  muted: { color: "#c98d82", background: "rgba(232,186,179,0.15)", border: "1px solid rgba(232,186,179,0.5)" },
  dark: { color: "#ffffff", background: "#232122", border: "1px solid #232122" },
};

export function AccentLabel({ variant = "gold", children, style, ...props }: AccentLabelProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-abel), Abel, sans-serif",
        fontSize: "10px",
        fontWeight: 400,
        letterSpacing: "0.12em",
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
