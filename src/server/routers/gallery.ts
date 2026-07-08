import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "@/server/trpc";

export const galleryRouter = router({
  list: publicProcedure
    .input(
      z.object({
        locationId: z.string(),
        category: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.galleryItem.findMany({
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

  // Admin: all items (including unpublished) for management.
  adminList: adminProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.galleryItem.findMany({
        where: { locationId: input.locationId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    }),

  create: adminProcedure
    .input(
      z.object({
        locationId: z.string(),
        category: z.string(),
        title: z.string().min(1),
        therapist: z.string().default(""),
        price: z.number().default(0),
        durationMins: z.number().int().default(0),
        description: z.string().optional(),
        imageUrl: z.string().url().optional(),
        isTall: z.boolean().default(false),
        isPublished: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.galleryItem.create({ data: input });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        category: z.string().optional(),
        title: z.string().optional(),
        therapist: z.string().optional(),
        price: z.number().optional(),
        durationMins: z.number().int().optional(),
        description: z.string().optional(),
        imageUrl: z.string().url().nullable().optional(),
        isTall: z.boolean().optional(),
        isPublished: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.galleryItem.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.galleryItem.delete({ where: { id: input.id } });
    }),

  reorder: adminProcedure
    .input(z.object({ ids: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.$transaction(
        input.ids.map((id, index) =>
          ctx.prisma.galleryItem.update({ where: { id }, data: { sortOrder: index } })
        )
      );
      return { ok: true };
    }),
});
