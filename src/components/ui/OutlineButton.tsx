import { ButtonHTMLAttributes } from "react";
import Link from "next/link";

interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { padding: "7px 20px", fontSize: "12px" },
  md: { padding: "11px 28px", fontSize: "13px" },
  lg: { padding: "14px 36px", fontSize: "14px" },
};

export function OutlineButton({ href, size = "md", children, style, ...props }: OutlineButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "transparent",
    color: "#c9a85c",
    fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderRadius: "2px",
    border: "1px solid #c9a85c",
    cursor: "pointer",
    transition: "background 0.15s, color 0.15s",
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
