/** Creates one populated demo client for screenshotting the customer flows. */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });

async function main() {
  const spa = await prisma.spa.findFirstOrThrow();
  const email = "client@perfect10.test";
  const passwordHash = await bcrypt.hash("ClientPass123!", 12);

  await prisma.user.deleteMany({ where: { email } });
  const user = await prisma.user.create({
    data: { email, name: "Amara Naidoo", role: "client", spaId: spa.id, passwordHash, marketingOptIn: true, dob: new Date("1994-07-20") },
  });
  const account = await prisma.loyaltyAccount.create({
    data: { clientId: user.id, spaId: spa.id, balance: 1250, lifetimeEarned: 3400, lastActivityAt: new Date() },
  });

  const service = await prisma.service.findFirstOrThrow({ where: { spaId: spa.id } });
  const past = await prisma.appointment.create({
    data: {
      spaId: spa.id, clientId: user.id, serviceId: service.id, status: "completed",
      startAt: new Date(Date.now() - 20 * 86400000), endAt: new Date(Date.now() - 20 * 86400000 + 3.6e6),
    },
  });
  await prisma.pointsTransaction.create({
    data: { accountId: account.id, appointmentId: past.id, type: "earned", amount: 340, description: `Earned from ${service.name}` },
  });
  await prisma.appointment.create({
    data: {
      spaId: spa.id, clientId: user.id, serviceId: service.id, status: "confirmed",
      startAt: new Date(Date.now() + 5 * 86400000), endAt: new Date(Date.now() + 5 * 86400000 + 3.6e6),
    },
  });

  console.log(`Demo client ready: ${email} / ClientPass123!`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
