/**
 * Seed script — run with: node node_modules/.bin/jiti prisma/seed.ts
 * Creates the initial Spa record and default loyalty config.
 * After running, copy the printed SPA_ID into your .env file.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter, log: [] });

async function main() {
  // Check if a Spa already exists
  const existing = await prisma.spa.findFirst();
  if (existing) {
    console.log(`✅ Spa already exists: ${existing.id} (${existing.name})`);
    console.log(`\nSet in .env:\n  DEFAULT_SPA_ID="${existing.id}"\n  NEXT_PUBLIC_SPA_ID="${existing.id}"`);
    return;
  }

  const spa = await prisma.spa.create({
    data: {
      name: "LoyalBook Spa",
      address: "1 Wellness Lane, Cape Town",
      timezone: "Africa/Johannesburg",
    },
  });

  // Create default loyalty config
  await prisma.loyaltyConfig.create({
    data: {
      spaId: spa.id,
      pointsPerUnit: 1,
      currencyUnitAmount: 10,
      rebookingBonus: 50,
      rebookingWindowDays: 56,
      birthdayBonus: 200,
      redemptionRate: 100,
      minRedeem: 500,
    },
  });

  // Seed example services
  const serviceData = [
    { name: "Classic Facial", category: "Facials", durationMins: 60, price: 450, description: "Deep cleanse, exfoliation and hydration for all skin types." },
    { name: "Anti-Ageing Facial", category: "Facials", durationMins: 75, price: 650, description: "Targeted treatment with peptides and collagen boosters." },
    { name: "Swedish Massage", category: "Massage", durationMins: 60, price: 500, description: "Full-body relaxation massage with soothing aromatherapy." },
    { name: "Deep Tissue Massage", category: "Massage", durationMins: 90, price: 700, description: "Targets muscle knots and chronic tension in deep layers." },
    { name: "Body Scrub & Wrap", category: "Body Treatments", durationMins: 90, price: 750, description: "Exfoliating scrub followed by a nourishing body wrap." },
    { name: "Brow Lamination", category: "Brows & Lashes", durationMins: 45, price: 350, description: "Brushed-up, full-looking brows that last 6–8 weeks." },
    { name: "Lash Lift & Tint", category: "Brows & Lashes", durationMins: 60, price: 450, description: "Curled, darkened lashes with zero maintenance." },
    { name: "Full Leg Wax", category: "Waxing", durationMins: 45, price: 300, description: "Smooth, long-lasting hair removal for full legs." },
    { name: "Gel Manicure", category: "Nails", durationMins: 60, price: 250, description: "Long-lasting gel polish with cuticle care and hand massage." },
    { name: "Luxury Pedicure", category: "Nails", durationMins: 75, price: 350, description: "Foot soak, scrub, shape and gel polish application." },
  ];

  await prisma.service.createMany({
    data: serviceData.map((s) => ({ ...s, spaId: spa.id })),
  });

  console.log(`\n🌸 Spa created: "${spa.name}"`);
  console.log(`✨ 10 services seeded`);
  console.log(`\n⚠️  Add to your .env:\n  DEFAULT_SPA_ID="${spa.id}"\n  NEXT_PUBLIC_SPA_ID="${spa.id}"\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
