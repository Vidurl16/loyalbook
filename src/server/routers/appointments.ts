import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "@/server/trpc";

export const appointmentsRouter = router({
  list: adminProcedure
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

  listAll: adminProcedure
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

  // Customer self-service: only ever the authenticated user's own appointments.
  myAppointments: protectedProcedure
    .input(z.object({ status: z.string().optional(), take: z.number().default(50) }).optional())
    .query(async ({ ctx, input }) => {
      return ctx.prisma.appointment.findMany({
        where: {
          clientId: ctx.session.user.id,
          ...(input?.status && { status: input.status as never }),
        },
        include: {
          staff: { include: { user: { select: { name: true } } } },
          service: { select: { id: true, name: true, category: true, price: true, durationMins: true } },
          pointsTransactions: { select: { type: true, amount: true } },
        },
        orderBy: { startAt: "desc" },
        take: input?.take ?? 50,
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        spaId: z.string(),
        staffId: z.string().optional(),
        serviceId: z.string(),
        startAt: z.string(),
        endAt: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Client is always the authenticated user — never trust a client-supplied id.
      const clientId = ctx.session.user.id;

      // Duplicate booking detection (same client, same time)
      const duplicate = await ctx.prisma.appointment.findFirst({
        where: {
          clientId,
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
          clientId,
          ...(input.staffId ? { staffId: input.staffId } : {}),
          serviceId: input.serviceId,
          startAt: new Date(input.startAt),
          endAt: new Date(input.endAt),
          notes: input.notes,
        },
        include: { service: true, staff: { include: { user: true } } },
      });

      return appointment;
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["confirmed", "completed", "no_show", "cancelled_by_client", "cancelled_by_spa"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Read the current state first so we can tell a *real* transition into
      // "completed" from a no-op re-completion (which must not re-credit points).
      const existing = await ctx.prisma.appointment.findUnique({
        where: { id: input.id },
        select: { status: true },
      });
      if (!existing) throw new Error("Appointment not found.");
      const wasCompleted = existing.status === "completed";

      const appointment = await ctx.prisma.appointment.update({
        where: { id: input.id },
        data: { status: input.status },
        include: { client: { include: { loyaltyAccount: true } }, service: true },
      });

      // Credit points only on the first transition into "completed".
      if (input.status === "completed" && !wasCompleted) {
        // Idempotency backstop: never credit twice for the same appointment.
        const alreadyEarned = await ctx.prisma.pointsTransaction.findFirst({
          where: { appointmentId: appointment.id, type: "earned" },
          select: { id: true },
        });

        const config = await ctx.prisma.loyaltyConfig.findUnique({
          where: { spaId: appointment.spaId },
        });

        if (!alreadyEarned && config && appointment.client.loyaltyAccount) {
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

      // Note: points are only ever spent by minting a voucher (loyalty.redeemVoucher),
      // never at booking time, so cancellation has no points to refund here.

      return appointment;
    }),

  // Customer self-service cancel: can only cancel one's OWN upcoming appointment.
  cancelMine: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const appointment = await ctx.prisma.appointment.findUnique({
        where: { id: input.id },
        select: { id: true, clientId: true, status: true },
      });
      if (!appointment || appointment.clientId !== ctx.session.user.id) {
        throw new Error("Appointment not found.");
      }
      if (!["pending", "confirmed"].includes(appointment.status)) {
        throw new Error("This booking can no longer be cancelled.");
      }
      return ctx.prisma.appointment.update({
        where: { id: input.id },
        data: { status: "cancelled_by_client" },
      });
    }),
});
