import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any) as any;
const services = await prisma.service.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }], select: { category: true, name: true, durationMins: true, price: true, isActive: true } });
const byCategory: Record<string, any[]> = {};
for (const s of services) { (byCategory[s.category] = byCategory[s.category] || []).push(s); }
for (const [cat, items] of Object.entries(byCategory)) {
  console.log(`\n=== ${cat} (${items.length}) ===`);
  for (const s of items) console.log(`  ${s.isActive ? "✅" : "❌"} ${s.name} — R${s.price} / ${s.durationMins}min`);
}
console.log("\nTOTAL:", services.length);
await prisma.$disconnect();
