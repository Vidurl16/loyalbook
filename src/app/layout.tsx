import type { Metadata, Viewport } from "next";
import { Geist, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { BottomNav } from "@/components/ui/BottomNav";
import { brand, brandCssVars } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#c9a85c",
};

export const metadata: Metadata = {
  title: `${brand.name} — ${brand.tagline}`,
  description: `Book treatments, browse the gallery and earn loyalty rewards at ${brand.name}.`,
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/brand/favicon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandCssVars() }} />
      </head>
      <body className={`${geistSans.variable} ${cormorant.variable} ${dmSans.variable} antialiased`} style={{ paddingBottom: 58 }}>
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
