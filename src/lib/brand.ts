/**
 * Per-deployment brand configuration. Each salon (Viv-a-cious, Perfect 10, …) is
 * its own deployment with its own database; branding is driven purely by
 * NEXT_PUBLIC_BRAND_* env vars so the same codebase serves all of them.
 * Viv-a-cious's values are the defaults for this deployment.
 */
export const brand = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Viv-a-cious",
  // Accent / primary brand colour (buttons, highlights).
  accent: process.env.NEXT_PUBLIC_BRAND_ACCENT ?? "#fe329c",
  accentDark: process.env.NEXT_PUBLIC_BRAND_ACCENT_DARK ?? "#d41d7f",
  // Page ground.
  bg: process.env.NEXT_PUBLIC_BRAND_BG ?? "#ffffff",
  logoUrl: process.env.NEXT_PUBLIC_BRAND_LOGO ?? "/brand/vivacious-logo.png",
  tagline: process.env.NEXT_PUBLIC_BRAND_TAGLINE ?? "Hair & Beauty",
};

/** CSS custom properties injected at the root so brand colours flow everywhere. */
export function brandCssVars(): string {
  return `:root{--brand-accent:${brand.accent};--brand-accent-dark:${brand.accentDark};--brand-bg:${brand.bg};}`;
}
