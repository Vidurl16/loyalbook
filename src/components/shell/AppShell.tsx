"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { TabBar } from "./TabBar";

const AUTH_ROUTES = ["/login", "/signup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) return <>{children}</>;

  const isAuth = AUTH_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader minimal={isAuth} />
      <div key={pathname} className={`page-in flex-1 ${isAuth ? "" : "pb-[76px] md:pb-0"}`}>
        {children}
      </div>
      {!isAuth && <SiteFooter />}
      {!isAuth && <TabBar />}
    </div>
  );
}
