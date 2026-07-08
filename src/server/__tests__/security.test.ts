/**
 * Money & authorization path tests — the surface where a regression costs real money.
 * Exercises the real routers against the dev database. Requires the seeded DB
 * (spa, loyalty config, services) to be present.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "@/server/root";
import { prisma } from "@/lib/prisma";

type Ctx = Parameters<typeof appRouter.createCaller>[0];

let spaId: string;
let serviceId: string;
let seq = 0;
const uid = (p: string) => `sec-test-${p}-${Date.now()}-${seq++}`;

function ctxFor(session: unknown): Ctx {
  return { prisma, session, spaId, locationId: null } as unknown as Ctx;
}
const anonCaller = () => appRouter.createCaller(ctxFor(null));
const clientCaller = (id: string) =>
  appRouter.createCaller(ctxFor({ user: { id, role: "client" } }));
const staffCaller = (id: string) =>
  appRouter.createCaller(ctxFor({ user: { id, role: "staff" } }));
const ownerCaller = (id: string) =>
  appRouter.createCaller(ctxFor({ user: { id, role: "owner" } }));

async function makeClient() {
  const email = `${uid("c")}@test.local`;
  const user = await prisma.user.create({
    data: { email, name: "Test Client", role: "client", spaId },
  });
  const account = await prisma.loyaltyAccount.create({
    data: { clientId: user.id, spaId, balance: 0, lifetimeEarned: 0 },
  });
  return { user, account };
}

beforeAll(async () => {
  const spa = await prisma.spa.findFirst();
  if (!spa) throw new Error("No spa — run the seed first.");
  spaId = spa.id;
  const service = await prisma.service.findFirst({ where: { spaId } });
  if (!service) throw new Error("No service — run the seed first.");
  serviceId = service.id;
});

describe("authorization guards", () => {
  it("blocks unauthenticated + client from admin-only reads", async () => {
    const { user } = await makeClient();
    for (const caller of [anonCaller(), clientCaller(user.id)]) {
      await expect(caller.clients.list({ spaId })).rejects.toThrow();
      await expect(caller.clients.get({ id: user.id })).rejects.toThrow();
      await expect(
        caller.analytics.revenue({ spaId, period: "month" })
      ).rejects.toThrow();
      await expect(caller.appointments.listAll({ spaId })).rejects.toThrow();
    }
  });

  it("lets a client read only their OWN data via clients.me", async () => {
    const { user } = await makeClient();
    const me = await clientCaller(user.id).clients.me();
    expect(me?.id).toBe(user.id);
  });

  it("restricts point adjustments to owner (not staff)", async () => {
    const { user } = await makeClient();
    const input = { clientId: user.id, amount: 1000, reason: "x" };
    await expect(clientCaller(user.id).loyalty.adjustPoints(input)).rejects.toThrow();
    await expect(staffCaller(user.id).loyalty.adjustPoints(input)).rejects.toThrow();
    // owner succeeds
    const ownerId = (await prisma.user.findFirst({ where: { role: "owner" } }))?.id;
    if (ownerId) {
      const res = await ownerCaller(ownerId).loyalty.adjustPoints(input);
      expect(res.balance).toBe(1000);
    }
  });
});

describe("C1 — appointment completion cannot mint points", () => {
  it("a client cannot mark any appointment completed", async () => {
    const { user } = await makeClient();
    const appt = await prisma.appointment.create({
      data: {
        spaId, clientId: user.id, serviceId,
        startAt: new Date(), endAt: new Date(Date.now() + 3.6e6),
      },
    });
    await expect(
      clientCaller(user.id).appointments.updateStatus({ id: appt.id, status: "completed" })
    ).rejects.toThrow();
  });

  it("completing twice credits points only once (idempotent)", async () => {
    const ownerId = (await prisma.user.findFirst({ where: { role: "owner" } }))!.id;
    const { user, account } = await makeClient();
    const appt = await prisma.appointment.create({
      data: {
        spaId, clientId: user.id, serviceId,
        startAt: new Date(), endAt: new Date(Date.now() + 3.6e6),
      },
    });
    const owner = ownerCaller(ownerId);
    await owner.appointments.updateStatus({ id: appt.id, status: "completed" });
    const after1 = await prisma.loyaltyAccount.findUniqueOrThrow({ where: { id: account.id } });
    await owner.appointments.updateStatus({ id: appt.id, status: "completed" });
    const after2 = await prisma.loyaltyAccount.findUniqueOrThrow({ where: { id: account.id } });
    expect(after2.balance).toBe(after1.balance);
    const earned = await prisma.pointsTransaction.count({
      where: { appointmentId: appt.id, type: "earned" },
    });
    expect(earned).toBe(1);
  });
});

describe("C2 — booking cannot smuggle a points refund", () => {
  it("create ignores pointsRedeemed and cancel refunds nothing", async () => {
    const { user, account } = await makeClient();
    const caller = clientCaller(user.id);
    const appt = await caller.appointments.create({
      spaId, serviceId,
      startAt: new Date(Date.now() + 8.64e7).toISOString(),
      endAt: new Date(Date.now() + 8.64e7 + 3.6e6).toISOString(),
      // @ts-expect-error — field removed from the input schema; must be ignored if sent
      pointsRedeemed: 999999,
    });
    expect(appt.pointsRedeemed).toBe(0);
    await caller.appointments.cancelMine({ id: appt.id });
    const acct = await prisma.loyaltyAccount.findUniqueOrThrow({ where: { id: account.id } });
    expect(acct.balance).toBe(0);
  });

  it("cancelMine cannot cancel someone else's appointment", async () => {
    const a = await makeClient();
    const b = await makeClient();
    const appt = await prisma.appointment.create({
      data: {
        spaId, clientId: a.user.id, serviceId, status: "confirmed",
        startAt: new Date(Date.now() + 8.64e7), endAt: new Date(Date.now() + 8.64e7 + 3.6e6),
      },
    });
    await expect(clientCaller(b.user.id).appointments.cancelMine({ id: appt.id })).rejects.toThrow();
  });
});

describe("M1 — voucher redemption is atomic", () => {
  it("concurrent redeems never drive the balance negative", async () => {
    const { user, account } = await makeClient();
    await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: { balance: 600, lifetimeEarned: 600 },
    });
    const caller = clientCaller(user.id);
    // Two concurrent redemptions of 500 against a 600 balance: only one may win.
    const results = await Promise.allSettled([
      caller.loyalty.redeemVoucher({ points: 500 }),
      caller.loyalty.redeemVoucher({ points: 500 }),
    ]);
    const ok = results.filter((r) => r.status === "fulfilled").length;
    expect(ok).toBe(1);
    const acct = await prisma.loyaltyAccount.findUniqueOrThrow({ where: { id: account.id } });
    expect(acct.balance).toBeGreaterThanOrEqual(0);
    expect(acct.balance).toBe(100);
  });
});
