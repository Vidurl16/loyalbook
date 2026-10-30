import { prisma } from "@/lib/prisma";
import { brand } from "@/lib/brand";
import { websiteFromSettings, type WebsiteSettings } from "@/lib/websiteSettings";

export type SalonProfile = WebsiteSettings & {
  name: string;
  address: string;
};

const SPA_ID = process.env.DEFAULT_SPA_ID ?? "";
const LOCATION_ID = process.env.DEFAULT_LOCATION_ID ?? "";

/** Server-only: what the public site shows about the salon, from the database with sensible defaults. */
export async function getSalonProfile(): Promise<SalonProfile> {
  const [spa, location] = await Promise.all([
    SPA_ID ? prisma.spa.findUnique({ where: { id: SPA_ID }, select: { name: true, address: true, settings: true } }) : null,
    LOCATION_ID ? prisma.location.findUnique({ where: { id: LOCATION_ID }, select: { address: true, phone: true } }) : null,
  ]);
  const website = websiteFromSettings(spa?.settings);
  return {
    ...website,
    phone: website.phone || location?.phone || "",
    name: spa?.name ?? brand.name,
    address: spa?.address || location?.address || "34 Beachway Place, Durban North",
  };
}
