import { z } from "zod";
import { router, publicProcedure } from "@/server/trpc";

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
});
