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
        background: "#1a1714",
        borderRadius: "2px",
        border: goldBorder ? "1px solid #c9a85c" : "1px solid #2a2420",
        boxShadow: shadow ? "4px 4px 0px #c9a85c" : "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
