import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter, log: [] });
const SPA_ID = process.env.NEXT_PUBLIC_SPA_ID!;

const facials = [
  { name: "Therapeutic Treatment", category: "Nimue Facials", durationMins: 60, price: 510, description: "Nimue therapeutic facial tailored to your skin type." },
  { name: "Deep Cleanse Treatment", category: "Nimue Facials", durationMins: 60, price: 580, description: "Deeply purifying Nimue facial that clears congestion and leaves skin refreshed." },
  { name: "35% Glycolic", category: "Nimue Facials", durationMins: 60, price: 910, description: "Professional Nimue glycolic peel to resurface the skin and fade pigmentation." },
  { name: "7.5% TCA", category: "Nimue Facials", durationMins: 60, price: 990, description: "Nimue TCA peel for deeper resurfacing, addressing pigmentation and fine lines." },
  { name: "Active Rejuvenation 15% Bio active Complex", category: "Nimue Facials", durationMins: 75, price: 860, description: "Nimue bio-active rejuvenation targeting visible signs of ageing." },
  { name: "Thermal Detox Treatment", category: "Nimue Facials", durationMins: 60, price: 710, description: "Nimue thermal detox to decongest and purify — ideal for oily skin." },
  { name: "Smart Micropeel for Sensitive Skin Treatment", category: "Nimue Facials", durationMins: 60, price: 770, description: "Gentle Nimue micropeel for sensitive skin." },
  { name: "NIMUE-SRC Environmentally Damaged Treatment", category: "Nimue Facials", durationMins: 75, price: 970, description: "Nimue SRC treatment targeting environmentally damaged and stressed skin." },
  { name: "NIMUE-SRC Hyper Pigmented Treatment", category: "Nimue Facials", durationMins: 75, price: 970, description: "Nimue SRC treatment targeting hyperpigmentation and uneven skin tone." },
  { name: "NIMUE-SRC Problematic Treatment", category: "Nimue Facials", durationMins: 75, price: 970, description: "Nimue SRC treatment for problematic and acne-prone skin." },
  { name: "Smart Resurfacer Treatment", category: "Nimue Facials", durationMins: 75, price: 1100, description: "Advanced Nimue resurfacing for smoother, more refined skin." },
  { name: "Microneedling Treatment", category: "Nimue Facials", durationMins: 75, price: 1100, description: "Nimue microneedling to stimulate collagen and improve skin texture." },
  { name: "Collagen Face Film (Add-On)", category: "Nimue Facials", durationMins: 15, price: 250, description: "Nimue collagen face film add-on for enhanced hydration and firming." },
  { name: "Anti-age Treatment Mask (Add-On)", category: "Nimue Facials", durationMins: 10, price: 120, description: "Nimue anti-ageing mask add-on." },
  { name: "Super Fluid (Add-On)", category: "Nimue Facials", durationMins: 10, price: 200, description: "Nimue super fluid add-on for intensive nourishment." },
  { name: "Alginate Mask (Add-On)", category: "Nimue Facials", durationMins: 10, price: 120, description: "Nimue alginate mask add-on for soothing and sealing active ingredients." },
  { name: "Back Cleanse", category: "Nimue Facials", durationMins: 60, price: 530, description: "Nimue deep cleansing back treatment." },
  { name: "Touch (45min)", category: "Environ Facials", durationMins: 45, price: 495, description: "Environ Essential Vitamin A treatment to nourish and restore a healthy skin barrier." },
  { name: "Touch Youth+ (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Youth+ facial targeting fine lines and restoring radiance." },
  { name: "Touch Moisture+ (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Moisture+ facial to deeply hydrate and restore skin comfort." },
  { name: "Touch Comfort+ (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Comfort+ facial for sensitive and reactive skin types." },
  { name: "Touch Radiance+ (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Radiance+ facial to brighten and even out skin tone." },
  { name: "Frown (DF) (30min)", category: "Environ Facials", durationMins: 30, price: 430, description: "Environ focused treatment targeting frown lines and forehead wrinkles." },
  { name: "Eye (DF) (30min)", category: "Environ Facials", durationMins: 30, price: 430, description: "Environ focused eye area treatment for puffiness and fine lines." },
  { name: "Texture (DF) (30min)", category: "Environ Facials", durationMins: 30, price: 430, description: "Environ focused treatment to refine skin texture and minimise pores." },
  { name: "Tone (DF) (30min)", category: "Environ Facials", durationMins: 30, price: 430, description: "Environ focused treatment to improve skin tone and luminosity." },
  { name: "Jawline (DF) (30min)", category: "Environ Facials", durationMins: 30, price: 310, description: "Environ focused jawline treatment to firm and define the lower face." },
  { name: "Body Profile (2x areas) (DF)", category: "Environ Facials", durationMins: 60, price: 530, description: "Environ focused body treatment targeting two areas." },
  { name: "Youth Reset (90min)", category: "Environ Facials", durationMins: 90, price: 845, description: "Comprehensive Environ anti-ageing treatment to firm, lift and restore youthful vitality." },
  { name: "Moisture Boost (90min)", category: "Environ Facials", durationMins: 90, price: 845, description: "Intensive Environ hydration treatment to restore moisture balance." },
  { name: "Moisture Boost (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ hydration treatment to restore moisture balance." },
  { name: "Comfort Calm (90min)", category: "Environ Facials", durationMins: 90, price: 845, description: "Environ calming treatment for sensitive and reactive skin types." },
  { name: "Comfort Calm (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ calming treatment for sensitive and reactive skin types." },
  { name: "Radiance Reveal (DF) (90min)", category: "Environ Facials", durationMins: 90, price: 845, description: "Environ Mela-Fade serum treatment targeting hyperpigmentation." },
  { name: "Radiance Reveal (DF) (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Mela-Fade serum treatment targeting hyperpigmentation." },
  { name: "Radiance Reveal (Derma-Lac) (90min)", category: "Environ Facials", durationMins: 90, price: 845, description: "Environ Derma-Lac radiance treatment for brighter, more even skin." },
  { name: "Radiance Reveal (Derma-Lac) (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ Derma-Lac radiance treatment for brighter, more even skin." },
  { name: "Youth Reset (DF) (60min)", category: "Environ Facials", durationMins: 60, price: 660, description: "Environ anti-ageing treatment with DF technology." },
  { name: "Consultation Facial (45min)", category: "Environ Facials", durationMins: 45, price: 195, description: "Environ skin analysis and introductory facial — perfect for first-time clients." },
  { name: "1-3 Layers (60min)", category: "Environ Facials", durationMins: 60, price: 575, description: "Environ Youth Renewal Cool Peel 1–3 layers for gentle resurfacing." },
  { name: "4-6 Layers (90min)", category: "Environ Facials", durationMins: 90, price: 750, description: "Environ Youth Renewal Cool Peel 4–6 layers for intensive resurfacing." },
  { name: "Blemish Control Cool Peel (DF) (60min)", category: "Environ Facials", durationMins: 60, price: 445, description: "Environ cool peel targeting blemishes and breakout-prone skin." },
  { name: "Hand and Foot Vitamin Wrap (20min)", category: "Environ Facials", durationMins: 20, price: 130, description: "Environ vitamin add-on wrap for hands and feet." },
  { name: "Decollete Vitamin Treatment (DF)", category: "Environ Facials", durationMins: 20, price: 130, description: "Environ vitamin treatment add-on for the décolleté area." },
  { name: "Galvanic Treatment (30min)", category: "Environ Facials", durationMins: 30, price: 100, description: "Galvanic add-on to enhance penetration of active ingredients." },
  { name: "Skin Recharge Facial", category: "Placecol Facials", durationMins: 60, price: 340, description: "Placecol energising facial to revitalise tired skin." },
  { name: "Collagen Restore Facial", category: "Placecol Facials", durationMins: 60, price: 690, description: "Placecol collagen-boosting treatment to firm, plump and smooth." },
  { name: "Sensitive Care Facial", category: "Placecol Facials", durationMins: 60, price: 490, description: "Placecol gentle facial for sensitive skin types." },
  { name: "Vitamin C Radiance Facial", category: "Placecol Facials", durationMins: 60, price: 790, description: "Brightening Placecol facial with Vitamin C to even skin tone." },
  { name: "Clear Skin Facial", category: "Placecol Facials", durationMins: 60, price: 560, description: "Placecol targeted facial for blemish-prone skin." },
  { name: "25% Application", category: "Placecol Facials", durationMins: 30, price: 640, description: "Placecol 25% chemical peel application." },
  { name: "30% Application", category: "Placecol Facials", durationMins: 30, price: 680, description: "Placecol 30% chemical peel application." },
  { name: "Hydraclean Facial (60min)", category: "Guinot Facials", durationMins: 60, price: 440, description: "Guinot deep-cleansing hydration facial." },
  { name: "Hydradermine Facial (60min)", category: "Guinot Facials", durationMins: 60, price: 1045, description: "Guinot's signature rejuvenating facial with electrophoresis." },
  { name: "Hydradermine Age Logic Facial (60min)", category: "Guinot Facials", durationMins: 60, price: 1155, description: "Guinot anti-ageing facial targeting wrinkles and loss of firmness." },
  { name: "Hydradermine Lift Facial (60min)", category: "Guinot Facials", durationMins: 60, price: 1155, description: "Guinot lifting facial to firm, contour and visibly lift facial features." },
  { name: "Age/Lift Summum Facial (60min)", category: "Guinot Facials", durationMins: 60, price: 1375, description: "Guinot's ultimate luxury anti-ageing treatment." },
  { name: "Face Mapping", category: "Dermalogica Facials", durationMins: 15, price: 0, description: "Complimentary Dermalogica Face Mapping skin analysis." },
  { name: "Face Fit", category: "Dermalogica Facials", durationMins: 20, price: 150, description: "Dermalogica express skin treatment." },
  { name: "ProSkin 30", category: "Dermalogica Facials", durationMins: 30, price: 375, description: "Express Dermalogica personalised skin treatment in 30 minutes." },
  { name: "ProSkin 30 + Boost", category: "Dermalogica Facials", durationMins: 45, price: 550, description: "Dermalogica ProSkin 30 with additional targeted boost." },
  { name: "ProSkin 60", category: "Dermalogica Facials", durationMins: 60, price: 770, description: "Dermalogica's signature 60-minute personalised facial." },
  { name: "ProSkin 60 + Boost", category: "Dermalogica Facials", durationMins: 75, price: 990, description: "Dermalogica ProSkin 60 with additional targeted boost." },
  { name: "Pro Power Peel 30", category: "Dermalogica Facials", durationMins: 30, price: 800, description: "Dermalogica professional peel in 30 minutes." },
  { name: "Pro Power Peel 60", category: "Dermalogica Facials", durationMins: 60, price: 1100, description: "Advanced Dermalogica peel for intensive resurfacing." },
  { name: "Pro Firm", category: "Dermalogica Facials", durationMins: 60, price: 1100, description: "Dermalogica pro treatment targeting loss of firmness." },
  { name: "Pro Bright", category: "Dermalogica Facials", durationMins: 60, price: 800, description: "Dermalogica pro brightening treatment." },
  { name: "Pro Clear", category: "Dermalogica Facials", durationMins: 60, price: 1100, description: "Dermalogica pro clearing treatment for acne-prone skin." },
  { name: "Pro Calm", category: "Dermalogica Facials", durationMins: 60, price: 990, description: "Dermalogica pro calming treatment for sensitised skin." },
  { name: "Pro Neck Flash", category: "Dermalogica Facials", durationMins: 30, price: 350, description: "Dermalogica targeted neck treatment." },
  { name: "Pro Eye Flash", category: "Dermalogica Facials", durationMins: 30, price: 375, description: "Dermalogica targeted eye treatment." },
  { name: "Pro Restore", category: "Dermalogica Facials", durationMins: 60, price: 1990, description: "Dermalogica Pro Microneedling Restore treatment." },
  { name: "Pro Restore & Ionactive", category: "Dermalogica Facials", durationMins: 75, price: 1990, description: "Dermalogica Pro Microneedling Restore with Ionactive infusion." },
  { name: "Ionactive", category: "Dermalogica Facials", durationMins: 60, price: 1990, description: "Dermalogica Ionactive deep active infusion treatment." },
  { name: "Dermaplaning Facial", category: "Aesthetic Facials", durationMins: 60, price: 600, description: "Aesthetic dermaplaning for smoother, brighter skin instantly." },
  { name: "Microneedling Treatments", category: "Aesthetic Facials", durationMins: 60, price: 0, description: "Aesthetic microneedling — price on request. Please consult your therapist." },
];

async function main() {
  if (!SPA_ID) throw new Error("NEXT_PUBLIC_SPA_ID not set in .env");
  const allFacialCategories = ["Facials", "Nimue Facials", "Environ Facials", "Placecol Facials", "Guinot Facials", "Dermalogica Facials", "Aesthetic Facials"];

  // Get IDs of facial services to be deleted
  const toDelete = await prisma.service.findMany({
    where: { spaId: SPA_ID, category: { in: allFacialCategories } },
    select: { id: true },
  });
  const ids = toDelete.map((s) => s.id);

  if (ids.length > 0) {
    // Remove StaffService links first
    await prisma.staffService.deleteMany({ where: { serviceId: { in: ids } } });
    // Remove the services
    const deleted = await prisma.service.deleteMany({ where: { id: { in: ids } } });
    console.log(`🗑️  Deleted ${deleted.count} old facial services`);
  } else {
    console.log("No old facial services found to delete");
  }

  const created = await prisma.service.createMany({ data: facials.map((f) => ({ ...f, spaId: SPA_ID })) });
  console.log(`✅ ${created.count} facial treatments created`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
