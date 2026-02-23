/**
 * Seed fake therapists for Perfect 10 La Lucia.
 * Run with: node node_modules/.bin/jiti seed-therapists.ts
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter, log: [] });

async function main() {
  const spa = await prisma.spa.findFirst();
  if (!spa) throw new Error("No spa found. Run seed.ts first.");

  const allServices = await prisma.service.findMany({ where: { spaId: spa.id, isActive: true } });

  const byCategory = (cats: string[]) =>
    allServices.filter((s) => cats.includes(s.category)).map((s) => s.id);

  const therapists = [
    {
      name: "Amara Pillay",
      email: "amara@perfect10lalucia.co.za",
      bio: "Amara is a certified skin therapist with over 8 years of experience specialising in Nimue and Environ advanced facial treatments. She has a passion for corrective skincare and helping clients achieve their best skin.",
      color: "#c4a882",
      categories: ["Facials", "Body Treatments"],
    },
    {
      name: "Jade van der Berg",
      email: "jade@perfect10lalucia.co.za",
      bio: "Jade is Perfect 10's nail artistry expert with 6 years of experience in gel, acrylic, Bio Sculpture extensions and intricate nail art. Known for her precision and creative designs.",
      color: "#a8c4c0",
      categories: ["Nails"],
    },
    {
      name: "Leila Patel",
      email: "leila@perfect10lalucia.co.za",
      bio: "Leila specialises in brow and lash treatments including keratin lash lifts, brow lamination and henna brows. She is also a certified waxing therapist with a gentle, thorough technique.",
      color: "#c4a8b8",
      categories: ["Brows & Lashes", "Waxing"],
    },
    {
      name: "Sasha Reddy",
      email: "sasha@perfect10lalucia.co.za",
      bio: "Sasha is our body and wellness specialist with training in Swedish, hot stone and aromatherapy massage. Her treatments are deeply relaxing and tailored to each client's stress and tension points.",
      color: "#b8c4a8",
      categories: ["Body Treatments", "Waxing"],
    },
    {
      name: "Tanya Williams",
      email: "tanya@perfect10lalucia.co.za",
      bio: "Tanya is a multi-brand facial therapist trained in Placecol, Guinot and Dermalogica. She excels at skin analysis and creating personalised facial protocols for every skin type and concern.",
      color: "#c4b8a8",
      categories: ["Facials"],
    },
    {
      name: "Nomvula Dlamini",
      email: "nomvula@perfect10lalucia.co.za",
      bio: "Nomvula is a passionate nail technician with expertise in Bio Sculpture gel, shellac and intricate nail art. Known for her long-lasting finishes and attention to nail health.",
      color: "#d4b8e0",
      categories: ["Nails"],
    },
    {
      name: "Chloé Fourie",
      email: "chloe@perfect10lalucia.co.za",
      bio: "Chloé is a certified Nimue skin therapist specialising in corrective and anti-aging facials. She has completed advanced Nimue training and is passionate about results-driven skincare.",
      color: "#f0d5c8",
      categories: ["Facials", "Body Treatments"],
    },
    {
      name: "Priya Singh",
      email: "priya@perfect10lalucia.co.za",
      bio: "Priya is our wellness and massage specialist with expertise in Swedish, deep tissue, hot stone and aromatherapy massage. She tailors every session to relieve tension and restore balance.",
      color: "#c8e0d4",
      categories: ["Body Treatments"],
    },
    {
      name: "Monique Joubert",
      email: "monique@perfect10lalucia.co.za",
      bio: "Monique specialises in dermaplaning and advanced exfoliation treatments. She is also trained in full waxing services, including Brazilian and Hollywood. Known for her gentle, precise technique.",
      color: "#e0d4c8",
      categories: ["Facials", "Waxing"],
    },
  ];

  let created = 0;

  for (const t of therapists) {
    const existingUser = await prisma.user.findUnique({ where: { email: t.email } });
    if (existingUser) {
      console.log(`⏭️  Skipping ${t.name} (already exists)`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        spaId: spa.id,
        name: t.name,
        email: t.email,
        role: "staff",
      },
    });

    const staff = await prisma.staff.create({
      data: {
        userId: user.id,
        spaId: spa.id,
        bio: t.bio,
        color: t.color,
        workingHours: {
          mon: { open: "09:00", close: "17:00" },
          tue: { open: "09:00", close: "17:00" },
          wed: { open: "09:00", close: "17:00" },
          thu: { open: "09:00", close: "18:00" },
          fri: { open: "09:00", close: "18:00" },
          sat: { open: "08:00", close: "14:00" },
        },
      },
    });

    const serviceIds = byCategory(t.categories);
    if (serviceIds.length > 0) {
      await prisma.staffService.createMany({
        data: serviceIds.map((serviceId) => ({ staffId: staff.id, serviceId })),
        skipDuplicates: true,
      });
    }

    console.log(`✅ Created therapist: ${t.name} (${serviceIds.length} services linked)`);
    created++;
  }

  console.log(`\n🌸 Done — ${created} therapist(s) created.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
