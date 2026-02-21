import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

export const clientsRouter = router({
  list: protectedProcedure
    .input(z.object({ spaId: z.string(), search: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          spaId: input.spaId,
          role: "client",
          ...(input.search && {
            OR: [
              { name: { contains: input.search, mode: "insensitive" } },
              { email: { contains: input.search, mode: "insensitive" } },
            ],
          }),
        },
        include: {
          loyaltyAccount: { select: { balance: true, lifetimeEarned: true } },
          _count: { select: { appointments: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findUnique({
        where: { id: input.id },
        include: {
          loyaltyAccount: { include: { transactions: { orderBy: { createdAt: "desc" }, take: 20 } } },
          appointments: {
            include: { service: true, staff: { include: { user: true } } },
            orderBy: { startAt: "desc" },
            take: 10,
          },
        },
      });
    }),

  upcomingBirthdays: protectedProcedure
    .input(z.object({ spaId: z.string() }))
    .query(async ({ ctx, input }) => {
      const today = new Date();
      const in30Days = new Date(today.getTime() + 30 * 86400000);
      const clients = await ctx.prisma.user.findMany({
        where: { spaId: input.spaId, role: "client", dob: { not: null } },
        select: { id: true, name: true, email: true, dob: true },
      });
      return clients.filter((c) => {
        if (!c.dob) return false;
        const bday = new Date(c.dob);
        const thisYear = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
        return thisYear >= today && thisYear <= in30Days;
      });
    }),
});
