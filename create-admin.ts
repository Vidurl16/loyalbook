/**
 * Creates an owner (admin) account for Perfect 10 La Lucia.
 * Run with: node node_modules/.bin/jiti create-admin.ts
 *
 * Usage:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourpassword node node_modules/.bin/jiti create-admin.ts
 *
 * Defaults (if env vars not set):
 *   email:    admin@perfect10lalucia.co.za
 *   password: Perfect10Admin!
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter, log: [] });

async function main() {
  const email    = process.env.ADMIN_EMAIL    ?? "admin@perfect10lalucia.co.za";
  const password = process.env.ADMIN_PASSWORD ?? "Perfect10Admin!";
  const name     = process.env.ADMIN_NAME     ?? "Perfect 10 Admin";

  const spa = await prisma.spa.findFirst();
  if (!spa) throw new Error("No spa found — run seed.ts first.");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "owner") {
      await prisma.user.update({ where: { email }, data: { role: "owner" } });
      console.log(`✅ Upgraded existing user ${email} to owner role.`);
    } else {
      console.log(`⏭️  Admin already exists: ${email}`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "owner",
      spaId: spa.id,
    },
  });

  console.log(`\n✅ Admin account created!`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`\n👉 Log in at /login and you'll have full dashboard access.\n`);
  console.log(`⚠️  Change your password after first login.\n`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
