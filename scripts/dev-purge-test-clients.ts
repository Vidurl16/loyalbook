/** Dev helper: removes the "Test Client" fixtures the security test suite leaves behind. */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const users = await prisma.user.findMany({ where: { name: "Test Client" }, select: { id: true } });
const ids = users.map((u) => u.id);
const accounts = await prisma.loyaltyAccount.findMany({ where: { clientId: { in: ids } }, select: { id: true } });
await prisma.pointsTransaction.deleteMany({ where: { accountId: { in: accounts.map((a) => a.id) } } });
await prisma.voucher.deleteMany({ where: { clientId: { in: ids } } });
await prisma.appointment.deleteMany({ where: { clientId: { in: ids } } });
await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
await prisma.mysteryShopperVisit.deleteMany({ where: { clientId: { in: ids } } });
await prisma.loyaltyAccount.deleteMany({ where: { clientId: { in: ids } } });
await prisma.user.deleteMany({ where: { id: { in: ids } } });
console.log(`removed ${ids.length} test clients`);
await prisma.$disconnect();
