import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "@/server/trpc";

export const appointmentsRouter = router({
  list: protectedProcedure
    .input(z.object({ spaId: z.string(), date: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.appointment.findMany({
        where: {
          spaId: input.spaId,
          ...(input.date && {
            startAt: {
              gte: new Date(input.date),
              lt: new Date(new Date(input.date).getTime() + 86400000),
            },
          }),
        },
        include: { client: true, staff: { include: { user: true } }, service: true },
        orderBy: { startAt: "asc" },
      });
    }),

  listAll: protectedProcedure
    .input(z.object({
      spaId: z.string(),
      from: z.string().optional(),
      to: z.string().optional(),
      status: z.string().optional(),
      staffId: z.string().optional(),
      clientId: z.string().optional(),
      take: z.number().default(100),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.appointment.findMany({
        where: {
          spaId: input.spaId,
          ...(input.from && { startAt: { gte: new Date(input.from) } }),
          ...(input.to && { startAt: { lte: new Date(input.to) } }),
          ...(input.status && { status: input.status as never }),
          ...(input.staffId && { staffId: input.staffId }),
          ...(input.clientId && { clientId: input.clientId }),
        },
        include: {
          client: { select: { id: true, name: true, email: true } },
          staff: { include: { user: { select: { name: true } } } },
          service: { select: { id: true, name: true, category: true, price: true, durationMins: true } },
        },
        orderBy: { startAt: "desc" },
        take: input.take,
      });
    }),

  create: publicProcedure
    .input(
      z.object({
        spaId: z.string(),
        clientId: z.string(),
        staffId: z.string().optional(),
        serviceId: z.string(),
        startAt: z.string(),
        endAt: z.string(),
        notes: z.string().optional(),
        pointsRedeemed: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Duplicate booking detection (same client, same time)
      const duplicate = await ctx.prisma.appointment.findFirst({
        where: {
          clientId: input.clientId,
          startAt: new Date(input.startAt),
          status: { in: ["pending", "confirmed"] },
        },
      });
      if (duplicate) {
        throw new Error("You already have a booking at this time.");
      }

      // Therapist double-booking prevention (overlapping time slots)
      if (input.staffId) {
        const conflict = await ctx.prisma.appointment.findFirst({
          where: {
            staffId: input.staffId,
            status: { in: ["pending", "confirmed"] },
            AND: [
              { startAt: { lt: new Date(input.endAt) } },
              { endAt: { gt: new Date(input.startAt) } },
            ],
          },
        });
        if (conflict) {
          throw new Error("This therapist is already booked during that time. Please choose a different time or therapist.");
        }
      }

      const appointment = await ctx.prisma.appointment.create({
        data: {
          spaId: input.spaId,
          clientId: input.clientId,
          ...(input.staffId ? { staffId: input.staffId } : {}),
          serviceId: input.serviceId,
          startAt: new Date(input.startAt),
          endAt: new Date(input.endAt),
          notes: input.notes,
          pointsRedeemed: input.pointsRedeemed,
        },
        include: { service: true, staff: { include: { user: true } } },
      });

      return appointment;
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["confirmed", "completed", "no_show", "cancelled_by_client", "cancelled_by_spa"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const appointment = await ctx.prisma.appointment.update({
        where: { id: input.id },
        data: { status: input.status },
        include: { client: { include: { loyaltyAccount: true } }, service: true },
      });

      // Credit points when appointment is completed
      if (input.status === "completed") {
        const config = await ctx.prisma.loyaltyConfig.findUnique({
          where: { spaId: appointment.spaId },
        });

        if (config && appointment.client.loyaltyAccount) {
          const pointsEarned = Math.floor(
            (appointment.service.price / config.currencyUnitAmount) * config.pointsPerUnit
          );

          // Check rebooking bonus eligibility
          const recentCompleted = await ctx.prisma.appointment.findFirst({
            where: {
              clientId: appointment.clientId,
              spaId: appointment.spaId,
              status: "completed",
              id: { not: appointment.id },
              startAt: {
                gte: new Date(Date.now() - config.rebookingWindowDays * 86400000),
              },
            },
          });

          const bonusPoints = recentCompleted ? config.rebookingBonus : 0;
          const totalPoints = pointsEarned + bonusPoints;

          await ctx.prisma.loyaltyAccount.update({
            where: { id: appointment.client.loyaltyAccount.id },
            data: {
              balance: { increment: totalPoints },
              lifetimeEarned: { increment: totalPoints },
              lastActivityAt: new Date(),
            },
          });

          await ctx.prisma.pointsTransaction.create({
            data: {
              accountId: appointment.client.loyaltyAccount.id,
              appointmentId: appointment.id,
              type: "earned",
              amount: pointsEarned,
              description: `Earned from ${appointment.service.name}`,
            },
          });

          if (bonusPoints > 0) {
            await ctx.prisma.pointsTransaction.create({
              data: {
                accountId: appointment.client.loyaltyAccount.id,
                appointmentId: appointment.id,
                type: "rebooking_bonus",
                amount: bonusPoints,
                description: "Rebooking bonus reward",
              },
            });
          }
        }
      }

      // Refund redeemed points if cancelled by client
      if (input.status === "cancelled_by_client" && appointment.pointsRedeemed > 0) {
        const loyaltyAccount = appointment.client.loyaltyAccount;
        if (loyaltyAccount) {
          await ctx.prisma.loyaltyAccount.update({
            where: { id: loyaltyAccount.id },
            data: { balance: { increment: appointment.pointsRedeemed } },
          });
          await ctx.prisma.pointsTransaction.create({
            data: {
              accountId: loyaltyAccount.id,
              appointmentId: appointment.id,
              type: "refunded",
              amount: appointment.pointsRedeemed,
              description: "Points refunded due to cancellation",
            },
          });
        }
      }

      return appointment;
    }),
});
