/**
 * Adds missing non-facial service categories and re-links all therapists.
 * Run with: node node_modules/.bin/jiti add-missing-services.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter, log: [] });

const MISSING_SERVICES = [
  // --- Nails ---
  { category: "Nails", name: "Classic Manicure", durationMins: 45, price: 220, description: "Cuticle care, nail shaping, buff and polish application." },
  { category: "Nails", name: "Gel Manicure", durationMins: 60, price: 290, description: "Long-lasting gel polish with cuticle care, shaping and hand massage." },
  { category: "Nails", name: "Classic Pedicure", durationMins: 60, price: 280, description: "Foot soak, cuticle care, callus treatment, nail shaping and polish." },
  { category: "Nails", name: "Luxury Gel Pedicure", durationMins: 75, price: 400, description: "Full pedicure with exfoliating scrub, extended foot and calf massage, and gel polish." },
  { category: "Nails", name: "Nail Extensions — Full Set", durationMins: 90, price: 580, description: "Full set of acrylic or gel nail extensions, shaped and finished to your preferred length." },
  { category: "Nails", name: "Nail Extensions — Infill", durationMins: 60, price: 320, description: "Infill and reshape of existing nail extensions with a fresh gel or polish finish." },
  { category: "Nails", name: "Bio Sculpture Gel — Full Set", durationMins: 90, price: 620, description: "Full set of Bio Sculpture gel nails, known for flexibility and nail health." },
  { category: "Nails", name: "Bio Sculpture Gel — Infill", durationMins: 60, price: 350, description: "Infill of existing Bio Sculpture gel nails for a fresh, glossy finish." },
  { category: "Nails", name: "Shellac / Gel Polish", durationMins: 45, price: 270, description: "Shellac or gel polish application for a chip-free finish lasting up to 3 weeks." },
  { category: "Nails", name: "Nail Art (per nail)", durationMins: 15, price: 30, description: "Custom nail art per nail — geometric, floral, abstract or freehand designs." },
  // --- Brows & Lashes ---
  { category: "Brows & Lashes", name: "Brow Wax & Shape", durationMins: 20, price: 120, description: "Precision eyebrow waxing and shaping to frame your face perfectly." },
  { category: "Brows & Lashes", name: "Brow Tint", durationMins: 20, price: 100, description: "Semi-permanent brow tint to define and enhance the natural brow shape." },
  { category: "Brows & Lashes", name: "Brow Lamination", durationMins: 60, price: 380, description: "Restructures brow hairs into a full, brushed-up shape lasting 6–8 weeks." },
  { category: "Brows & Lashes", name: "Brow Lamination & Tint", durationMins: 75, price: 480, description: "Brow lamination combined with a tint for depth and definition lasting 6–8 weeks." },
  { category: "Brows & Lashes", name: "Henna Brows", durationMins: 45, price: 280, description: "Natural henna tint to stain the skin beneath the brows for a bold, defined look." },
  { category: "Brows & Lashes", name: "Lash Lift", durationMins: 45, price: 420, description: "Curls natural lashes from root to tip for a wide-eyed, mascara-free look lasting up to 8 weeks." },
  { category: "Brows & Lashes", name: "Lash Lift & Tint", durationMins: 60, price: 520, description: "Lash lift combined with a tint for bold, dark, mascara-free results lasting up to 8 weeks." },
  { category: "Brows & Lashes", name: "Lash Tint", durationMins: 20, price: 130, description: "Semi-permanent lash tint for darker, more defined lashes without mascara." },
  // --- Waxing ---
  { category: "Waxing", name: "Eyebrow Wax", durationMins: 15, price: 90, description: "Clean and precise brow waxing for a polished, defined shape." },
  { category: "Waxing", name: "Lip Wax", durationMins: 10, price: 70, description: "Quick and effective upper lip waxing." },
  { category: "Waxing", name: "Chin Wax", durationMins: 10, price: 80, description: "Gentle chin waxing for smooth, hair-free skin." },
  { category: "Waxing", name: "Full Face Wax", durationMins: 30, price: 280, description: "Full facial waxing including brows, lip, chin and sides of face." },
  { category: "Waxing", name: "Underarm Wax", durationMins: 15, price: 130, description: "Underarm waxing for smooth, long-lasting results." },
  { category: "Waxing", name: "Half Leg Wax", durationMins: 30, price: 240, description: "Lower or upper half leg hair removal using premium hot wax." },
  { category: "Waxing", name: "Full Leg Wax", durationMins: 45, price: 390, description: "Full leg hair removal using premium hot wax. Finished with soothing post-wax lotion." },
  { category: "Waxing", name: "Bikini Wax", durationMins: 30, price: 280, description: "Comfortable bikini line waxing using low-temperature hot wax." },
  { category: "Waxing", name: "Brazilian Wax", durationMins: 45, price: 380, description: "Full Brazilian waxing using premium hot wax." },
  { category: "Waxing", name: "Hollywood Wax", durationMins: 45, price: 420, description: "Complete hair removal using premium hot wax — smooth and long-lasting." },
  // --- Body Treatments ---
  { category: "Body Treatments", name: "Back, Neck & Shoulder Massage", durationMins: 30, price: 350, description: "Targeted relief massage focusing on the upper body. Ideal for tension relief." },
  { category: "Body Treatments", name: "Swedish Full Body Massage", durationMins: 60, price: 620, description: "A full-body relaxation massage using slow, rhythmic strokes to melt away tension." },
  { category: "Body Treatments", name: "Hot Stone Massage", durationMins: 75, price: 750, description: "Deeply relaxing massage using heated basalt stones to melt tension and warm muscles." },
  { category: "Body Treatments", name: "Aromatherapy Massage", durationMins: 60, price: 680, description: "Relaxation massage using blended essential oils tailored to your mood and needs." },
  { category: "Body Treatments", name: "Deep Tissue Massage", durationMins: 60, price: 700, description: "Targeted deep tissue massage to release chronic tension and muscle knots." },
  { category: "Body Treatments", name: "Body Scrub", durationMins: 45, price: 490, description: "Full body exfoliating scrub to remove dead skin cells and reveal softer, smoother skin." },
  { category: "Body Treatments", name: "Body Wrap", durationMins: 60, price: 650, description: "Nourishing body wrap treatment to hydrate, detoxify and leave skin glowing." },
];

// Therapist category mappings for ALL staff
const THERAPIST_CATEGORIES: Record<string, string[]> = {
  "amara@perfect10lalucia.co.za":   ["Nimue Facials", "Environ Facials"],
  "jade@perfect10lalucia.co.za":    ["Nails"],
  "leila@perfect10lalucia.co.za":   ["Brows & Lashes", "Waxing"],
  "sasha@perfect10lalucia.co.za":   ["Body Treatments", "Waxing"],
  "tanya@perfect10lalucia.co.za":   ["Placecol Facials", "Guinot Facials", "Dermalogica Facials"],
  "nomvula@perfect10lalucia.co.za": ["Nails"],
  "chloe@perfect10lalucia.co.za":   ["Nimue Facials", "Environ Facials"],
  "priya@perfect10lalucia.co.za":   ["Body Treatments"],
  "monique@perfect10lalucia.co.za": ["Dermalogica Facials", "Aesthetic Facials", "Placecol Facials"],
};

async function main() {
  const spa = await prisma.spa.findFirst();
  if (!spa) throw new Error("No spa found.");

  // Check what categories already exist
  const existing = await prisma.service.findMany({
    where: { spaId: spa.id },
    select: { category: true, name: true },
  });
  const existingNames = new Set(existing.map((s) => `${s.category}::${s.name}`));
  const existingCats = new Set(existing.map((s) => s.category));

  // Add missing service categories
  const toInsert = MISSING_SERVICES.filter(
    (s) => !existingNames.has(`${s.category}::${s.name}`)
  );

  if (toInsert.length > 0) {
    const result = await prisma.service.createMany({
      data: toInsert.map((s) => ({ ...s, spaId: spa.id })),
      skipDuplicates: true,
    });
    console.log(`✅ Inserted ${result.count} new services`);
  } else {
    console.log("ℹ️  All non-facial services already exist");
  }

  // Re-link all therapists to their correct services
  const allServices = await prisma.service.findMany({
    where: { spaId: spa.id, isActive: true },
    select: { id: true, category: true },
  });

  const allStaff = await prisma.staff.findMany({
    where: { spaId: spa.id },
    include: { user: { select: { email: true, name: true } } },
  });

  let linked = 0;
  for (const staff of allStaff) {
    const email = staff.user.email ?? "";
    const cats = THERAPIST_CATEGORIES[email];
    if (!cats) {
      console.log(`  ⏭️  ${staff.user.name} — no category mapping, skipping`);
      continue;
    }

    const serviceIds = allServices
      .filter((s) => cats.includes(s.category ?? ""))
      .map((s) => s.id);

    if (serviceIds.length === 0) {
      console.log(`  ⚠️  ${staff.user.name} — no matching services for: ${cats.join(", ")}`);
      continue;
    }

    // Delete old links for this staff member then re-create
    await prisma.staffService.deleteMany({ where: { staffId: staff.id } });
    await prisma.staffService.createMany({
      data: serviceIds.map((serviceId) => ({ staffId: staff.id, serviceId })),
      skipDuplicates: true,
    });

    console.log(`  ✅ ${staff.user.name} → ${serviceIds.length} services (${cats.join(", ")})`);
    linked += serviceIds.length;
  }

  console.log(`\n🌸 Done — ${linked} total therapist–service links created.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
