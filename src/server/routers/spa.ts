import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { router, adminProcedure } from "@/server/trpc";

const websiteInput = z
  .object({
    headline: z.string().max(80),
    intro: z.string().max(400),
    phone: z.string().max(30),
    hours: z.string().max(400),
    heroImageUrl: z.string().max(500),
    instagram: z.string().max(60),
  })
  .partial();

const prizeInput = z.object({ label: z.string().min(1).max(80), weight: z.number().int().min(0).max(1000), win: z.boolean() });

export const spaRouter = router({
  get: adminProcedure
    .input(z.object({ spaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.spa.findUnique({ where: { id: input.spaId } });
    }),

  update: adminProcedure
    .input(
      z.object({
        spaId: z.string(),
        name: z.string().min(1).optional(),
        address: z.string().optional(),
        timezone: z.string().optional(),
        currency: z.string().optional(),
        website: websiteInput.optional(),
        mysteryPrizes: z.array(prizeInput).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { spaId: _requested, website, mysteryPrizes, ...data } = input;
      const spaId = ctx.spaId ?? _requested;
      const current = await ctx.prisma.spa.findUniqueOrThrow({ where: { id: spaId }, select: { settings: true } });
      const settings = { ...(current.settings as Record<string, unknown>) };
      if (website) settings.website = { ...((settings.website as object) ?? {}), ...website };
      if (mysteryPrizes) settings.mysteryPrizes = mysteryPrizes;
      return ctx.prisma.spa.update({ where: { id: spaId }, data: { ...data, settings: settings as Prisma.InputJsonValue } });
    }),
});
