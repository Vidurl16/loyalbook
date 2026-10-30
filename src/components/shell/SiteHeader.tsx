"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { brand } from "@/lib/brand";

const NAV = [
  { href: "/book", label: "Treatments" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#team", label: "Team" },
  { href: "/account/rewards", label: "Rewards" },
  { href: "/mystery-shopper", label: "Mystery Shopper" },
];

function isActive(pathname: string, href: string) {
  if (href.startsWith("/#")) return false;
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/90 backdrop-blur-md">
      <div aria-hidden className="flex h-[3px]">
        <span className="flex-1 bg-pink" />
        <span className="flex-1 bg-blush" />
        <span className="flex-1 bg-ink" />
        <span className="flex-1 bg-blush" />
        <span className="flex-1 bg-pink" />
      </div>
      <div className="container-x flex h-14 items-center justify-between md:h-16">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/vivacious-mark.svg" alt="" className="h-[22px] w-auto" />
          <span className="font-display text-[21px] tracking-wide">{brand.name}</span>
        </Link>

        {!minimal && (
          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-1 text-[12px] uppercase tracking-[0.2em] transition-colors ${
                    active ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-px bg-pink transition-transform duration-300 ease-out-soft ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-5">
          {!minimal && (
            <Link
              href={session ? "/account" : "/login"}
              className="hidden text-[12px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink md:inline"
            >
              {firstName ?? "Sign in"}
            </Link>
          )}
          {!minimal && pathname !== "/book" && (
            <Link href="/book" className="btn-primary btn-sm">
              Book
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
