"use client";

import { ProductVisual, type ProductShape } from "./ProductVisual";
import type { ProductData } from "./ProductCard";

interface RoutineCardProps {
  product: ProductData;
  onAdd: (product: ProductData) => void;
  inBag: boolean;
}

export function RoutineCard({ product, onAdd, inBag }: RoutineCardProps) {
  return (
    <div style={{
      display: "flex", flexShrink: 0,
      width: 160, height: 110,
      border: `1px solid ${inBag ? "rgba(201,168,92,0.55)" : "var(--onyx-700)"}`,
      borderRadius: 2,
      background: inBag ? "rgba(201,168,92,0.04)" : "var(--onyx-900)",
      overflow: "hidden",
      transition: "border-color 0.25s",
    }}>
      {/* Compact visual — left 60px */}
      <div style={{ width: 60, flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <ProductVisual
          shape={product.shape as ProductShape}
          bgStyle={product.bgStyle}
          imageUrl={product.imageUrl}
          height={110}
        />
        {/* "Used on you" badge */}
        <div style={{
          position: "absolute", top: 6, left: 4,
          background: "rgba(14,12,10,0.82)",
          border: "1px solid rgba(201,168,92,0.4)",
          borderRadius: 2, padding: "2px 5px",
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 7, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--gold-400)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
        }}>
          Yours
        </div>
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: "10px 10px 10px 10px", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
        <div>
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--cream-400)", marginBottom: 3,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {product.brand}
          </div>
          <div style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 13, fontWeight: 300, fontStyle: "italic",
            color: "var(--cream-100)", lineHeight: 1.2,
            overflow: "hidden",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          }}>
            {product.name}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 11, fontWeight: 600, color: "var(--gold-400)",
          }}>
            R{product.price.toFixed(0)}
          </span>
          <button
            onClick={() => onAdd(product)}
            style={{
              padding: "4px 8px", borderRadius: 2,
              background: inBag ? "rgba(201,168,92,0.12)" : "transparent",
              border: `1px solid ${inBag ? "rgba(201,168,92,0.5)" : "var(--onyx-600)"}`,
              cursor: inBag ? "default" : "pointer",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
              color: inBag ? "var(--gold-400)" : "var(--cream-400)",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            {inBag ? "In Bag" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
