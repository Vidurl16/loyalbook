import { z } from "zod";
import { router, protectedProcedure } from "@/server/trpc";

export const spaRouter = router({
  get: protectedProcedure
    .input(z.object({ spaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.spa.findUnique({ where: { id: input.spaId } });
    }),

  update: protectedProcedure
    .input(
      z.object({
        spaId: z.string(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        timezone: z.string().optional(),
        currency: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { spaId, ...data } = input;
      return ctx.prisma.spa.update({ where: { id: spaId }, data });
    }),
});
