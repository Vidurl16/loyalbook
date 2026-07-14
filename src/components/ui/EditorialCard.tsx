import { HTMLAttributes } from "react";

interface EditorialCardProps extends HTMLAttributes<HTMLDivElement> {
  goldBorder?: boolean;
  shadow?: boolean;
}

export function EditorialCard({
  children,
  goldBorder = false,
  shadow = false,
  style,
  ...props
}: EditorialCardProps) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "2px",
        border: goldBorder ? "1px solid var(--viv-pink, #fe329c)" : "1px solid var(--viv-border, #efdcd8)",
        boxShadow: shadow ? "0 10px 30px rgba(35,33,34,0.07)" : "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
