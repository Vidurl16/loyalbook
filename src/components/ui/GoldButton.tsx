import { ButtonHTMLAttributes } from "react";
import Link from "next/link";

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { padding: "8px 20px", fontSize: "12px" },
  md: { padding: "12px 28px", fontSize: "13px" },
  lg: { padding: "15px 36px", fontSize: "14px" },
};

/** Primary brand CTA (component name kept from the original gold theme). */
export function GoldButton({ href, size = "md", children, style, ...props }: GoldButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "var(--viv-ink, #232122)",
    color: "#ffffff",
    fontFamily: "var(--font-abel), Abel, sans-serif",
    fontWeight: 400,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    borderRadius: "2px",
    border: "1px solid var(--viv-ink, #232122)",
    cursor: "pointer",
    transition: "background 0.15s, border-color 0.15s",
    textDecoration: "none",
    whiteSpace: "nowrap",
    ...sizes[size],
    ...style,
  };

  if (href) {
    return (
      <Link href={href} style={baseStyle}>
        {children}
      </Link>
    );
  }

  return (
    <button style={baseStyle} {...props}>
      {children}
    </button>
  );
}
