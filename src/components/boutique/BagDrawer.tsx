"use client";

import { useEffect } from "react";
import type { ProductData } from "./ProductCard";

interface BagItem {
  product: ProductData;
  qty: number;
}

interface BagDrawerProps {
  items: BagItem[];
  onClose: () => void;
  onRemove: (productId: string) => void;
  onEnquire: () => void;
}

export function BagDrawer({ items, onClose, onRemove, onEnquire }: BagDrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 150,
          background: "rgba(14,12,10,0.7)",
        }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 160,
        background: "var(--onyx-950)",
        border: "1px solid var(--onyx-700)",
        borderBottom: "none",
        borderRadius: "4px 4px 0 0",
        maxHeight: "72vh",
        display: "flex", flexDirection: "column",
        animation: "fadeUp 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 6px" }}>
          <div style={{ width: 32, height: 3, borderRadius: 100, background: "var(--onyx-600)" }} />
        </div>

        {/* Header */}
        <div style={{
          padding: "0 20px 14px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid var(--onyx-700)",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "var(--gold-400)", marginBottom: 2,
            }}>
              Your Selection
            </div>
            <h2 style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 22, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-100)",
            }}>
              The Bag
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 2,
              background: "transparent", border: "1px solid var(--onyx-600)",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="var(--cream-400)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          {items.length === 0 ? (
            <div style={{
              padding: "32px 0", textAlign: "center",
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 17, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-400)",
            }}>
              Your bag is empty
            </div>
          ) : items.map(({ product, qty }) => (
            <div key={product.id} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 0",
              borderBottom: "1px solid var(--onyx-800)",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 2,
                background: "var(--onyx-800)",
                border: "1px solid var(--onyx-700)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, overflow: "hidden",
              }}>
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg width="20" height="20" viewBox="0 0 80 140" fill="none">
                    <rect x="25" y="8" width="30" height="24" rx="3" fill="#c9a85c" opacity="0.7" />
                    <rect x="36" y="32" width="8" height="14" fill="#b8922e" opacity="0.7" />
                    <rect x="20" y="46" width="40" height="62" rx="5" fill="#dfc07a" opacity="0.65" />
                  </svg>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase",
                  color: "var(--cream-400)", marginBottom: 2,
                }}>
                  {product.brand}
                </div>
                <div style={{
                  fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                  fontSize: 15, fontWeight: 300, fontStyle: "italic",
                  color: "var(--cream-100)", lineHeight: 1.2,
                }}>
                  {product.name}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <span style={{
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  fontSize: 13, fontWeight: 600, color: "var(--gold-400)",
                }}>
                  R{(product.price * qty).toFixed(0)}
                </span>
                <button
                  onClick={() => onRemove(product.id)}
                  style={{
                    background: "none", border: "none", cursor: "pointer", padding: 0,
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                    fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "var(--onyx-500)",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "14px 20px 28px", borderTop: "1px solid var(--onyx-700)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
                color: "var(--cream-400)",
              }}>
                Estimated Total
              </span>
              <span style={{
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 16, fontWeight: 600, color: "var(--gold-400)",
              }}>
                R{total.toFixed(0)}
              </span>
            </div>
            <button
              onClick={onEnquire}
              style={{
                width: "100%", padding: "16px 20px",
                background: "transparent",
                border: "1px solid rgba(201,168,92,0.6)",
                borderRadius: 2, cursor: "pointer",
                boxShadow: "4px 6px 0 rgba(0,0,0,0.65)",
                fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
                fontSize: 19, fontWeight: 300, fontStyle: "italic",
                letterSpacing: "0.1em", color: "var(--gold-400)",
                transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              Send Enquiry
            </button>
            <div style={{
              textAlign: "center", marginTop: 8,
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase",
              color: "var(--onyx-500)",
            }}>
              Our team will confirm availability
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
