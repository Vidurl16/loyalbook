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

  // Create default loyalty config — 10 points per R100 spent
  await prisma.loyaltyConfig.create({
    data: {
      spaId: spa.id,
      pointsPerUnit: 10,
      currencyUnitAmount: 100,
      rebookingBonus: 50,
      rebookingWindowDays: 56,
      birthdayBonus: 200,
      redemptionRate: 100,
      minRedeem: 500,
    },
  });

  // Seed Perfect 10 La Lucia services (actual treatment menu 2025/2026)
  const serviceData = [
    // --- Nimue Facials ---
    { name: "Nimue Therapeutic Treatment", category: "Facials", durationMins: 60, price: 510, description: "Nimue therapeutic facial tailored to your skin type. Includes deep cleanse, exfoliation, and targeted serum application." },
    { name: "Nimue Deep Cleanse Treatment", category: "Facials", durationMins: 60, price: 580, description: "Deeply purifying Nimue facial that clears congestion, minimises pores and leaves skin refreshed and clear." },
    { name: "Nimue 35% Glycolic Peel", category: "Facials", durationMins: 60, price: 910, description: "Professional Nimue glycolic peel to resurface the skin, refine texture and fade pigmentation." },
    { name: "Nimue Active Rejuvenation 15% Bio Active", category: "Facials", durationMins: 75, price: 860, description: "Nimue bio-active rejuvenation treatment targeting visible signs of ageing with advanced actives." },
    { name: "Nimue Thermal Detox Treatment", category: "Facials", durationMins: 60, price: 710, description: "Nimue thermal detox to decongest and purify — ideal for oily and congested skin types." },
    { name: "Nimue Smart Micropeel (Sensitive)", category: "Facials", durationMins: 60, price: 770, description: "Gentle Nimue micropeel for sensitive skin to resurface without irritation." },
    { name: "Nimue Microneedling Treatment", category: "Facials", durationMins: 75, price: 1100, description: "Advanced Nimue microneedling to stimulate collagen, reduce scars and improve overall skin texture." },
    // --- Environ Facials ---
    { name: "Environ Touch Vitamin A Facial (45min)", category: "Facials", durationMins: 45, price: 495, description: "Essential Environ Vitamin A treatment to nourish, protect and restore a healthy skin barrier." },
    { name: "Environ Touch Youth+ (60min)", category: "Facials", durationMins: 60, price: 660, description: "Environ Youth+ facial combining Vitamin A and C to target fine lines and restore radiance." },
    { name: "Environ Youth Reset (90min)", category: "Facials", durationMins: 90, price: 845, description: "Comprehensive Environ anti-ageing treatment to firm, lift and restore youthful vitality." },
    { name: "Environ Radiance Reveal (Mela-Fade, 90min)", category: "Facials", durationMins: 90, price: 845, description: "Environ Mela-Fade serum treatment targeting hyperpigmentation and uneven skin tone." },
    { name: "Environ Cool Peel 1–3 Layers (60min)", category: "Facials", durationMins: 60, price: 575, description: "Environ progressive peel using lactic and glycolic acids to resurface and brighten the skin." },
    { name: "Environ Consultation Facial (45min)", category: "Facials", durationMins: 45, price: 195, description: "Environ skin analysis and introductory facial — perfect for first-time clients." },
    // --- Placecol Facials ---
    { name: "Placecol Skin Recharge Facial", category: "Facials", durationMins: 60, price: 340, description: "Placecol energising facial to revitalise tired skin and restore natural luminosity." },
    { name: "Placecol Collagen Restore Facial", category: "Facials", durationMins: 60, price: 690, description: "Placecol collagen-boosting treatment to firm, plump and smooth the complexion." },
    { name: "Placecol Vitamin C Radiance Facial", category: "Facials", durationMins: 60, price: 790, description: "Brightening Placecol facial packed with Vitamin C to even skin tone and boost radiance." },
    { name: "Placecol Clear Skin Facial", category: "Facials", durationMins: 60, price: 560, description: "Placecol targeted facial for blemish-prone skin — unclogs pores and calms breakouts." },
    // --- Guinot Facials ---
    { name: "Guinot Hydraclean Facial (60min)", category: "Facials", durationMins: 60, price: 440, description: "Guinot deep-cleansing hydration facial for a fresh, glowing complexion." },
    { name: "Guinot Hydradermine Facial (60min)", category: "Facials", durationMins: 60, price: 1045, description: "Guinot's signature rejuvenating facial with electrophoresis to infuse serums deep into the skin." },
    { name: "Guinot Age Logic Facial (60min)", category: "Facials", durationMins: 60, price: 1155, description: "Guinot anti-ageing facial targeting wrinkles and loss of firmness for visibly younger skin." },
    { name: "Guinot Age Summum Facial (60min)", category: "Facials", durationMins: 60, price: 1375, description: "Guinot's ultimate luxury treatment combining lifting, firming and intensive anti-ageing actives." },
    // --- Dermalogica Facials ---
    { name: "Dermalogica ProSkin 30", category: "Facials", durationMins: 30, price: 375, description: "Express Dermalogica personalised skin treatment with Face Mapping® analysis in 30 minutes." },
    { name: "Dermalogica ProSkin 60", category: "Facials", durationMins: 60, price: 770, description: "Dermalogica's signature 60-minute personalised facial with deep cleanse, exfoliation and targeted serums." },
    { name: "Dermalogica Pro Power Peel 30", category: "Facials", durationMins: 30, price: 800, description: "Dermalogica professional peel to resurface, brighten and renew in 30 minutes." },
    { name: "Dermalogica Pro Power Peel 60", category: "Facials", durationMins: 60, price: 1100, description: "Advanced Dermalogica peel for more intensive resurfacing and correction." },
    // --- Aesthetic Facials ---
    { name: "Dermaplaning Facial", category: "Facials", durationMins: 60, price: 600, description: "Aesthetic dermaplaning to remove dead skin cells and fine vellus hair (peach fuzz), revealing smoother, brighter skin instantly." },
    // --- Nails: Manicures ---
    { name: "Express Manicure (30min)", category: "Nails", durationMins: 30, price: 245, description: "Quick, polished manicure including nail shaping, cuticle care and polish of your choice." },
    { name: "Signature Manicure", category: "Nails", durationMins: 45, price: 275, description: "Signature Perfect 10 manicure with cuticle care, nail shaping, hand scrub, massage and polish." },
    { name: "Manicure", category: "Nails", durationMins: 45, price: 260, description: "Classic manicure with shaping, cuticle care and polish." },
    { name: "Manicure with Gel Polish", category: "Nails", durationMins: 60, price: 420, description: "Classic manicure combined with long-lasting light-cure gel polish for up to 3 weeks of wear." },
    // --- Nails: Pedicures ---
    { name: "Express Pedicure", category: "Nails", durationMins: 30, price: 275, description: "Quick pedicure with nail shaping, cuticle care and polish." },
    { name: "Signature Pedicure", category: "Nails", durationMins: 60, price: 380, description: "Signature Perfect 10 pedicure with soak, exfoliation, massage and polish." },
    { name: "Pedicure", category: "Nails", durationMins: 60, price: 370, description: "Classic pedicure with shaping, cuticle care, callus treatment and polish." },
    { name: "Medi-Heel Pedicure", category: "Nails", durationMins: 75, price: 525, description: "Intensive pedicure targeting cracked heels with medicated treatment, scrub and extended massage." },
    { name: "Pedicure with Gel Polish", category: "Nails", durationMins: 75, price: 520, description: "Classic pedicure combined with long-lasting light-cure gel polish." },
    { name: "Medi-Heel Pedicure with Gel Polish", category: "Nails", durationMins: 90, price: 660, description: "Medi-Heel treatment combined with light-cure gel polish for perfectly groomed feet." },
    // --- Nails: Gel Polish ---
    { name: "Gel Polish on Hands", category: "Nails", durationMins: 45, price: 340, description: "Long-lasting light-cure gel polish on hands — chip-free colour for up to 3 weeks." },
    { name: "Gel Polish on Feet", category: "Nails", durationMins: 45, price: 340, description: "Long-lasting light-cure gel polish on feet." },
    { name: "Gel Polish on Hands & Feet", category: "Nails", durationMins: 75, price: 600, description: "Light-cure gel polish applied to both hands and feet in one session." },
    // --- Nails: Enhancements ---
    { name: "Nail Overlay (Acrylic/Gel)", category: "Nails", durationMins: 60, price: 450, description: "Acrylic or gel overlay for strength and structure on natural nails." },
    { name: "Nail Tips – Rounded/Squoval/Square (Acrylic or Gel)", category: "Nails", durationMins: 75, price: 490, description: "Classic nail tip extensions in rounded, squoval or square shapes using acrylic or gel." },
    { name: "Designer Tips (Stiletto/Ballerina/Almond/Oval)", category: "Nails", durationMins: 90, price: 550, description: "Designer nail tip extensions in stiletto, ballerina, almond or oval shapes." },
    { name: "Sculptured Nails (Acrylic/Gel)", category: "Nails", durationMins: 90, price: 640, description: "Hand-sculpted nail extensions built from scratch using acrylic or gel for a custom shape." },
    { name: "Bio Sculpture Overlay (Basic)", category: "Nails", durationMins: 60, price: 360, description: "Bio Sculpture gel overlay for natural-looking strength and protection." },
    { name: "Bio Sculpture Sculptured Nails", category: "Nails", durationMins: 90, price: 650, description: "Full Bio Sculpture sculptured nail extensions for a flawless, durable finish." },
    { name: "Two Week Fill (Acrylic/Gel)", category: "Nails", durationMins: 60, price: 330, description: "Maintenance fill to keep your acrylic or gel nails looking fresh and natural." },
    { name: "Soak Off", category: "Nails", durationMins: 30, price: 95, description: "Safe, professional soak off of existing gel or acrylic products." },
    // --- Brows & Lashes ---
    { name: "Brow Tint", category: "Brows & Lashes", durationMins: 20, price: 110, description: "Brow tint to define and darken brow hairs for a polished, groomed look." },
    { name: "Lash Tint", category: "Brows & Lashes", durationMins: 20, price: 120, description: "Lash tint for darker, more defined lashes without mascara." },
    { name: "Brow & Lash Tint", category: "Brows & Lashes", durationMins: 30, price: 195, description: "Combination brow and lash tint for a fully defined, groomed look." },
    { name: "Henna Brows (incl. Brow Shape)", category: "Brows & Lashes", durationMins: 60, price: 540, description: "Henna brow treatment that tints both the skin and hairs for a bold, defined brow that lasts longer than regular tint." },
    { name: "Keratin Lash Lift", category: "Brows & Lashes", durationMins: 60, price: 600, description: "Keratin-infused lash lift that curls and strengthens your natural lashes from root to tip for up to 8 weeks." },
    { name: "Keratin Brow Lamination (incl. Brow Shape)", category: "Brows & Lashes", durationMins: 60, price: 580, description: "Restructures brow hairs into a full, brushed-up shape lasting 6–8 weeks. Includes precision brow shaping." },
    { name: "Eyelash Extensions (Classic/Hybrid)", category: "Brows & Lashes", durationMins: 90, price: 760, description: "Classic or hybrid eyelash extensions applied one by one for a natural to glamorous look." },
    { name: "Volume Eyelash Extensions", category: "Brows & Lashes", durationMins: 120, price: 860, description: "Volume fan lash extensions for a dramatic, full lash look." },
    { name: "Two Week Lash Fill", category: "Brows & Lashes", durationMins: 60, price: 450, description: "Maintenance fill to keep your lash extensions looking full and fresh." },
    // --- Waxing ---
    { name: "Brow Wax", category: "Waxing", durationMins: 15, price: 110, description: "Precise brow waxing to shape and define your brows." },
    { name: "Lip Wax", category: "Waxing", durationMins: 10, price: 110, description: "Upper lip hair removal with gentle wax." },
    { name: "Full Face Wax (incl. Brows)", category: "Waxing", durationMins: 30, price: 280, description: "Full face hair removal including brows, lip, chin and sides." },
    { name: "Underarms Wax", category: "Waxing", durationMins: 15, price: 130, description: "Underarm hair removal with warm wax for smooth, long-lasting results." },
    { name: "Brazilian Wax", category: "Waxing", durationMins: 30, price: 290, description: "Brazilian bikini wax leaving a neat landing strip using low-temperature wax for sensitive skin." },
    { name: "Hollywood Wax", category: "Waxing", durationMins: 30, price: 360, description: "Hollywood complete bikini wax for a fully smooth result." },
    { name: "Half Leg Wax", category: "Waxing", durationMins: 30, price: 230, description: "Smooth hair removal from knee to ankle or knee to upper thigh." },
    { name: "Full Leg Wax", category: "Waxing", durationMins: 45, price: 295, description: "Complete full leg waxing for silky-smooth results." },
    { name: "Full Back Wax", category: "Waxing", durationMins: 30, price: 330, description: "Full back hair removal with warm wax." },
    // --- Body / Massage ---
    { name: "Back, Neck & Shoulder Massage (30min)", category: "Body Treatments", durationMins: 30, price: 380, description: "Targeted back, neck and shoulder massage to relieve tension and muscle tightness." },
    { name: "Back, Neck & Shoulder Massage (45min)", category: "Body Treatments", durationMins: 45, price: 430, description: "Extended back, neck and shoulder massage for deeper muscle relief." },
    { name: "Hot Stone Full Body Massage (75min)", category: "Body Treatments", durationMins: 75, price: 680, description: "Heated basalt stones combined with full-body massage to melt away deep tension and promote relaxation." },
    { name: "Aromatherapy Massage (60min)", category: "Body Treatments", durationMins: 60, price: 580, description: "Full-body aromatherapy massage using essential oils chosen for your mood and wellness goals." },
    { name: "Full Body Massage (60min)", category: "Body Treatments", durationMins: 60, price: 580, description: "Classic Swedish full-body massage for total relaxation and muscle relief." },
    { name: "Foot Massage (30min)", category: "Body Treatments", durationMins: 30, price: 230, description: "Soothing foot massage to relieve tension, improve circulation and pamper tired feet." },
    { name: "Indian Head Massage (30min)", category: "Body Treatments", durationMins: 30, price: 350, description: "Traditional Indian head massage targeting scalp, neck and shoulders to reduce stress and promote well-being." },
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
