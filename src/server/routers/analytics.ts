import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

const periodSince = (period: "day" | "week" | "month" | "year") => {
  const map = { day: 1, week: 7, month: 30, year: 365 };
  return new Date(Date.now() - map[period] * 86_400_000);
};

export const analyticsRouter = router({
  revenue: protectedProcedure
    .input(z.object({ spaId: z.string(), period: z.enum(["day", "week", "month", "year"]) }))
    .query(async ({ ctx, input }) => {
      const since = periodSince(input.period);
      const appointments = await ctx.prisma.appointment.findMany({
        where: { spaId: input.spaId, status: "completed", startAt: { gte: since } },
        include: { service: { select: { price: true } } },
      });
      const total = appointments.reduce((sum, a) => sum + a.service.price, 0);
      return { total, count: appointments.length, since };
    }),

  topServices: protectedProcedure
    .input(z.object({ spaId: z.string() }))
    .query(async ({ ctx, input }) => {
      const grouped = await ctx.prisma.appointment.groupBy({
        by: ["serviceId"],
        where: { spaId: input.spaId, status: "completed" },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8,
      });
      // Fetch service names for the grouped IDs
      const serviceIds = grouped.map((g) => g.serviceId);
      const services = await ctx.prisma.service.findMany({
        where: { id: { in: serviceIds } },
        select: { id: true, name: true, category: true, price: true },
      });
      const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]));
      return grouped.map((g) => ({
        serviceId: g.serviceId,
        count: (g._count as Record<string, number>).id ?? 0,
        service: serviceMap[g.serviceId] ?? null,
      }));
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
      return { totalIssued, totalRedeemed, totalOutstanding, memberCount: accounts.length };
    }),

  bookingStatusBreakdown: protectedProcedure
    .input(z.object({ spaId: z.string(), period: z.enum(["day", "week", "month", "year"]) }))
    .query(async ({ ctx, input }) => {
      const since = periodSince(input.period);
      const grouped = await ctx.prisma.appointment.groupBy({
        by: ["status"],
        where: { spaId: input.spaId, startAt: { gte: since } },
        _count: { id: true },
      });
      return grouped.map((g) => ({ status: g.status, count: g._count.id }));
    }),

  newMembers: protectedProcedure
    .input(z.object({ spaId: z.string(), period: z.enum(["day", "week", "month", "year"]) }))
    .query(async ({ ctx, input }) => {
      const since = periodSince(input.period);
      const count = await ctx.prisma.user.count({
        where: { spaId: input.spaId, role: "client", createdAt: { gte: since } },
      });
      const total = await ctx.prisma.user.count({
        where: { spaId: input.spaId, role: "client" },
      });
      return { count, total };
    }),

  therapistPerformance: protectedProcedure
    .input(z.object({ spaId: z.string(), period: z.enum(["day", "week", "month", "year"]) }))
    .query(async ({ ctx, input }) => {
      const since = periodSince(input.period);
      const grouped = await ctx.prisma.appointment.groupBy({
        by: ["staffId"],
        where: {
          spaId: input.spaId,
          startAt: { gte: since },
          staffId: { not: null },
          status: "completed",
        },
        _count: { id: true },
      });
      // Fetch therapist names
      const staffIds = grouped.map((g) => g.staffId!).filter(Boolean);
      const staffMembers = await ctx.prisma.staff.findMany({
        where: { id: { in: staffIds } },
        include: { user: { select: { name: true } } },
      });
      const staffMap = Object.fromEntries(staffMembers.map((s) => [s.id, s]));

      // Also get revenue per therapist
      const appointments = await ctx.prisma.appointment.findMany({
        where: {
          spaId: input.spaId,
          startAt: { gte: since },
          staffId: { in: staffIds },
          status: "completed",
        },
        select: { staffId: true, service: { select: { price: true } } },
      });
      const revenueMap: Record<string, number> = {};
      for (const apt of appointments) {
        if (apt.staffId) {
          revenueMap[apt.staffId] = (revenueMap[apt.staffId] ?? 0) + apt.service.price;
        }
      }

      return grouped
        .filter((g) => g.staffId)
        .map((g) => ({
          staffId: g.staffId!,
          name: staffMap[g.staffId!]?.user?.name ?? "Unknown",
          count: g._count.id,
          revenue: revenueMap[g.staffId!] ?? 0,
        }))
        .sort((a, b) => b.count - a.count);
    }),
});
