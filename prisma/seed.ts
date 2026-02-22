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
    // Dermalogica Facials
    { name: "Pro Skin 30", category: "Facials", durationMins: 30, price: 450, description: "Express Dermalogica skin treatment featuring Face Mapping® analysis. Targets your most pressing skin concern in a results-driven 30-minute session — perfect for a lunch break facial." },
    { name: "Pro Skin 60", category: "Facials", durationMins: 60, price: 750, description: "Dermalogica's signature 60-minute treatment, fully personalised after a Face Mapping® skin analysis. Combines deep cleanse, exfoliation, extractions and targeted serums for visibly healthier skin." },
    { name: "Pro Skin 90", category: "Facials", durationMins: 90, price: 1050, description: "The ultimate Dermalogica experience. A comprehensive 90-minute skin treatment with Face Mapping®, advanced massage techniques, custom masque and targeted skin therapist prescriptions." },
    { name: "BioLumin-C Vitamin C Facial", category: "Facials", durationMins: 60, price: 850, description: "Harness the power of stabilised Vitamin C to brighten dull skin, reduce dark spots and stimulate collagen. Leaves skin luminous, even-toned and protected against environmental damage." },
    { name: "Age Smart® Anti-Ageing Facial", category: "Facials", durationMins: 75, price: 950, description: "Targets lines, wrinkles and loss of firmness using Dermalogica Age Smart® actives. Includes a peptide-rich masque and professional massage to lift, firm and restore youthful radiance." },
    { name: "UltraCalming Sensitive Skin Facial", category: "Facials", durationMins: 60, price: 800, description: "Specially formulated for reactive, sensitised and rosacea-prone skin. Uses Dermalogica UltraCalming system to reduce redness, fortify the skin barrier and restore comfort." },
    { name: "Clear Start Breakout Facial", category: "Facials", durationMins: 60, price: 750, description: "Targets congestion, breakouts and excess oil with Dermalogica Clear Start range. Includes professional extractions, salicylic acid exfoliation and a purifying masque to clarify the skin." },
    // Peels
    { name: "BioSurface Peel", category: "Peels", durationMins: 45, price: 900, description: "Dermalogica's professional resurfacing peel combining AHAs and BHAs to accelerate cell turnover, smooth texture, fade pigmentation and reveal fresher, younger-looking skin. Minimal downtime." },
    { name: "Rapid Reveal Peel", category: "Peels", durationMins: 30, price: 650, description: "A professional-strength enzyme and lactic acid peel that dissolves dead skin build-up and resurfaces in under 30 minutes. Skin is instantly brighter with continued improvement over days." },
    { name: "Phyto Replenish Hydration Peel", category: "Peels", durationMins: 45, price: 750, description: "A nourishing peel combining gentle exfoliation with intensive hydration. Ideal for dry, dehydrated or compromised skin — leaves skin plump, soft and deeply replenished." },
    // Body
    { name: "Stress Relief Body Massage", category: "Body Treatments", durationMins: 60, price: 650, description: "A therapeutic full-body massage using Dermalogica Phyto Replenish Body Oil. Slow, rhythmic strokes melt away tension, calm the nervous system and leave skin deeply nourished." },
    { name: "Body Hydration Wrap", category: "Body Treatments", durationMins: 75, price: 850, description: "Full-body exfoliation followed by an intensive Dermalogica body masque wrap. Skin emerges silky smooth, intensely hydrated and infused with replenishing botanical actives." },
    // Brows & Lashes
    { name: "Brow Lamination & Tint", category: "Brows & Lashes", durationMins: 60, price: 450, description: "Restructures brow hairs into a full, brushed-up shape that lasts 6-8 weeks. Combined with a precision tint for depth and definition — zero daily effort required." },
    { name: "Lash Lift & Tint", category: "Brows & Lashes", durationMins: 60, price: 500, description: "Curls your natural lashes from root to tip for a wide-eyed, mascara-free look. Combined with a keratin-enriched tint for bold, defined lashes that last up to 8 weeks." },
    // Waxing
    { name: "Full Leg Wax", category: "Waxing", durationMins: 45, price: 380, description: "Smooth, long-lasting hair removal for the full leg using premium hot wax. Finished with a soothing post-wax lotion to calm the skin and minimise ingrown hairs." },
    { name: "Bikini Wax", category: "Waxing", durationMins: 30, price: 280, description: "Precise, comfortable bikini line waxing using low-temperature hot wax for sensitive skin. Leaves the area clean, smooth and irritation-free." },
    // Nails
    { name: "Luxury Gel Manicure", category: "Nails", durationMins: 60, price: 320, description: "Includes cuticle care, nail shaping, hand scrub, massage and long-lasting gel polish application. Hands feel soft, nails look flawless for up to 3 weeks." },
    { name: "Luxury Gel Pedicure", category: "Nails", durationMins: 75, price: 420, description: "A foot soak, callus treatment, scrub, extended massage and gel polish finish. The ultimate foot treatment — perfect before a holiday or just as a treat." },
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
