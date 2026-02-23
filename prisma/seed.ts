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
    { name: "Therapeutic Treatment", category: "Nimue Facials", durationMins: 60, price: 510, description: "Nimue therapeutic facial tailored to your skin type. Includes deep cleanse, exfoliation, and targeted serum application." },
    { name: "Deep Cleanse Treatment", category: "Nimue Facials", durationMins: 60, price: 580, description: "Deeply purifying Nimue facial that clears congestion, minimises pores and leaves skin refreshed and clear." },
    { name: "35% Glycolic", category: "Nimue Facials", durationMins: 60, price: 910, description: "Professional Nimue glycolic peel to resurface the skin, refine texture and fade pigmentation." },
    { name: "7.5% TCA", category: "Nimue Facials", durationMins: 60, price: 990, description: "Nimue TCA peel for deeper resurfacing, addressing pigmentation, fine lines and uneven texture." },
    { name: "Active Rejuvenation 15% Bio active Complex", category: "Nimue Facials", durationMins: 75, price: 860, description: "Nimue bio-active rejuvenation treatment targeting visible signs of ageing with advanced actives." },
    { name: "Thermal Detox Treatment", category: "Nimue Facials", durationMins: 60, price: 710, description: "Nimue thermal detox to decongest and purify — ideal for oily and congested skin types." },
    { name: "Smart Micropeel for Sensitive Skin Treatment", category: "Nimue Facials", durationMins: 60, price: 770, description: "Gentle Nimue micropeel for sensitive skin to resurface without irritation." },
    { name: "NIMUE-SRC Environmentally Damaged Treatment", category: "Nimue Facials", durationMins: 75, price: 970, description: "Nimue SRC treatment targeting environmentally damaged and stressed skin." },
    { name: "NIMUE-SRC Hyper Pigmented Treatment", category: "Nimue Facials", durationMins: 75, price: 970, description: "Nimue SRC treatment targeting hyperpigmentation and uneven skin tone." },
    { name: "NIMUE-SRC Problematic Treatment", category: "Nimue Facials", durationMins: 75, price: 970, description: "Nimue SRC treatment for problematic and acne-prone skin." },
    { name: "Smart Resurfacer Treatment", category: "Nimue Facials", durationMins: 75, price: 1100, description: "Advanced Nimue resurfacing treatment for smoother, more refined skin." },
    { name: "Microneedling Treatment", category: "Nimue Facials", durationMins: 75, price: 1100, description: "Advanced Nimue microneedling to stimulate collagen, reduce scars and improve overall skin texture." },
    { name: "Collagen Face Film (Add-On)", category: "Nimue Facials", durationMins: 15, price: 250, description: "Nimue collagen face film add-on for enhanced hydration and firming results." },
    { name: "Anti-age Treatment Mask (Add-On)", category: "Nimue Facials", durationMins: 10, price: 120, description: "Nimue anti-ageing mask add-on to boost treatment results." },
    { name: "Super Fluid (Add-On)", category: "Nimue Facials", durationMins: 10, price: 200, description: "Nimue super fluid add-on for intensive nourishment and skin repair." },
    { name: "Alginate Mask (Add-On)", category: "Nimue Facials", durationMins: 10, price: 120, description: "Nimue alginate mask add-on for soothing and sealing in active ingredients." },
    { name: "Back Cleanse", category: "Nimue Facials", durationMins: 60, price: 530, description: "Nimue deep cleansing back treatment to clear congestion and improve skin clarity." },
    // --- Environ Facials ---
    { name: "Touch (45min)", category: "Environ Facials", durationMins: 45, price: 495, description: "Environ Essential Vitamin A treatment to nourish, protect and restore a healthy skin barrier." },
    { name: "Touch Youth+ (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Youth+ facial combining Vitamin A and C to target fine lines and restore radiance." },
    { name: "Touch Moisture+ (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Moisture+ facial to deeply hydrate and restore skin comfort." },
    { name: "Touch Comfort+ (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Comfort+ facial for sensitive and reactive skin types." },
    { name: "Touch Radiance+ (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Radiance+ facial to brighten and even out skin tone." },
    { name: "Frown (DF) (30min)", category: "Environ Facials", durationMins: 30, price: 430, description: "Environ focused treatment targeting frown lines and forehead wrinkles." },
    { name: "Eye (DF) (30min)", category: "Environ Facials", durationMins: 30, price: 430, description: "Environ focused eye area treatment for puffiness, dark circles and fine lines." },
    { name: "Texture (DF) (30min)", category: "Environ Facials", durationMins: 30, price: 430, description: "Environ focused treatment to refine skin texture and minimise pores." },
    { name: "Tone (DF) (30min)", category: "Environ Facials", durationMins: 30, price: 430, description: "Environ focused treatment to improve skin tone and luminosity." },
    { name: "Jawline (DF) (30min)", category: "Environ Facials", durationMins: 30, price: 310, description: "Environ focused jawline treatment to firm and define the lower face." },
    { name: "Body Profile (2x areas) (DF)", category: "Environ Facials", durationMins: 60, price: 530, description: "Environ focused body treatment targeting two areas for improved texture and tone." },
    { name: "Youth Reset (90min)", category: "Environ Facials", durationMins: 90, price: 845, description: "Comprehensive Environ anti-ageing treatment to firm, lift and restore youthful vitality." },
    { name: "Moisture Boost (90min)", category: "Environ Facials", durationMins: 90, price: 845, description: "Intensive Environ hydration treatment to restore moisture balance and comfort." },
    { name: "Moisture Boost (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ hydration treatment to restore moisture balance and comfort." },
    { name: "Comfort Calm (90min)", category: "Environ Facials", durationMins: 90, price: 845, description: "Environ calming treatment for sensitive and reactive skin types." },
    { name: "Comfort Calm (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ calming treatment for sensitive and reactive skin types." },
    { name: "Radiance Reveal (DF) (90min)", category: "Environ Facials", durationMins: 90, price: 845, description: "Environ Mela-Fade serum treatment targeting hyperpigmentation and uneven skin tone." },
    { name: "Radiance Reveal (DF) (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Mela-Fade serum treatment targeting hyperpigmentation and uneven skin tone." },
    { name: "Radiance Reveal (Derma-Lac) (90min)", category: "Environ Facials", durationMins: 90, price: 845, description: "Environ Derma-Lac radiance treatment for brighter, more even skin." },
    { name: "Radiance Reveal (Derma-Lac) (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Derma-Lac radiance treatment for brighter, more even skin." },
    { name: "Youth Reset (DF) (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ anti-ageing treatment with DF technology to firm and restore youthful skin." },
    { name: "Consultation Facial (45min)", category: "Environ Facials", durationMins: 45, price: 195, description: "Environ skin analysis and introductory facial — perfect for first-time clients." },
    { name: "1-3 Layers (60min)", category: "Environ Facials", durationMins: 60, price: 575, description: "Environ Youth Renewal Cool Peel 1–3 layers for gentle resurfacing and brightening." },
    { name: "4-6 Layers (90min)", category: "Environ Facials", durationMins: 90, price: 750, description: "Environ Youth Renewal Cool Peel 4–6 layers for intensive resurfacing and skin renewal." },
    { name: "Blemish Control Cool Peel (DF) (60min)", category: "Environ Facials", durationMins: 60, price: 445, description: "Environ cool peel treatment targeting blemishes, congestion and breakout-prone skin." },
    { name: "Hand and Foot Vitamin Wrap (20min)", category: "Environ Facials", durationMins: 20, price: 130, description: "Environ vitamin add-on wrap for hands and feet to nourish and restore." },
    { name: "Decollete Vitamin Treatment (DF)", category: "Environ Facials", durationMins: 20, price: 130, description: "Environ vitamin treatment add-on for the décolleté area." },
    { name: "Galvanic Treatment (30min)", category: "Environ Facials", durationMins: 30, price: 100, description: "Galvanic add-on treatment to enhance penetration of active ingredients." },
    // --- Placecol Facials ---
    { name: "Skin Recharge Facial", category: "Placecol Facials", durationMins: 60, price: 340, description: "Placecol energising facial to revitalise tired skin and restore natural luminosity." },
    { name: "Collagen Restore Facial", category: "Placecol Facials", durationMins: 60, price: 690, description: "Placecol collagen-boosting treatment to firm, plump and smooth the complexion." },
    { name: "Sensitive Care Facial", category: "Placecol Facials", durationMins: 60, price: 490, description: "Placecol gentle facial for sensitive skin types, soothing and calming irritation." },
    { name: "Vitamin C Radiance Facial", category: "Placecol Facials", durationMins: 60, price: 790, description: "Brightening Placecol facial packed with Vitamin C to even skin tone and boost radiance." },
    { name: "Clear Skin Facial", category: "Placecol Facials", durationMins: 60, price: 560, description: "Placecol targeted facial for blemish-prone skin — unclogs pores and calms breakouts." },
    { name: "25% Application", category: "Placecol Facials", durationMins: 30, price: 640, description: "Placecol 25% chemical peel application for skin resurfacing and renewal." },
    { name: "30% Application", category: "Placecol Facials", durationMins: 30, price: 680, description: "Placecol 30% chemical peel application for deeper resurfacing and correction." },
    // --- Guinot Facials ---
    { name: "Hydraclean Facial (60min)", category: "Guinot Facials", durationMins: 60, price: 440, description: "Guinot deep-cleansing hydration facial for a fresh, glowing complexion." },
    { name: "Hydradermine Facial (60min)", category: "Guinot Facials", durationMins: 60, price: 1045, description: "Guinot's signature rejuvenating facial with electrophoresis to infuse serums deep into the skin." },
    { name: "Hydradermine Age Logic Facial (60min)", category: "Guinot Facials", durationMins: 60, price: 1155, description: "Guinot anti-ageing facial targeting wrinkles and loss of firmness for visibly younger skin." },
    { name: "Hydradermine Lift Facial (60min)", category: "Guinot Facials", durationMins: 60, price: 1155, description: "Guinot lifting facial to firm, contour and visibly lift facial features." },
    { name: "Age/Lift Summum Facial (60min)", category: "Guinot Facials", durationMins: 60, price: 1375, description: "Guinot's ultimate luxury treatment combining lifting, firming and intensive anti-ageing actives." },
    // --- Dermalogica Facials ---
    { name: "Face Mapping", category: "Dermalogica Facials", durationMins: 15, price: 0, description: "Complimentary Dermalogica Face Mapping skin analysis to identify your skin concerns and recommend the right treatments." },
    { name: "Face Fit", category: "Dermalogica Facials", durationMins: 20, price: 150, description: "Dermalogica express skin treatment for a quick pick-me-up and targeted concern relief." },
    { name: "ProSkin 30", category: "Dermalogica Facials", durationMins: 30, price: 375, description: "Express Dermalogica personalised skin treatment with Face Mapping® analysis in 30 minutes." },
    { name: "ProSkin 30 + Boost", category: "Dermalogica Facials", durationMins: 45, price: 550, description: "Dermalogica ProSkin 30 with an additional targeted boost treatment." },
    { name: "ProSkin 60", category: "Dermalogica Facials", durationMins: 60, price: 770, description: "Dermalogica's signature 60-minute personalised facial with deep cleanse, exfoliation and targeted serums." },
    { name: "ProSkin 60 + Boost", category: "Dermalogica Facials", durationMins: 75, price: 990, description: "Dermalogica ProSkin 60 with an additional targeted boost treatment." },
    { name: "Pro Power Peel 30", category: "Dermalogica Facials", durationMins: 30, price: 800, description: "Dermalogica professional peel to resurface, brighten and renew in 30 minutes." },
    { name: "Pro Power Peel 60", category: "Dermalogica Facials", durationMins: 60, price: 1100, description: "Advanced Dermalogica peel for more intensive resurfacing and correction." },
    { name: "Pro Firm", category: "Dermalogica Facials", durationMins: 60, price: 1100, description: "Dermalogica pro treatment targeting loss of firmness and skin laxity." },
    { name: "Pro Bright", category: "Dermalogica Facials", durationMins: 60, price: 800, description: "Dermalogica pro brightening treatment to fade pigmentation and even skin tone." },
    { name: "Pro Clear", category: "Dermalogica Facials", durationMins: 60, price: 1100, description: "Dermalogica pro clearing treatment for acne-prone and congested skin." },
    { name: "Pro Calm", category: "Dermalogica Facials", durationMins: 60, price: 990, description: "Dermalogica pro calming treatment for sensitised and reactive skin." },
    { name: "Pro Neck Flash", category: "Dermalogica Facials", durationMins: 30, price: 350, description: "Dermalogica targeted neck treatment to firm and rejuvenate the neck area." },
    { name: "Pro Eye Flash", category: "Dermalogica Facials", durationMins: 30, price: 375, description: "Dermalogica targeted eye treatment to brighten and reduce puffiness." },
    { name: "Pro Restore", category: "Dermalogica Facials", durationMins: 60, price: 1990, description: "Dermalogica Pro Microneedling Restore treatment for advanced skin renewal." },
    { name: "Pro Restore & Ionactive", category: "Dermalogica Facials", durationMins: 75, price: 1990, description: "Dermalogica Pro Microneedling Restore combined with Ionactive infusion." },
    { name: "Ionactive", category: "Dermalogica Facials", durationMins: 60, price: 1990, description: "Dermalogica Ionactive treatment for deep active infusion and skin transformation." },
    // --- Aesthetic Facials ---
    { name: "Dermaplaning Facial", category: "Aesthetic Facials", durationMins: 60, price: 600, description: "Aesthetic dermaplaning to remove dead skin cells and fine vellus hair, revealing smoother, brighter skin instantly." },
    { name: "Microneedling Treatments", category: "Aesthetic Facials", durationMins: 60, price: 0, description: "Aesthetic microneedling treatments — price on request. Please consult your therapist." },
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
