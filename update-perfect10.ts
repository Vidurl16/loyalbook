import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any) as any;

const SPA_ID = process.env.DEFAULT_SPA_ID!;

const SERVICES = [
  // NAILS
  { category: "Nails", name: "Classic Manicure", durationMins: 45, price: 220, description: "Cuticle care, nail shaping, buff and polish application. The perfect weekly nail refresh." },
  { category: "Nails", name: "Gel Manicure", durationMins: 60, price: 290, description: "Long-lasting gel polish with cuticle care, shaping and hand massage. Chip-free for up to 3 weeks." },
  { category: "Nails", name: "Classic Pedicure", durationMins: 60, price: 280, description: "Foot soak, cuticle care, callus treatment, nail shaping and polish. Feet feel soft and refreshed." },
  { category: "Nails", name: "Luxury Gel Pedicure", durationMins: 75, price: 400, description: "Full pedicure with exfoliating scrub, extended foot and calf massage, and long-lasting gel polish finish." },
  { category: "Nails", name: "Nail Extensions — Full Set", durationMins: 90, price: 580, description: "Full set of acrylic or gel nail extensions, shaped and finished to your preferred length and style." },
  { category: "Nails", name: "Nail Extensions — Infill", durationMins: 60, price: 320, description: "Infill and reshape of your existing nail extensions with a fresh gel or polish finish." },
  // FACIALS (Nimue)
  { category: "Facials", name: "Nimue Express Facial", durationMins: 30, price: 395, description: "A quick but effective Nimue skin treatment. Cleanse, exfoliate and targeted serum application for an instant glow — perfect for a lunch break." },
  { category: "Facials", name: "Nimue Classic Facial", durationMins: 60, price: 595, description: "Our signature personalised Nimue facial. Skin analysis, deep cleanse, exfoliation, massage and customised mask to leave your skin refreshed and balanced." },
  { category: "Facials", name: "Nimue Active Facial", durationMins: 60, price: 650, description: "Targeted Nimue treatment for oily, combination and congested skin. Deep cleanse, extractions and oil-regulating masque to visibly clarify and minimise pores." },
  { category: "Facials", name: "Nimue Brightening Facial", durationMins: 75, price: 750, description: "Corrects uneven skin tone, dark spots and hyperpigmentation using Nimue's advanced brightening actives. Skin emerges noticeably more radiant and even." },
  { category: "Facials", name: "Nimue Anti-Aging Facial", durationMins: 75, price: 795, description: "Lifts, firms and plumps mature skin using Nimue's peptide-rich formulations. Combines facial massage, targeted serums and an intensive anti-aging masque." },
  { category: "Facials", name: "Nimue Sensitive Skin Facial", durationMins: 60, price: 650, description: "Calms reactive, sensitised and rosacea-prone skin with Nimue's ultra-gentle protocol. Reduces redness and fortifies the skin barrier without irritation." },
  { category: "Facials", name: "Nimue Resurfacing Facial", durationMins: 75, price: 850, description: "Advanced skin renewal treatment using Nimue resurfacing actives. Smooths texture, fades pigmentation and reveals fresher, younger-looking skin." },
  // PEELS (Nimue)
  { category: "Peels", name: "Nimue Enzyme Peel", durationMins: 45, price: 650, description: "A gentle enzymatic exfoliation peel that dissolves dead skin and brightens without irritation. Ideal as a first peel or for sensitive skin types." },
  { category: "Peels", name: "Nimue Glycolic Peel", durationMins: 45, price: 750, description: "AHA-based peel to smooth texture, improve clarity and stimulate cell renewal. Skin is noticeably softer and more luminous with cumulative treatments." },
  { category: "Peels", name: "Nimue TDA Peel", durationMins: 60, price: 950, description: "Nimue's most advanced professional resurfacing peel combining TCA and complementary acids. Targets deeper pigmentation, scarring and skin ageing. Minimal downtime." },
  // BROWS & LASHES
  { category: "Brows & Lashes", name: "Brow Wax & Shape", durationMins: 20, price: 120, description: "Precision eyebrow waxing and shaping to frame your face perfectly." },
  { category: "Brows & Lashes", name: "Brow Lamination & Tint", durationMins: 60, price: 480, description: "Restructures brow hairs into a full, brushed-up shape lasting 6-8 weeks. Combined with a tint for depth and definition." },
  { category: "Brows & Lashes", name: "Lash Lift & Tint", durationMins: 60, price: 520, description: "Curls your natural lashes from root to tip for a wide-eyed mascara-free look. Combined with a tint for bold definition lasting up to 8 weeks." },
  // WAXING
  { category: "Waxing", name: "Eyebrow Wax", durationMins: 15, price: 90, description: "Clean and precise brow waxing for a polished, defined shape." },
  { category: "Waxing", name: "Lip Wax", durationMins: 10, price: 70, description: "Quick and effective upper lip waxing using gentle warm wax." },
  { category: "Waxing", name: "Full Leg Wax", durationMins: 45, price: 390, description: "Smooth, long-lasting full leg hair removal using premium hot wax. Finished with soothing post-wax lotion." },
  { category: "Waxing", name: "Bikini Wax", durationMins: 30, price: 280, description: "Comfortable bikini line waxing using low-temperature hot wax for sensitive skin." },
  { category: "Waxing", name: "Brazilian Wax", durationMins: 45, price: 380, description: "Full Brazilian waxing using premium hot wax. Leaves skin smooth and irritation-free." },
  // MASSAGE
  { category: "Massage", name: "Back, Neck & Shoulder Massage", durationMins: 30, price: 350, description: "Targeted relief massage focusing on the upper body. Ideal for desk-workers and tension relief." },
  { category: "Massage", name: "Swedish Full Body Massage", durationMins: 60, price: 620, description: "A full-body relaxation massage using slow, rhythmic strokes to melt away tension and leave skin deeply nourished." },
];

async function main() {
  console.log("SPA_ID:", SPA_ID);

  await prisma.spa.update({
    where: { id: SPA_ID },
    data: {
      name: "Perfect 10 La Lucia",
      address: "La Lucia Mall, 24 Chartwell Dr, La Lucia, Durban, 4051",
    },
  });
  console.log("✅ Spa updated: Perfect 10 La Lucia");

  const deleted = await prisma.service.deleteMany({ where: { spaId: SPA_ID } });
  console.log(`🗑  Deleted ${deleted.count} old services`);

  for (const svc of SERVICES) {
    await prisma.service.create({ data: { spaId: SPA_ID, ...svc } });
    process.stdout.write(".");
  }
  console.log(`\n✅ Inserted ${SERVICES.length} Perfect 10 services`);

  await prisma.$disconnect();
}

main().catch(console.error);
