# Perfect 10 — LoyalBook Build Brief

## Project Overview

**Perfect 10** is a luxury salon brand with two locations: **Ballito** and **La Lucia** (KwaZulu-Natal, South Africa). This app is built on top of the **LoyalBook** platform and extends it with a bespoke client-facing experience tailored to Perfect 10's brand identity.

The system is **multi-tenant**: each location operates independently under the same codebase, differentiated by a `locationId`. All new features must be location-aware.

---

## Repository

- **GitHub:** `Vidurl16/loyalbook`
- **Dev branch:** `claude/general-session-U0GPJ`
- **Working directory:** `perfect10-app/`

---

## Locations (Multi-Tenancy)

| Slug | Display Name | Region |
|------|-------------|--------|
| `ballito` | Perfect 10 Ballito | Ballito, KZN |
| `la-lucia` | Perfect 10 La Lucia | La Lucia, KZN |

The `Location` model is the root anchor for all multi-tenant data. Every feature, booking, product, and loyalty record is scoped to a location.

---

## Design DNA

All UI must strictly follow these rules. No exceptions.

### Colours
| Token | Hex | Usage |
|-------|-----|-------|
| Onyx | `#0e0c0a` | Page backgrounds, cards |
| Champagne Gold | `#c9a85c` | Accents, CTAs, borders, icons |
| Off-White | `#f5f0e8` | Body text on dark |
| Charcoal | `#1a1714` | Secondary backgrounds |
| Muted Gold | `#8a6f3e` | Disabled / secondary states |

### Typography
| Role | Font | Weight |
|------|------|--------|
| Headings (H1–H3) | Cormorant Garamond | 300–400 (light/regular) |
| Labels, body, UI | DM Sans | 400–500 |
| Prices, numbers | DM Sans | 600 |

### Styling Rules
- **Zero gradients** — flat colour only
- **Hard offset box-shadows** — e.g. `4px 4px 0px #c9a85c` (never blurred/soft)
- **Max 4 px border-radius** — use `rounded-sm` or `rounded` in Tailwind; never `rounded-xl` or `rounded-full` on containers
- **Gold borders** — `1px solid #c9a85c` on interactive cards and inputs
- **No glassmorphism, no blur, no opacity overlays**

---

## New Features to Build

### 1. Gallery
- Visual lookbook per location
- Grid of before/after photos and style showcases
- Filterable by treatment category
- Design reference: `.claude/designs/Gallery.html`

### 2. Transformation Hub
- Dedicated before/after transformation showcase
- Swipe/compare interaction for before/after pairs
- Therapist attribution per transformation
- Design reference: `.claude/designs/Transformation Hub v2.html`

### 3. Boutique Store
- In-app product store for retail items (haircare, skincare, accessories)
- Location-specific inventory
- Cart and checkout flow (initially offline/enquiry-based)
- Design reference: `.claude/designs/Boutique.html`

### 4. Treatment History
- Client-facing view of past appointments and treatments
- Filterable by date, therapist, treatment type
- Linked to their loyalty point earnings

### 5. Loyalty Hub (Reskin)
- Reskin of existing LoyalBook loyalty UI to Perfect 10 brand
- Points balance, tier status (Bronze / Gold / Diamond)
- Reward redemption list
- Design reference: `.claude/designs/Loyalty Hub.html`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | NextAuth.js |
| Deployment | Vercel |

---

## Prisma / Database Conventions

- All models scoped to `locationId: String` (FK → `Location`)
- Use `@map` for snake_case column names
- Migrations live in `prisma/migrations/`
- Run: `npx prisma migrate dev --name <description>`

---

## File Structure Conventions

```
src/
  app/
    (client)/           # Client-facing pages
      gallery/
      transformations/
      boutique/
      history/
      loyalty/
    (admin)/            # Salon staff admin pages
    api/                # Route handlers
  components/
    ui/                 # Primitives (Button, Card, Input, etc.)
    [feature]/          # Feature-specific components
  lib/
    prisma.ts           # Prisma client singleton
    auth.ts             # Auth config
```

---

## Design Files

All visual reference screens live in `.claude/designs/`:

| File | Feature |
|------|---------|
| `Gallery.html` | Gallery page |
| `Transformation Hub v2.html` | Transformation Hub |
| `Boutique.html` | Boutique store |
| `Loyalty Hub.html` | Loyalty Hub |

**Always read the relevant design file before building a page.** Match layout, spacing, typography hierarchy, and colour usage exactly.

---

## Development Workflow

1. Branch: `claude/general-session-U0GPJ`
2. Build feature
3. Commit with descriptive message
4. Push: `git push -u origin claude/general-session-U0GPJ`
5. Never push to `main` directly

---

## Key Constraints

- Every new page/component must be **location-aware** (reads `locationId` from session or URL param)
- No soft shadows, no gradients, no rounded pill buttons on cards
- Typography: Cormorant for display, DM Sans for everything else
- Gold accents must use `#c9a85c` — do not approximate with yellow or amber Tailwind defaults
