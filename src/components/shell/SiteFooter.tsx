import Link from "next/link";
import { brand } from "@/lib/brand";
import type { SalonProfile } from "@/lib/salonProfile";

const LINKS = [
  { href: "/book", label: "Book a treatment" },
  { href: "/gallery", label: "Gallery" },
  { href: "/account/rewards", label: "Rewards" },
  { href: "/mystery-shopper", label: "Mystery Shopper" },
  { href: "/login", label: "Sign in" },
];

export function SiteFooter({ profile }: { profile: SalonProfile }) {
  return (
    <footer className="border-t border-hairline bg-shell">
      <div className="container-x grid gap-8 py-12 md:grid-cols-3">
        <div>
          <div className="font-display text-[22px] text-ink">{profile.name}</div>
          <p className="mt-1 text-[12px] uppercase tracking-[0.22em] text-blush-deep">{brand.tagline}</p>
          <p className="mt-5 whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">{profile.address}</p>
          {profile.phone && (
            <a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className="mt-1 block text-[14px] text-ink-soft hover:text-ink">
              {profile.phone}
            </a>
          )}
          {profile.instagram && (
            <a
              href={`https://instagram.com/${profile.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block text-[14px] text-ink-soft hover:text-ink"
            >
              @{profile.instagram.replace(/^@/, "")}
            </a>
          )}
        </div>
        {profile.hours && (
          <div>
            <p className="eyebrow mb-3">Hours</p>
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-ink-soft">{profile.hours}</p>
          </div>
        )}
        <nav className="grid grid-cols-2 gap-x-12 gap-y-3 md:grid-cols-1 md:justify-self-end">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[12px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="container-x flex items-center justify-between border-t border-hairline py-5 text-[11px] uppercase tracking-[0.18em] text-muted">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>Where beauty comes alive</span>
      </div>
    </footer>
  );
}
