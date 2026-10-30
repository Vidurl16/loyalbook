import { z } from "zod";
import { router, adminProcedure, publicProcedure } from "@/server/trpc";

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

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        bio: z.string().optional(),
        color: z.string().optional(),
        workingHours: z.record(z.string(), z.object({ open: z.string(), close: z.string() }).nullable()).optional(),
        imageUrl: z.string().url().nullable().optional(),
        serviceIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, imageUrl, serviceIds, workingHours, ...data } = input;
      const hours = workingHours
        ? Object.fromEntries(Object.entries(workingHours).filter(([, v]) => v !== null))
        : undefined;
      const staff = await ctx.prisma.staff.update({
        where: { id },
        data: { ...data, ...(hours ? { workingHours: hours } : {}) },
      });
      if (imageUrl !== undefined) {
        await ctx.prisma.user.update({ where: { id: staff.userId }, data: { image: imageUrl } });
      }
      if (serviceIds) {
        await ctx.prisma.staffService.deleteMany({ where: { staffId: id } });
        if (serviceIds.length) {
          await ctx.prisma.staffService.createMany({ data: serviceIds.map((serviceId) => ({ staffId: id, serviceId })), skipDuplicates: true });
        }
      }
      return staff;
    }),

  remove: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const staff = await ctx.prisma.staff.findUniqueOrThrow({ where: { id: input.id } });
      await ctx.prisma.staffService.deleteMany({ where: { staffId: input.id } });
      await ctx.prisma.appointment.updateMany({ where: { staffId: input.id }, data: { staffId: null } });
      await ctx.prisma.staff.delete({ where: { id: input.id } });
      await ctx.prisma.user.delete({ where: { id: staff.userId } });
      return { removed: true };
    }),

  create: adminProcedure
    .input(
      z.object({
        spaId: z.string(),
        name: z.string().min(1),
        email: z.string().email(),
        bio: z.string().optional(),
        color: z.string().optional(),
        imageUrl: z.string().url().optional(),
        serviceIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { spaId, name, email, bio, color, imageUrl, serviceIds } = input;

      const user = await ctx.prisma.user.create({
        data: { spaId, name, email, role: "staff", image: imageUrl },
      });

      const staff = await ctx.prisma.staff.create({
        data: {
          userId: user.id,
          spaId,
          bio: bio ?? "",
          color: color ?? "#c4a882",
          workingHours: {
            mon: { open: "09:00", close: "17:00" },
            tue: { open: "09:00", close: "17:00" },
            wed: { open: "09:00", close: "17:00" },
            thu: { open: "09:00", close: "17:00" },
            fri: { open: "09:00", close: "17:00" },
            sat: { open: "09:00", close: "14:00" },
          },
        },
      });

      if (serviceIds?.length) {
        await ctx.prisma.staffService.createMany({
          data: serviceIds.map((serviceId) => ({ staffId: staff.id, serviceId })),
          skipDuplicates: true,
        });
      }

      return staff;
    }),
});
