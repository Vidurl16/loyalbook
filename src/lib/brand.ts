/**
 * Per-deployment brand configuration. Each salon (Perfect 10, Vivacious, …) is
 * its own deployment with its own database; branding is driven purely by
 * NEXT_PUBLIC_BRAND_* env vars so the same codebase serves all of them.
 * Perfect 10's values are the defaults.
 */
export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Perfect 10",
  // Accent / primary brand colour (buttons, highlights).
  accent: process.env.NEXT_PUBLIC_BRAND_ACCENT ?? "#c9a85c",
  accentDark: process.env.NEXT_PUBLIC_BRAND_ACCENT_DARK ?? "#8a6f3e",
  // Page ground.
  bg: process.env.NEXT_PUBLIC_BRAND_BG ?? "#0e0c0a",
  logoUrl: process.env.NEXT_PUBLIC_BRAND_LOGO ?? "/brand/perfect10-logo.png",
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? "Nail & Beauty Salon",
};

/** CSS custom properties injected at the root so brand colours flow everywhere. */
export function brandCssVars(): string {
  return `:root{--brand-accent:${brand.accent};--brand-accent-dark:${brand.accentDark};--brand-bg:${brand.bg};}`;
}
