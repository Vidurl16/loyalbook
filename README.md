# LoyalBook — Perfect 10 La Lucia

A loyalty + booking web app built for **Perfect 10 La Lucia** (La Lucia Mall, Durban North). Clients earn 10 loyalty points for every R100 spent on nail, facial, waxing, and body treatments. Built on Next.js 15, tRPC, Prisma, and NextAuth.

---

## User Flows

### 👤 Client — Sign Up & Onboarding
1. Visit the homepage at `/`
2. Click **Join Free** or **Create Free Account**
3. Sign up via:
   - **Email + password** at `/signup`
   - **Google OAuth** (one-click, no password required)
4. A loyalty account is automatically created on first sign-in
5. Client is redirected to `/account` (their dashboard)

### 💅 Client — Booking a Treatment
1. Click **Book a Treatment** from the homepage or `/book`
2. **Step 1 — Choose a Service**: Browse categories (Nails, Facials, Dermaplaning, Brows & Lashes, Waxing, Massage) and select a treatment
3. **Step 2 — Choose a Therapist**: Pick from available therapists who specialise in that category. The system prevents double-booking — if a therapist is already booked in an overlapping slot, they show as unavailable
4. **Step 3 — Choose Date & Time**: Select an available slot. Conflicts are checked in real-time
5. **Step 4 — Confirm**: Optionally redeem loyalty points for a discount (100 pts = R10). Review the booking summary and confirm
6. Booking is created with status `pending`

### ✨ Client — Earning & Redeeming Points
- **Earning**: 10 points per R100 spent. Points are credited automatically when an admin marks a treatment as **completed**
- **Birthday bonus**: Extra points credited in the member's birthday month
- **Rebooking bonus**: Points for rebooking within 8 weeks
- **Viewing balance**: Go to `/account/rewards` to see:
  - Current point balance and rand value
  - Loyalty tier (Bronze / Silver / Gold / Platinum)
  - Point history and transactions
  - Redemption voucher for next booking
- **Redeeming**: During booking Step 4, use the points slider to apply a discount. Points are deducted when the appointment is completed

### 🧾 Client — Account Management
- `/account` — Overview: upcoming bookings, points balance, quick actions
- `/account/bookings` — Full booking history with status badges
- `/account/rewards` — Loyalty dashboard, tier status, redemption UI

---

## 🔑 Admin — Logging In

Admins log in via the standard login page at `/login` using:

| Field    | Value                         |
|----------|-------------------------------|
| Email    | `admin@perfect10lalucia.co.za` |
| Password | `Perfect10Admin!`              |

> ⚠️ Change this password after first login. No admin self-registration exists — accounts are created via the `create-admin.ts` script.

After login, admins are automatically redirected to `/dashboard`.

---

## 🛠️ Admin Panel Flows

### Dashboard Overview (`/dashboard`)
- Today's scheduled treatments with therapist and service details
- One-click **✓ Done** button to mark a treatment as completed (this triggers point crediting)
- Monthly revenue stat, total points issued and outstanding
- Upcoming client birthdays (next 30 days) with quick link to add bonus points

### Guests / Clients (`/dashboard/clients`)
- Full client list with name, email, visit count, points balance
- Search by name or email
- **Adjust Points** button per client — opens a modal to:
  - **Add** points (with a reason, e.g. "Birthday bonus")
  - **Remove** points (e.g. for a refund or correction)
  - All adjustments are logged as loyalty transactions

### Treatments (`/dashboard/services`)
- View all ~80 treatments from the Perfect 10 La Lucia menu
- Browse by category with prices

### Therapists (`/dashboard/staff`)
- View the 5 seeded therapists and their specialisations
- Add new therapist staff accounts

### Loyalty Settings (`/dashboard/loyalty`)
- View and update the loyalty configuration:
  - Points per R100 (default: 10)
  - Redemption rate (default: 100 pts = R10)
  - Birthday and rebooking bonuses

### Analytics (`/dashboard/analytics`)
- **Period filter**: Today / This Week / This Month / This Year
- **Revenue** — total rand value of completed treatments in the period
- **Completed treatments** count
- **Average per visit** — revenue ÷ bookings
- **New members** joined in the period (and total member count)
- **Points issued** lifetime
- **Booking status breakdown** — horizontal bar chart by status (pending, confirmed, completed, no-show, cancelled)
- **Loyalty economy** — total issued vs redeemed vs outstanding, redemption rate bar
- **Top treatments** — ranked by booking count with service name, category, and relative bar
- **Therapist performance** — completed treatments and revenue per therapist for the period

---

## Tech Stack

| Layer         | Technology                              |
|---------------|-----------------------------------------|
| Framework     | Next.js 15 (App Router, Turbopack)      |
| API           | tRPC v11 (type-safe end-to-end)         |
| Database      | PostgreSQL via Neon (serverless)        |
| ORM           | Prisma 6 + PrismaPg adapter             |
| Auth          | NextAuth.js v4 (Credentials + Google)  |
| Styling       | Tailwind CSS v4                         |
| Fonts         | Didot (from Perfect 10 CDN) + Geist    |
| Deployment    | Vercel                                  |

---

## Local Setup

### Prerequisites
- Node.js 20+
- A PostgreSQL database (Neon recommended)
- (Optional) Google OAuth credentials

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL=postgresql://...          # Neon connection string
NEXTAUTH_SECRET=your-random-secret     # Run: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
DEFAULT_SPA_ID=your-spa-id            # UUID for Perfect 10 La Lucia
NEXT_PUBLIC_SPA_ID=your-spa-id        # Same UUID, exposed to client

# Optional — Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 3. Push schema & seed data
```bash
npx prisma db push
npx prisma db seed          # Seeds ~80 treatments + loyalty config
npx ts-node seed-therapists.ts   # Seeds 5 therapists
npx ts-node create-admin.ts      # Creates the admin account
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Loyalty Points Logic

```
pointsEarned = floor(treatmentPrice / 100) × 10
```

- 10 pts per R100 spent
- Points are only credited when a treatment is marked **completed** by an admin
- Redemption: 100 pts = R10 discount on next booking
- Tiers:
  - 🥉 Bronze: 0 – 999 pts
  - 🥈 Silver: 1 000 – 4 999 pts
  - 🥇 Gold: 5 000 – 14 999 pts
  - 💎 Platinum: 15 000+ pts

---

## Brand Assets

All Perfect 10 brand assets are in `public/brand/`:

| File                  | Description                        |
|-----------------------|------------------------------------|
| `perfect10-logo.png`  | Official logo                      |
| `hero.jpg`            | Homepage hero image                |
| `treatments.jpg`      | Treatments section tile            |
| `about-us.jpg`        | About section tile                 |
| `location.jpg`        | Location section tile              |
| `contact.webp`        | Contact section tile               |
| `favicon-32.png`      | Browser favicon (32×32)            |
| `favicon-192.png`     | PWA icon (192×192)                 |
| `gift-cards.jpg`      | Gift cards promotional image       |

Brand colours: **Black `#000000`** · **Red `#C9262E`** · **Grey `#8D8E8F`** · **Light `#EBEBEC`**  
Font: **Didot** (serif) for headings

