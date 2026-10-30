/** Owner-editable website copy, stored in Spa.settings.website. Pure helpers, safe for the browser. */
export type WebsiteSettings = {
  headline: string;
  intro: string;
  phone: string;
  hours: string;
  heroImageUrl: string;
  instagram: string;
};

export const WEBSITE_DEFAULTS: WebsiteSettings = {
  headline: "Where beauty\ncomes alive.",
  intro:
    "Nails, skin, brows and body treatments by a team who know your name. Browse the full menu, pick your therapist, choose a time, and earn points on every visit.",
  phone: "",
  hours: "",
  heroImageUrl: "/brand/about-us.jpg",
  instagram: "",
};

export function websiteFromSettings(settings: unknown): WebsiteSettings {
  const raw = ((settings as { website?: Partial<WebsiteSettings> } | null)?.website ?? {}) as Partial<WebsiteSettings>;
  const picked = Object.fromEntries(Object.entries(raw).filter(([, v]) => typeof v === "string" && v.trim() !== ""));
  return { ...WEBSITE_DEFAULTS, ...picked };
}
