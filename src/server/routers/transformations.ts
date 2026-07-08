import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "@/server/trpc";

export const transformationsRouter = router({
  list: publicProcedure
    .input(
      z.object({
        locationId: z.string(),
        category: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.transformation.findMany({
        where: {
          locationId: input.locationId,
          isPublished: true,
          ...(input.category && input.category !== "All"
            ? { category: input.category }
            : {}),
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    }),

  adminList: adminProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.transformation.findMany({
        where: { locationId: input.locationId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        locationId: z.string(),
        category: z.string(),
        service: z.string(),
        therapist: z.string(),
        description: z.string().optional(),
        beforeImageUrl: z.string().url().optional(),
        afterImageUrl: z.string().url().optional(),
        rating: z.number().int().min(1).max(5).optional(),
        isPublished: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.transformation.create({ data: input });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        category: z.string().optional(),
        service: z.string().optional(),
        therapist: z.string().optional(),
        description: z.string().optional(),
        beforeImageUrl: z.string().url().nullable().optional(),
        afterImageUrl: z.string().url().nullable().optional(),
        rating: z.number().int().min(1).max(5).nullable().optional(),
        isPublished: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.transformation.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.transformation.delete({ where: { id: input.id } });
    }),
});
