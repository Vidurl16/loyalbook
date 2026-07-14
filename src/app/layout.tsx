import type { Metadata, Viewport } from "next";
import { Abel, Marcellus, Bad_Script } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { BottomNav } from "@/components/ui/BottomNav";
import { brand, brandCssVars } from "@/lib/brand";

const abel = Abel({
  variable: "--font-abel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const badScript = Bad_Script({
  variable: "--font-bad-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#fe329c",
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
      <body className={`${abel.variable} ${marcellus.variable} ${badScript.variable} antialiased`} style={{ paddingBottom: 58 }}>
        <Providers>
          {children}
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
