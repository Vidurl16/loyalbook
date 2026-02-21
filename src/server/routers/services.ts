import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "@/server/trpc";

export const servicesRouter = router({
  list: publicProcedure
    .input(z.object({ spaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.service.findMany({
        where: { spaId: input.spaId, isActive: true },
        orderBy: { category: "asc" },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        spaId: z.string(),
        name: z.string(),
        category: z.string(),
        durationMins: z.number(),
        price: z.number(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.service.create({ data: input });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        category: z.string().optional(),
        durationMins: z.number().optional(),
        price: z.number().optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.service.update({ where: { id }, data });
    }),
});
