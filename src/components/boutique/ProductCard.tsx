"use client";

import { useState } from "react";
import { ProductVisual, type ProductShape } from "./ProductVisual";

export interface ProductData {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  description?: string | null;
  imageUrl?: string | null;
  shape: string;
  bgStyle: number;
  inStock: boolean;
  isRoutine?: boolean;
}

interface ProductCardProps {
  product: ProductData;
  onAdd: (product: ProductData) => void;
  inBag: boolean;
  tall?: boolean;
}

export function ProductCard({ product, onAdd, inBag, tall = false }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [popped, setPopped] = useState(false);

  function handleAdd() {
    if (inBag || !product.inStock) return;
    onAdd(product);
    setPopped(true);
    setTimeout(() => setPopped(false), 420);
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "var(--onyx-950)",
        border: `1px solid ${inBag ? "rgba(201,168,92,0.45)" : hovered ? "rgba(201,168,92,0.28)" : "var(--onyx-700)"}`,
        borderRadius: 2,
        overflow: "hidden",
        marginBottom: 16,
        boxShadow: hovered
          ? "8px 12px 0 rgba(0,0,0,0.85), 0 0 0 1px rgba(201,168,92,0.14)"
          : "6px 9px 0 rgba(0,0,0,0.72)",
        transform: hovered ? "translateY(-3px) translateX(-1px)" : "none",
        transition: "transform 0.26s cubic-bezier(0.16,1,0.3,1), box-shadow 0.26s ease, border-color 0.22s",
      }}
    >
      {/* Product visual */}
      <ProductVisual
        shape={product.shape as ProductShape}
        bgStyle={product.bgStyle}
        imageUrl={product.imageUrl}
        height={tall ? 240 : 190}
      />

      {/* Category pill */}
      <div style={{
        position: "absolute", top: 10, left: 10,
        background: "rgba(14,12,10,0.82)",
        border: "1px solid var(--onyx-600)",
        borderRadius: 2, padding: "3px 8px",
        fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
        fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase",
        color: "var(--cream-400)",
      }}>
        {product.category}
      </div>

      {!product.inStock && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(14,12,10,0.82)",
          border: "1px solid var(--onyx-600)",
          borderRadius: 2, padding: "3px 8px",
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
          color: "var(--onyx-500)",
        }}>
          Sold Out
        </div>
      )}

      {/* Info block */}
      <div style={{ padding: "12px 14px 14px" }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 8, letterSpacing: "0.24em", textTransform: "uppercase",
          color: "var(--cream-400)", marginBottom: 4,
        }}>
          {product.brand}
        </div>
        <h3 style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 18, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-100)", lineHeight: 1.15, marginBottom: 6,
        }}>
          {product.name}
        </h3>
        {product.description && (
          <p style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 13, fontWeight: 300, color: "var(--cream-400)",
            lineHeight: 1.6, marginBottom: 10,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}>
            {product.description}
          </p>
        )}

        {/* Price + Add to Bag row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
          <span style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 16, fontWeight: 600, color: "var(--gold-400)",
          }}>
            R{product.price.toFixed(0)}
          </span>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            style={{
              padding: "10px 16px",
              background: inBag ? "rgba(201,168,92,0.08)" : "transparent",
              border: `1px solid ${inBag ? "rgba(201,168,92,0.55)" : product.inStock ? "rgba(201,168,92,0.48)" : "var(--onyx-600)"}`,
              borderRadius: 2,
              cursor: product.inStock && !inBag ? "pointer" : "default",
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 14, fontWeight: 300, fontStyle: "italic",
              letterSpacing: "0.07em",
              color: inBag ? "var(--gold-400)" : product.inStock ? "var(--gold-400)" : "var(--onyx-500)",
              transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
              animation: popped ? "bagPop 0.42s cubic-bezier(0.16,1,0.3,1)" : "none",
              whiteSpace: "nowrap",
            }}
          >
            {inBag ? "In Bag ✦" : product.inStock ? "Add to Bag" : "Sold Out"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bagPop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.14); }
          70%  { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
