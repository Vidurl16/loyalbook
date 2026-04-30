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

export function GoldButton({ href, size = "md", children, style, ...props }: GoldButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#c9a85c",
    color: "#0e0c0a",
    fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderRadius: "2px",
    border: "none",
    cursor: "pointer",
    transition: "opacity 0.15s",
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
