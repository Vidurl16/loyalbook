"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";

export const navItems = [
  { href: "/dashboard", label: "Overview", icon: "🏠" },
  { href: "/dashboard/clients", label: "Guests", icon: "👥" },
  { href: "/dashboard/services", label: "Treatments", icon: "🌿" },
  { href: "/dashboard/staff", label: "Therapists", icon: "🧖‍♀️" },
  { href: "/dashboard/loyalty", label: "Loyalty", icon: "✨" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "📊" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
];

export function DashboardSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-black text-white flex flex-col shrink-0 min-h-screen">
      <div className="p-5 border-b border-white/10">
        <Link href="/">
          <Image
            src="/brand/perfect10-logo.png"
            alt="Perfect 10"
            width={140}
            height={32}
            className="h-8 w-auto brightness-0 invert"
          />
        </Link>
        <p className="text-[10px] text-white/40 mt-1 tracking-widest uppercase">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
              pathname === item.href
                ? "text-white border-l-2 pl-[10px]"
                : "text-white/50 hover:text-white"
            }`}
            style={pathname === item.href ? { borderColor: "#C9262E" } : {}}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <Link
          href="/book"
          className="w-full flex items-center justify-center gap-2 text-white text-sm py-2.5 font-semibold hover:opacity-90 transition-opacity"
          style={{ background: "#C9262E", borderRadius: 2 }}
        >
          + New Booking
        </Link>
        <div className="mt-3 text-xs text-white/40 truncate">{session?.user?.name ?? "Staff"}</div>
      </div>
    </aside>
  );
}
