"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { brand } from "@/lib/brand";

const I = "h-[18px] w-[18px] shrink-0";
const s = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const navItems = [
  { href: "/dashboard", label: "Overview", icon: <svg className={I} viewBox="0 0 24 24" {...s}><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" /><path d="M9 21V12h6v9" /></svg> },
  { href: "/dashboard/bookings", label: "Bookings", icon: <svg className={I} viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="17" rx="1" /><path d="M3 9h18M8 2v4M16 2v4" /></svg> },
  { href: "/dashboard/clients", label: "Guests", icon: <svg className={I} viewBox="0 0 24 24" {...s}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><path d="M16 4.5a3.5 3.5 0 010 7M21.5 20c0-3-2-5.2-4.8-5.8" /></svg> },
  { href: "/dashboard/services", label: "Treatments", icon: <svg className={I} viewBox="0 0 24 24" {...s}><path d="M4 20c6-1 12-7 14-16-9 2-15 8-16 14" /><path d="M4 20l6-6" /></svg> },
  { href: "/dashboard/staff", label: "Therapists", icon: <svg className={I} viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg> },
  { href: "/dashboard/gallery", label: "Gallery", icon: <svg className={I} viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="16" rx="1" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 9" /></svg> },
  { href: "/dashboard/reviews", label: "Reviews", icon: <svg className={I} viewBox="0 0 24 24" {...s}><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.2 6.1L12 16.8l-5.5 2.9 1.2-6.1L3.2 9.4l6.1-.8z" /></svg> },
  { href: "/dashboard/loyalty", label: "Loyalty", icon: <svg className={I} viewBox="0 0 24 24" {...s}><path d="M12 2.5l1.8 5.2 5.4.2-4.3 3.3 1.5 5.3L12 13.4l-4.4 3.1 1.5-5.3-4.3-3.3 5.4-.2z" /><path d="M5 21h14" /></svg> },
  { href: "/dashboard/vouchers", label: "Vouchers", icon: <svg className={I} viewBox="0 0 24 24" {...s}><path d="M3 8a2 2 0 002-2h14a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H5a2 2 0 00-2-2v-2a2 2 0 000-4z" /><path d="M10 8v8" strokeDasharray="2 2" /></svg> },
  { href: "/dashboard/marketing", label: "Marketing", icon: <svg className={I} viewBox="0 0 24 24" {...s}><rect x="3" y="5" width="18" height="14" rx="1" /><path d="M3 7l9 6 9-6" /></svg> },
  { href: "/dashboard/mystery-shopper", label: "Secret Shopper", icon: <svg className={I} viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></svg> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <svg className={I} viewBox="0 0 24 24" {...s}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg> },
  { href: "/dashboard/settings", label: "Settings", icon: <svg className={I} viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></svg> },
];

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));

  return (
    <aside className="flex min-h-screen w-60 shrink-0 flex-col bg-[#232122] text-white">
      <div className="border-b border-white/10 p-5">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/vivacious-mark.svg" alt="" className="h-5 w-auto" />
          <span className="font-display text-[19px] tracking-wide">{brand.name}</span>
        </Link>
        <p className="mt-1.5 text-[10px] uppercase tracking-[0.22em] text-white/40">Admin panel</p>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-sm border-l-2 px-3 py-2.5 text-[13px] tracking-[0.02em] transition-colors ${
                active ? "border-[#fe329c] bg-white/5 text-white" : "border-transparent text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link href="/book" className="flex w-full items-center justify-center rounded-sm bg-[#d41d7f] py-2.5 text-[12px] uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90">
          + New booking
        </Link>
        <div className="mt-3 truncate text-[12px] text-white/40">{session?.user?.name ?? "Staff"}</div>
      </div>
    </aside>
  );
}
