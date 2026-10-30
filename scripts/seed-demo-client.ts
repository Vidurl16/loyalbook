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

  const previous = await prisma.user.findUnique({ where: { email }, include: { loyaltyAccount: true } });
  if (previous) {
    await prisma.appointment.deleteMany({ where: { clientId: previous.id } });
    if (previous.loyaltyAccount) {
      await prisma.pointsTransaction.deleteMany({ where: { accountId: previous.loyaltyAccount.id } });
      await prisma.loyaltyAccount.delete({ where: { id: previous.loyaltyAccount.id } });
    }
    await prisma.user.delete({ where: { id: previous.id } });
  }
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

  await seedGalleryAndReviews(spa.id);

  console.log(`Demo client ready: ${email} / ClientPass123!`);
}

/** Demo gallery and reviews so the home page and gallery have real content locally. */
async function seedGalleryAndReviews(spaId: string) {
  const location = await prisma.location.findFirstOrThrow({ where: { spaId } });
  const therapists = await prisma.staff.findMany({ where: { spaId }, include: { user: { select: { name: true } } }, take: 3 });
  const by = (i: number) => therapists[i % Math.max(therapists.length, 1)]?.user.name ?? "The team";

  await prisma.galleryItem.deleteMany({ where: { locationId: location.id } });
  await prisma.galleryItem.createMany({
    data: [
      { locationId: location.id, category: "Nails", title: "Coral French with gold line", therapist: by(0), price: 420, durationMins: 75, isTall: true, sortOrder: 0, imageUrl: "/brand/treatments.jpg", description: "Sheer nude base, coral tips and a hand-painted gold hairline. Gel overlay for three weeks of shine." },
      { locationId: location.id, category: "Skin", title: "Glow facial, fresh out", therapist: by(1), price: 580, durationMins: 60, isTall: false, sortOrder: 1, imageUrl: "/brand/about-us.jpg", description: "Deep cleanse, gentle exfoliation and a hydrating mask. Skin photographed straight after the treatment." },
      { locationId: location.id, category: "Hair", title: "Defined curls, natural finish", therapist: by(2), price: 650, durationMins: 90, isTall: true, sortOrder: 2, imageUrl: "/brand/hero.jpg", description: "Wash, curl-defining treatment and diffuse dry. Volume without frizz." },
      { locationId: location.id, category: "Nails", title: "Classic red gel", therapist: by(0), price: 380, durationMins: 60, isTall: false, sortOrder: 3, imageUrl: "/brand/treatments.jpg", description: "A timeless red in high-shine gel." },
    ],
  });

  await prisma.review.deleteMany({ where: { locationId: location.id } });
  await prisma.review.createMany({
    data: [
      { locationId: location.id, authorName: "Thandi M.", rating: 5, body: "I walked out feeling like myself again. The team remembered how I like my nails shaped from last time.", serviceName: "Gel manicure", sortOrder: 0 },
      { locationId: location.id, authorName: "Nadia P.", rating: 5, body: "Calm, spotless and never rushed. My skin has not looked this good in years.", serviceName: "Therapeutic facial", sortOrder: 1 },
      { locationId: location.id, authorName: "Lerato K.", rating: 4, body: "Booked online in a minute, picked my therapist, and the points voucher paid for my next brow tint.", serviceName: "Brow lamination", sortOrder: 2 },
    ],
  });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
