import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

export const loyaltyRouter = router({
  getAccount: protectedProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.loyaltyAccount.findUnique({
        where: { clientId: input.clientId },
        include: {
          transactions: { orderBy: { createdAt: "desc" }, take: 50 },
        },
      });
    }),

  getConfig: protectedProcedure
    .input(z.object({ spaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.loyaltyConfig.findUnique({ where: { spaId: input.spaId } });
    }),

  updateConfig: protectedProcedure
    .input(
      z.object({
        spaId: z.string(),
        pointsPerUnit: z.number().optional(),
        currencyUnitAmount: z.number().optional(),
        rebookingBonus: z.number().optional(),
        rebookingWindowDays: z.number().optional(),
        birthdayBonus: z.number().optional(),
        redemptionRate: z.number().optional(),
        minRedeem: z.number().optional(),
        expiryDays: z.number().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { spaId, ...data } = input;
      return ctx.prisma.loyaltyConfig.upsert({
        where: { spaId },
        update: data,
        create: { spaId, ...data },
      });
    }),

  redeemPoints: protectedProcedure
    .input(z.object({ clientId: z.string(), amount: z.number(), appointmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.loyaltyAccount.findUnique({
        where: { clientId: input.clientId },
      });
      if (!account) throw new Error("No loyalty account found");
      if (account.balance < input.amount) throw new Error("Insufficient points");

      const updated = await ctx.prisma.loyaltyAccount.update({
        where: { clientId: input.clientId },
        data: { balance: { decrement: input.amount } },
      });

      await ctx.prisma.pointsTransaction.create({
        data: {
          accountId: account.id,
          appointmentId: input.appointmentId,
          type: "redeemed",
          amount: -input.amount,
          description: "Points redeemed at checkout",
        },
      });

      return updated;
    }),

  adjustPoints: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        amount: z.number().int(), // positive to add, negative to remove
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.loyaltyAccount.findUnique({
        where: { clientId: input.clientId },
      });
      if (!account) throw new Error("No loyalty account found for this client.");
      if (account.balance + input.amount < 0) throw new Error("Cannot reduce balance below zero.");

      const updated = await ctx.prisma.loyaltyAccount.update({
        where: { clientId: input.clientId },
        data: {
          balance: { increment: input.amount },
          ...(input.amount > 0 ? { lifetimeEarned: { increment: input.amount } } : {}),
          lastActivityAt: new Date(),
        },
      });

      await ctx.prisma.pointsTransaction.create({
        data: {
          accountId: account.id,
          type: input.amount > 0 ? "milestone" : "expired",
          amount: input.amount,
          description: `Admin adjustment: ${input.reason}`,
        },
      });

      return updated;
    }),

  creditBirthdayPoints: protectedProcedure
    .input(z.object({ spaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.prisma.loyaltyConfig.findUnique({
        where: { spaId: input.spaId },
      });
      if (!config) throw new Error("No loyalty config found");

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Find clients with birthday this month who haven't received birthday points this year
      const clients = await ctx.prisma.user.findMany({
        where: {
          spaId: input.spaId,
          role: "client",
          dob: { not: null },
          loyaltyAccount: { isNot: null },
        },
        include: {
          loyaltyAccount: {
            include: {
              transactions: {
                where: {
                  type: "birthday",
                  createdAt: { gte: new Date(`${currentYear}-01-01`) },
                },
              },
            },
          },
        },
      });

      const eligible = clients.filter((c) => {
        const dob = c.dob;
        if (!dob) return false;
        const birthMonth = new Date(dob).getMonth() + 1;
        return birthMonth === currentMonth && c.loyaltyAccount?.transactions.length === 0;
      });

      for (const client of eligible) {
        if (!client.loyaltyAccount) continue;
        await ctx.prisma.loyaltyAccount.update({
          where: { id: client.loyaltyAccount.id },
          data: {
            balance: { increment: config.birthdayBonus },
            lifetimeEarned: { increment: config.birthdayBonus },
          },
        });
        await ctx.prisma.pointsTransaction.create({
          data: {
            accountId: client.loyaltyAccount.id,
            type: "birthday",
            amount: config.birthdayBonus,
            description: `Happy Birthday! ${config.birthdayBonus} bonus points`,
          },
        });
      }

      return { credited: eligible.length };
    }),

  adminRedeem: protectedProcedure
    .input(z.object({
      clientId: z.string(),
      points: z.number().int().positive(),
      reason: z.string().default("Redeemed in salon by admin"),
    }))
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.loyaltyAccount.findUnique({
        where: { clientId: input.clientId },
      });
      if (!account) throw new Error("No loyalty account found");
      if (account.balance < input.points) throw new Error("Insufficient points balance");

      const updated = await ctx.prisma.loyaltyAccount.update({
        where: { clientId: input.clientId },
        data: { balance: { decrement: input.points }, lastActivityAt: new Date() },
      });

      await ctx.prisma.pointsTransaction.create({
        data: {
          accountId: account.id,
          type: "redeemed",
          amount: -input.points,
          description: input.reason,
        },
      });

      return updated;
    }),
});
