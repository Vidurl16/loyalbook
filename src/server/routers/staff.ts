import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "@/server/trpc";

export const staffRouter = router({
  list: publicProcedure
    .input(z.object({ spaId: z.string(), serviceId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.staff.findMany({
        where: {
          spaId: input.spaId,
          ...(input.serviceId && {
            services: { some: { serviceId: input.serviceId } },
          }),
        },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
          services: { include: { service: true } },
        },
      });
    }),

  getAvailability: publicProcedure
    .input(z.object({ staffId: z.string(), date: z.string(), durationMins: z.number() }))
    .query(async ({ ctx, input }) => {
      const staff = await ctx.prisma.staff.findUnique({
        where: { id: input.staffId },
        select: { workingHours: true },
      });

      const existing = await ctx.prisma.appointment.findMany({
        where: {
          staffId: input.staffId,
          startAt: {
            gte: new Date(input.date),
            lt: new Date(new Date(input.date).getTime() + 86400000),
          },
          status: { in: ["pending", "confirmed"] },
        },
        select: { startAt: true, endAt: true },
      });

      return { workingHours: staff?.workingHours, bookedSlots: existing };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        bio: z.string().optional(),
        color: z.string().optional(),
        workingHours: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.staff.update({ where: { id }, data });
    }),
});
