# Deployment & Environment

Each salon (Perfect 10, Vivacious, +1) runs the **same codebase** as its own
Vercel project with its **own database** and branding env. Clone by creating a
new Vercel project from this repo and setting the env vars below.

## Required environment variables

| Var | Purpose |
|-----|---------|
| `DATABASE_URL` | Postgres connection string (Supabase). Per-salon, unique. |
| `NEXTAUTH_URL` | Deployment URL (e.g. `https://perfect10.co.za`). |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32`. |
| `DEFAULT_SPA_ID` | Seeded Spa id for this salon (server-side tenant). |
| `DEFAULT_LOCATION_ID` | Seeded Location id (server-side tenant). |
| `NEXT_PUBLIC_SPA_ID` | Same Spa id, exposed to the client. |
| `NEXT_PUBLIC_LOCATION_ID` | Same Location id, exposed to the client. |

## Image uploads (Supabase Storage)

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key (server-only — never public). |
| `SUPABASE_STORAGE_BUCKET` | Optional; defaults to `media`. |

Create a **public** storage bucket named `media` in Supabase (folders
`gallery/`, `staff/`, `products/`, `reviews/`, `transformations/` are created
automatically on upload).

## Email (Resend)

| Var | Purpose |
|-----|---------|
| `RESEND_API_KEY` | Enables OTP, campaigns and win-back. Without it, emails are logged not sent (dev). |
| `EMAIL_FROM` | Verified sender, e.g. `Perfect 10 <hello@perfect10.co.za>`. |
| `CRON_SECRET` | Bearer secret protecting `/api/cron/winback`. |
| `WINBACK_DAYS` | Inactivity threshold, default `60`. |

The win-back cron is scheduled weekly in `vercel.json`.

## Auth providers (optional)

| Var | Purpose |
|-----|---------|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Enables "Continue with Google". |

## Branding (per salon)

| Var | Default |
|-----|---------|
| `NEXT_PUBLIC_BRAND_NAME` | `Perfect 10` |
| `NEXT_PUBLIC_BRAND_ACCENT` | `#c9a85c` |
| `NEXT_PUBLIC_BRAND_ACCENT_DARK` | `#8a6f3e` |
| `NEXT_PUBLIC_BRAND_BG` | `#0e0c0a` |
| `NEXT_PUBLIC_BRAND_LOGO` | `/brand/perfect10-logo.png` |
| `NEXT_PUBLIC_BRAND_TAGLINE` | `Nail & Beauty Salon` |

## First deploy

1. Create the Supabase project and copy `DATABASE_URL`.
2. Set all env vars in Vercel.
3. `vercel.json` build runs `prisma migrate deploy` automatically.
4. Seed the salon's Spa/Location/services, then set the `*_SPA_ID` / `*_LOCATION_ID` vars.
