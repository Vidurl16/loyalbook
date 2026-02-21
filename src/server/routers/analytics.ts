import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

export const analyticsRouter = router({
  revenue: protectedProcedure
    .input(z.object({ spaId: z.string(), period: z.enum(["day", "week", "month", "year"]) }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const periodMap = { day: 1, week: 7, month: 30, year: 365 };
      const since = new Date(now.getTime() - periodMap[input.period] * 86400000);

      const appointments = await ctx.prisma.appointment.findMany({
        where: {
          spaId: input.spaId,
          status: "completed",
          startAt: { gte: since },
        },
        include: { service: { select: { price: true } } },
      });

      const total = appointments.reduce((sum, a) => sum + a.service.price, 0);
      return { total, count: appointments.length, since };
    }),

  topServices: protectedProcedure
    .input(z.object({ spaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.appointment.groupBy({
        by: ["serviceId"],
        where: { spaId: input.spaId, status: "completed" },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      });
    }),

  pointsEconomy: protectedProcedure
    .input(z.object({ spaId: z.string() }))
    .query(async ({ ctx, input }) => {
      const accounts = await ctx.prisma.loyaltyAccount.findMany({
        where: { spaId: input.spaId },
        select: { balance: true, lifetimeEarned: true },
      });
      const totalIssued = accounts.reduce((s, a) => s + a.lifetimeEarned, 0);
      const totalOutstanding = accounts.reduce((s, a) => s + a.balance, 0);
      const totalRedeemed = totalIssued - totalOutstanding;
      return { totalIssued, totalRedeemed, totalOutstanding };
    }),
});
