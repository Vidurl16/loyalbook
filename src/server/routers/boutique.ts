import { z } from "zod";
import { router, publicProcedure } from "@/server/trpc";

export const boutiqueRouter = router({
  listProducts: publicProcedure
    .input(z.object({
      locationId: z.string(),
      category: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.product.findMany({
        where: {
          locationId: input.locationId,
          isPublished: true,
          ...(input.category && input.category !== "All" ? { category: input.category } : {}),
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      });
    }),

  listRoutine: publicProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.product.findMany({
        where: { locationId: input.locationId, isPublished: true, isRoutine: true },
        orderBy: { sortOrder: "asc" },
      });
    }),

  createEnquiry: publicProcedure
    .input(z.object({
      locationId: z.string(),
      items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive(), unitPrice: z.number() })),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const total = input.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
      return ctx.prisma.order.create({
        data: {
          locationId: input.locationId,
          status: "enquiry",
          total,
          notes: input.notes,
          items: { create: input.items },
        },
        include: { items: true },
      });
    }),
});
