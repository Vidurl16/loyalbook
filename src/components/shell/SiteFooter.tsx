import Link from "next/link";
import { brand } from "@/lib/brand";

const LINKS = [
  { href: "/book", label: "Book a treatment" },
  { href: "/gallery", label: "Gallery" },
  { href: "/account/rewards", label: "Rewards" },
  { href: "/mystery-shopper", label: "Mystery Shopper" },
  { href: "/login", label: "Sign in" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-hairline bg-shell">
      <div className="container-x flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="font-display text-[22px] text-ink">{brand.name}</div>
          <p className="mt-1 text-[12px] uppercase tracking-[0.22em] text-blush-deep">{brand.tagline}</p>
          <p className="mt-5 text-[14px] leading-relaxed text-ink-soft">
            34 Beachway Place
            <br />
            Durban North, KwaZulu-Natal
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-x-12 gap-y-3 md:grid-cols-1">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[12px] uppercase tracking-[0.18em] text-muted transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="container-x flex items-center justify-between border-t border-hairline py-5 text-[11px] uppercase tracking-[0.18em] text-muted">
        <span>© {new Date().getFullYear()} {brand.name}</span>
        <span>Where beauty comes alive</span>
      </div>
    </footer>
  );
}
