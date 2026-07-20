import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, adminProcedure, ownerProcedure } from "@/server/trpc";
import { computeTier, generateVoucherCode } from "@/lib/loyalty";

export const loyaltyRouter = router({
  // Client self-service: always the authenticated user's own account.
  getAccount: protectedProcedure.query(async ({ ctx }) => {
    const clientId = ctx.session.user.id;
    const account = await ctx.prisma.loyaltyAccount.findUnique({
      where: { clientId },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 50 } },
    });
    if (!account) return null;

    const config = await ctx.prisma.loyaltyConfig.findUnique({ where: { spaId: account.spaId } });
    const tier = computeTier(account.lifetimeEarned, config?.tiers);

    return { ...account, tier };
  }),

  getConfig: protectedProcedure
    .input(z.object({ spaId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.loyaltyConfig.findUnique({ where: { spaId: input.spaId } });
    }),

  updateConfig: adminProcedure
    .input(
      z.object({
        spaId: z.string(),
        pointsPerUnit: z.number().optional(),
        currencyUnitAmount: z.number().optional(),
        rebookingBonus: z.number().optional(),
        rebookingWindowDays: z.number().optional(),
        birthdayBonus: z.number().optional(),
        redemptionRate: z.number().optional(),
        minRedeem: z.number().optional(),
        expiryDays: z.number().nullable().optional(),
        voucherExpiryDays: z.number().optional(),
        tiers: z
          .array(z.object({ name: z.string(), minLifetimeEarned: z.number(), perks: z.array(z.string()).optional() }))
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { spaId, tiers, ...rest } = input;
      const data = { ...rest, ...(tiers ? { tiers } : {}) };
      return ctx.prisma.loyaltyConfig.upsert({
        where: { spaId },
        update: data,
        create: { spaId, ...data },
      });
    }),

  // Client: list their own vouchers
  listMyVouchers: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.voucher.findMany({
      where: { clientId: ctx.session.user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  /**
   * Client self-service: spend points to mint a discount voucher.
   * There is no online payment — the voucher is a discount authorisation that
   * salon staff apply at the till (see validateVoucherCode / applyVoucherCode).
   */
  redeemVoucher: protectedProcedure
    .input(z.object({ points: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const clientId = ctx.session.user.id;
      const account = await ctx.prisma.loyaltyAccount.findUnique({ where: { clientId } });
      if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "No loyalty account found." });

      const config = await ctx.prisma.loyaltyConfig.findUnique({ where: { spaId: account.spaId } });
      const minRedeem = config?.minRedeem ?? 500;
      const redemptionRate = config?.redemptionRate ?? 100; // points per currency unit
      const currencyUnit = config?.currencyUnitAmount ?? 10; // rand per unit
      const voucherExpiryDays = config?.voucherExpiryDays ?? 90;

      if (input.points < minRedeem) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Minimum redemption is ${minRedeem} points.` });
      }
      if (account.balance < input.points) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient points balance." });
      }

      // Rand value of the redeemed points, rounded to the nearest rand.
      const discountValue = Math.round((input.points / redemptionRate) * currencyUnit);
      if (discountValue <= 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "That many points is worth less than R1." });
      }

      // Generate a unique code (retry on the rare collision).
      let code = generateVoucherCode();
      for (let i = 0; i < 5; i++) {
        const clash = await ctx.prisma.voucher.findUnique({ where: { code } });
        if (!clash) break;
        code = generateVoucherCode();
      }

      const expiresAt = new Date(Date.now() + voucherExpiryDays * 86400000);

      return ctx.prisma.$transaction(async (tx) => {
        // Atomic conditional decrement — guards against a race that could
        // over-redeem or drive the balance negative under concurrent requests.
        const dec = await tx.loyaltyAccount.updateMany({
          where: { clientId, balance: { gte: input.points } },
          data: { balance: { decrement: input.points }, lastActivityAt: new Date() },
        });
        if (dec.count !== 1) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Insufficient points balance." });
        }

        const txn = await tx.pointsTransaction.create({
          data: {
            accountId: account.id,
            type: "redeemed",
            amount: -input.points,
            description: `Redeemed for R${discountValue} voucher`,
          },
        });

        return tx.voucher.create({
          data: {
            spaId: account.spaId,
            clientId,
            code,
            pointsSpent: input.points,
            discountType: "fixed",
            discountValue,
            status: "active",
            expiresAt,
            pointsTransactionId: txn.id,
          },
        });
      });
    }),

  // Staff (admin): look up a voucher code at the till before applying it.
  validateVoucherCode: adminProcedure
    .input(z.object({ code: z.string().min(3) }))
    .query(async ({ ctx, input }) => {
      const voucher = await ctx.prisma.voucher.findUnique({
        where: { code: input.code.trim().toUpperCase() },
        include: { client: { select: { name: true, email: true } } },
      });
      if (!voucher) throw new TRPCError({ code: "NOT_FOUND", message: "Voucher code not found." });

      const expired = voucher.expiresAt ? voucher.expiresAt.getTime() < Date.now() : false;
      const usable = voucher.status === "active" && !expired;
      return {
        voucher,
        usable,
        reason:
          voucher.status !== "active"
            ? `Voucher already ${voucher.status}.`
            : expired
              ? "Voucher has expired."
              : null,
      };
    }),

  // Staff (admin): mark a voucher as redeemed once the discount is applied in-store.
  applyVoucherCode: adminProcedure
    .input(z.object({ code: z.string().min(3), appointmentId: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const code = input.code.trim().toUpperCase();
      const voucher = await ctx.prisma.voucher.findUnique({ where: { code } });
      if (!voucher) throw new TRPCError({ code: "NOT_FOUND", message: "Voucher code not found." });

      const expired = voucher.expiresAt ? voucher.expiresAt.getTime() < Date.now() : false;
      if (voucher.status !== "active" || expired) {
        // Keep expired status truthful.
        if (expired && voucher.status === "active") {
          await ctx.prisma.voucher.update({ where: { code }, data: { status: "expired" } });
        }
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: expired ? "Voucher has expired." : `Voucher already ${voucher.status}.`,
        });
      }

      return ctx.prisma.voucher.update({
        where: { code },
        data: {
          status: "redeemed",
          redeemedAt: new Date(),
          redeemedByStaffId: ctx.session.user.id,
          ...(input.appointmentId ? { appointmentId: input.appointmentId } : {}),
        },
      });
    }),

  /**
   * Client: products they could get for the rand value of their points balance.
   * Suggestions only — there is no online checkout.
   */
  suggestedProducts: protectedProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const clientId = ctx.session.user.id;
      const account = await ctx.prisma.loyaltyAccount.findUnique({ where: { clientId } });
      if (!account) return { randValue: 0, products: [] };

      const config = await ctx.prisma.loyaltyConfig.findUnique({ where: { spaId: account.spaId } });
      const redemptionRate = config?.redemptionRate ?? 100;
      const currencyUnit = config?.currencyUnitAmount ?? 10;
      const randValue = Math.floor((account.balance / redemptionRate) * currencyUnit);

      const products = await ctx.prisma.product.findMany({
        where: { locationId: input.locationId, isPublished: true, inStock: true },
        orderBy: { price: "desc" },
        take: 24,
      });

      // Split into "fully covered" and "discountable" for the UI to frame.
      return {
        randValue,
        products: products.map((p) => ({
          ...p,
          covered: randValue >= p.price,
          discountedPrice: Math.max(0, Math.round(p.price - randValue)),
        })),
      };
    }),

  adjustPoints: ownerProcedure
    .input(
      z.object({
        clientId: z.string(),
        amount: z.number().int(), // positive to add, negative to remove
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.loyaltyAccount.findUnique({
        where: { clientId: input.clientId },
      });
      if (!account) throw new Error("No loyalty account found for this client.");
      if (account.balance + input.amount < 0) throw new Error("Cannot reduce balance below zero.");

      const updated = await ctx.prisma.loyaltyAccount.update({
        where: { clientId: input.clientId },
        data: {
          balance: { increment: input.amount },
          ...(input.amount > 0 ? { lifetimeEarned: { increment: input.amount } } : {}),
          lastActivityAt: new Date(),
        },
      });

      await ctx.prisma.pointsTransaction.create({
        data: {
          accountId: account.id,
          type: input.amount > 0 ? "milestone" : "expired",
          amount: input.amount,
          description: `Admin adjustment: ${input.reason}`,
        },
      });

      return updated;
    }),

  creditBirthdayPoints: adminProcedure
    .input(z.object({ spaId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const config = await ctx.prisma.loyaltyConfig.findUnique({
        where: { spaId: input.spaId },
      });
      if (!config) throw new Error("No loyalty config found");

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      const clients = await ctx.prisma.user.findMany({
        where: {
          spaId: input.spaId,
          role: "client",
          dob: { not: null },
          loyaltyAccount: { isNot: null },
        },
        include: {
          loyaltyAccount: {
            include: {
              transactions: {
                where: {
                  type: "birthday",
                  createdAt: { gte: new Date(`${currentYear}-01-01`) },
                },
              },
            },
          },
        },
      });

      const eligible = clients.filter((c) => {
        const dob = c.dob;
        if (!dob) return false;
        const birthMonth = new Date(dob).getMonth() + 1;
        return birthMonth === currentMonth && c.loyaltyAccount?.transactions.length === 0;
      });

      for (const client of eligible) {
        if (!client.loyaltyAccount) continue;
        await ctx.prisma.loyaltyAccount.update({
          where: { id: client.loyaltyAccount.id },
          data: {
            balance: { increment: config.birthdayBonus },
            lifetimeEarned: { increment: config.birthdayBonus },
          },
        });
        await ctx.prisma.pointsTransaction.create({
          data: {
            accountId: client.loyaltyAccount.id,
            type: "birthday",
            amount: config.birthdayBonus,
            description: `Happy Birthday! ${config.birthdayBonus} bonus points`,
          },
        });
      }

      return { credited: eligible.length };
    }),

  // Admin: redeem points directly in-salon (legacy manual path, kept for admin use).
  adminRedeem: ownerProcedure
    .input(z.object({
      clientId: z.string(),
      points: z.number().int().positive(),
      reason: z.string().default("Redeemed in salon by admin"),
    }))
    .mutation(async ({ ctx, input }) => {
      const account = await ctx.prisma.loyaltyAccount.findUnique({
        where: { clientId: input.clientId },
      });
      if (!account) throw new Error("No loyalty account found");
      if (account.balance < input.points) throw new Error("Insufficient points balance");

      const updated = await ctx.prisma.loyaltyAccount.update({
        where: { clientId: input.clientId },
        data: { balance: { decrement: input.points }, lastActivityAt: new Date() },
      });

      await ctx.prisma.pointsTransaction.create({
        data: {
          accountId: account.id,
          type: "redeemed",
          amount: -input.points,
          description: input.reason,
        },
      });

      return updated;
    }),
});
