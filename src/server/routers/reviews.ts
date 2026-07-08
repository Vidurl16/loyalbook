import { z } from "zod";
import { router, publicProcedure, adminProcedure } from "@/server/trpc";

export const reviewsRouter = router({
  // Public: published reviews for a location.
  list: publicProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.review.findMany({
        where: { locationId: input.locationId, isPublished: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    }),

  adminList: adminProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.review.findMany({
        where: { locationId: input.locationId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    }),

  // Admin enters reviews on behalf of clients, attesting they have consent.
  create: adminProcedure
    .input(
      z.object({
        locationId: z.string(),
        authorName: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        body: z.string().min(1),
        serviceName: z.string().optional(),
        therapist: z.string().optional(),
        imageUrl: z.string().url().optional(),
        consentToPublish: z.boolean().default(true),
        isPublished: z.boolean().default(true),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.review.create({ data: input });
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        authorName: z.string().optional(),
        rating: z.number().int().min(1).max(5).optional(),
        body: z.string().optional(),
        serviceName: z.string().optional(),
        therapist: z.string().optional(),
        imageUrl: z.string().url().nullable().optional(),
        consentToPublish: z.boolean().optional(),
        isPublished: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.review.update({ where: { id }, data });
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.review.delete({ where: { id: input.id } });
    }),
});
