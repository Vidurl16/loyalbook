"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { CategoryFilter } from "@/components/gallery/CategoryFilter";
import { ProductCard, type ProductData } from "@/components/boutique/ProductCard";
import { RoutineCard } from "@/components/boutique/RoutineCard";
import { BagDrawer } from "@/components/boutique/BagDrawer";

const LOCATION_ID = process.env.NEXT_PUBLIC_LOCATION_ID ?? "";

const DEMO_PRODUCTS: ProductData[] = [
  { id: "p0",  name: "Nail Envy Strengthener",       brand: "OPI",          category: "Nails",          price: 285, shape: "nailpolish", bgStyle: 1,  inStock: true,  isRoutine: true,
    description: "Clinical-strength nail hardener. Hydrolysed wheat protein and calcium for resilience." },
  { id: "p1",  name: "Solar Oil Nail & Cuticle",     brand: "CND",          category: "Nails",          price: 210, shape: "dropper",    bgStyle: 5,  inStock: true,  isRoutine: true,
    description: "Penetrates to nourish. Jojoba, sweet almond and vitamin E — wear it after every service." },
  { id: "p2",  name: "Gel Couture Top Coat",         brand: "Essie",        category: "Nails",          price: 175, shape: "nailpolish", bgStyle: 3,  inStock: true,  isRoutine: true,
    description: "Mirror-finish seal that extends gel wear up to fourteen days." },
  { id: "p3",  name: "ProHealth Base Coat",          brand: "OPI",          category: "Nails",          price: 195, shape: "nailpolish", bgStyle: 7,  inStock: true,
    description: "Locks in colour, fights yellowing and fortifies the nail plate." },
  { id: "p4",  name: "Xpress5 Top Coat",             brand: "OPI",          category: "Nails",          price: 185, shape: "nailpolish", bgStyle: 11, inStock: false,
    description: "Dries in five seconds. High-shine finish with chip-resistant formula." },
  { id: "p5",  name: "Hyaluronic Acid Serum 2%",     brand: "The Ordinary", category: "Skin",           price: 195, shape: "dropper",    bgStyle: 5,  inStock: true,
    description: "Low, medium and high molecular weight HA. Plumps and retains surface hydration." },
  { id: "p6",  name: "Vitamin C Brightening Mask",   brand: "Perfect 10",   category: "Skin",           price: 420, shape: "jar",        bgStyle: 1,  inStock: true,
    description: "In-house formulation used in our Luminous Lift Facial. Ascorbic acid at 12%." },
  { id: "p7",  name: "Peptide Eye Complex",           brand: "Medik8",       category: "Skin",           price: 685, shape: "tube",       bgStyle: 7,  inStock: true,
    description: "Copper tripeptide-1 and retinol targets crow's feet and dark circles overnight." },
  { id: "p8",  name: "Barrier Repair SPF 50",        brand: "La Roche-Posay", category: "Skin",         price: 349, shape: "pump",       bgStyle: 13, inStock: true,
    description: "Double UVA/UVB shield. Melts in with no white cast on deeper skin tones." },
  { id: "p9",  name: "Shea Butter Hand Cream",       brand: "L'Occitane",   category: "Body",           price: 310, shape: "tube",       bgStyle: 3,  inStock: true,  isRoutine: true,
    description: "25% shea from Burkina Faso. Non-greasy finish, twelve-hour hydration." },
  { id: "p10", name: "Warm Marble Body Oil",          brand: "Perfect 10",   category: "Body",           price: 520, shape: "dropper",    bgStyle: 2,  inStock: true,
    description: "Our signature massage oil blend: marula, argan and warm amber. Used in every stone ritual." },
  { id: "p11", name: "Velvet Body Scrub",             brand: "Frank Body",   category: "Body",           price: 260, shape: "jar",        bgStyle: 9,  inStock: true,
    description: "Coffee and kaolin clay remove dead skin cells. Skin left impossibly smooth." },
  { id: "p12", name: "Lash & Brow Growth Serum",     brand: "RevitaLash",   category: "Brows & Lashes", price: 895, shape: "dropper",    bgStyle: 4,  inStock: true,
    description: "BioPeptin Complex strengthens and protects. Visible difference in four weeks." },
  { id: "p13", name: "Brow Lamination Kit",           brand: "Benefit",      category: "Brows & Lashes", price: 445, shape: "tube",       bgStyle: 8,  inStock: false,
    description: "Salon-grade setting formula. Used by our brow artists for the laminated look." },
];

const DEMO_ROUTINE = DEMO_PRODUCTS.filter((p) => p.isRoutine);

const BOUTIQUE_CATEGORIES = ["All", "Nails", "Skin", "Body", "Brows & Lashes"];

interface BagItem { product: ProductData; qty: number; }

export default function BoutiquePage() {
  const [filter, setFilter] = useState("All");
  const [bag, setBag] = useState<BagItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enquired, setEnquired] = useState(false);

  const { data: liveProducts } = trpc.boutique.listProducts.useQuery(
    { locationId: LOCATION_ID, category: filter },
    { enabled: !!LOCATION_ID, retry: false }
  );
  const { data: liveRoutine } = trpc.boutique.listRoutine.useQuery(
    { locationId: LOCATION_ID },
    { enabled: !!LOCATION_ID, retry: false }
  );

  const products: ProductData[] = (() => {
    if (liveProducts && liveProducts.length > 0) return liveProducts as ProductData[];
    if (filter === "All") return DEMO_PRODUCTS;
    return DEMO_PRODUCTS.filter((p) => p.category === filter);
  })();

  const routineItems: ProductData[] = (() => {
    if (liveRoutine && liveRoutine.length > 0) return liveRoutine as ProductData[];
    return DEMO_ROUTINE;
  })();

  const addToBag = useCallback((product: ProductData) => {
    setBag((prev) => {
      if (prev.find((i) => i.product.id === product.id)) return prev;
      return [...prev, { product, qty: 1 }];
    });
  }, []);

  const removeFromBag = useCallback((productId: string) => {
    setBag((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const isInBag = (productId: string) => bag.some((i) => i.product.id === productId);

  const bagCount = bag.reduce((s, i) => s + i.qty, 0);

  function handleEnquire() {
    setEnquired(true);
    setDrawerOpen(false);
    setBag([]);
    setTimeout(() => setEnquired(false), 4000);
  }

  const leftCol = products.filter((_, i) => i % 2 === 0);
  const rightCol = products.filter((_, i) => i % 2 === 1);

  return (
    <main style={{ minHeight: "100vh", background: "var(--onyx-950)" }}>

      {/* Nav */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 40,
        background: "var(--onyx-950)",
        borderBottom: "1px solid var(--onyx-700)",
        padding: "0 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 52,
      }}>
        <Link href="/" style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 18, fontWeight: 300, fontStyle: "italic",
          color: "var(--gold-400)", textDecoration: "none", letterSpacing: "0.04em",
        }}>
          Perfect 10
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/book" style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "var(--cream-400)", textDecoration: "none",
            padding: "6px 14px",
            border: "1px solid var(--onyx-600)",
            borderRadius: 2,
          }}>
            Book
          </Link>

          {/* Cart icon */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              position: "relative",
              width: 36, height: 36, borderRadius: 2,
              background: "transparent",
              border: bagCount > 0 ? "1px solid rgba(201,168,92,0.5)" : "1px solid var(--onyx-600)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              transition: "border-color 0.22s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                stroke={bagCount > 0 ? "var(--gold-400)" : "var(--onyx-500)"}
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="3" y1="6" x2="21" y2="6"
                stroke={bagCount > 0 ? "var(--gold-400)" : "var(--onyx-500)"}
                strokeWidth="1.6" strokeLinecap="round" />
              <path d="M16 10a4 4 0 01-8 0"
                stroke={bagCount > 0 ? "var(--gold-400)" : "var(--onyx-500)"}
                strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {bagCount > 0 && (
              <div style={{
                position: "absolute", top: -5, right: -5,
                width: 16, height: 16, borderRadius: "50%",
                background: "var(--gold-400)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                fontSize: 9, fontWeight: 600, color: "var(--onyx-950)",
              }}>
                {bagCount}
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* Header */}
      <div style={{ padding: "40px 20px 0" }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
          fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase",
          color: "var(--gold-400)", fontWeight: 500, marginBottom: 6,
        }}>
          Curated for you
        </div>
        <h1 style={{
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: "clamp(34px, 9vw, 52px)", fontWeight: 300, lineHeight: 0.95,
          letterSpacing: "0.01em",
        }}>
          <em style={{ fontStyle: "italic", color: "var(--cream-200)" }}>The</em>{" "}
          <em style={{ fontStyle: "italic", color: "var(--gold-400)" }}>Boutique</em>
        </h1>

        <p style={{
          marginTop: 10,
          fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
          fontSize: 15, fontWeight: 300, fontStyle: "italic",
          color: "var(--cream-400)", lineHeight: 1.7, letterSpacing: "0.01em",
        }}>
          Products your therapist trusts. Curated to extend your treatment between visits.
        </p>
      </div>

      {/* Your Routine strip */}
      {routineItems.length > 0 && (
        <div style={{ padding: "24px 0 0" }}>
          <div style={{ padding: "0 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 20, height: 1, background: "rgba(201,168,92,0.35)" }} />
            <span style={{
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase",
              color: "var(--gold-400)",
            }}>
              Your Routine
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(201,168,92,0.35),transparent)" }} />
          </div>
          <div style={{
            display: "flex", gap: 10,
            overflowX: "auto", paddingLeft: 20, paddingRight: 20, paddingBottom: 4,
            scrollbarWidth: "none",
          }}>
            {routineItems.map((p) => (
              <RoutineCard key={p.id} product={p} onAdd={addToBag} inBag={isInBag(p.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ borderBottom: "1px solid var(--onyx-700)", paddingBottom: 10 }}>
          <CategoryFilter active={filter} onChange={setFilter} categories={BOUTIQUE_CATEGORIES} />
        </div>
      </div>

      {/* Staggered product grid */}
      <div style={{ padding: "20px 16px 60px" }}>
        {products.length === 0 ? (
          <div style={{ padding: "52px 32px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 32, height: 1, background: "var(--gold-400)", opacity: 0.3, marginBottom: 24 }} />
            <h2 style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 28, fontWeight: 300, fontStyle: "italic",
              color: "var(--cream-200)", textAlign: "center", marginBottom: 14,
            }}>
              Coming Soon
            </h2>
            <p style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 15, fontWeight: 300, color: "var(--cream-400)",
              lineHeight: 1.75, textAlign: "center", maxWidth: 260,
            }}>
              Our editors are curating something extraordinary.
            </p>
            <div style={{ width: 32, height: 1, background: "var(--gold-400)", opacity: 0.3, marginTop: 24 }} />
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12 }}>
            {/* Left column */}
            <div style={{ flex: 1 }}>
              {leftCol.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={addToBag}
                  inBag={isInBag(p.id)}
                  tall={i === 0}
                />
              ))}
            </div>
            {/* Right column — offset down */}
            <div style={{ flex: 1, marginTop: 28 }}>
              {rightCol.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={addToBag}
                  inBag={isInBag(p.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating bag button when items in bag and drawer closed */}
      {bagCount > 0 && !drawerOpen && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 100,
        }}>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 24px",
              background: "var(--onyx-900)",
              border: "1px solid rgba(201,168,92,0.55)",
              borderRadius: 2,
              cursor: "pointer",
              boxShadow: "6px 9px 0 rgba(0,0,0,0.7)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{
              fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
              fontSize: 17, fontWeight: 300, fontStyle: "italic",
              letterSpacing: "0.08em", color: "var(--gold-400)",
            }}>
              View Bag
            </span>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              background: "var(--gold-400)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
              fontSize: 10, fontWeight: 600, color: "var(--onyx-950)",
            }}>
              {bagCount}
            </div>
          </button>
        </div>
      )}

      {/* Enquiry sent toast */}
      {enquired && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: "var(--onyx-800)",
          border: "1px solid rgba(201,168,92,0.38)",
          borderRadius: 100,
          padding: "10px 20px",
          display: "flex", alignItems: "center", gap: 8,
          zIndex: 200, whiteSpace: "nowrap",
          animation: "fadeUp 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold-400)" }} />
          <span style={{
            fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif",
            fontSize: 14, fontStyle: "italic", fontWeight: 300,
            color: "var(--cream-100)", letterSpacing: "0.04em",
          }}>
            Enquiry sent — we&apos;ll be in touch ✦
          </span>
        </div>
      )}

      {/* Bag drawer */}
      {drawerOpen && (
        <BagDrawer
          items={bag}
          onClose={() => setDrawerOpen(false)}
          onRemove={removeFromBag}
          onEnquire={handleEnquire}
        />
      )}

      <style>{`
        @keyframes fadeUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to   { transform: translate(-50%, 0);    opacity: 1; }
        }
      `}</style>
    </main>
  );
}
