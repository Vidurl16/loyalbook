import { z } from "zod";
import { router, protectedProcedure, ownerProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

const RatingSchema = z.number().int().min(1).max(5);

export const mysteryShoppersRouter = router({

  // Client: apply to be a mystery shopper
  register: protectedProcedure
    .input(z.object({
      locationId:       z.string(),
      serviceToEvaluate: z.string().optional(),
      plannedVisitDate:  z.string().optional(),
      preVisitNotes:    z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const clientId = ctx.session.user.id;
      return ctx.prisma.mysteryShopperVisit.create({
        data: {
          locationId:        input.locationId,
          clientId,
          serviceToEvaluate: input.serviceToEvaluate,
          plannedVisitDate:  input.plannedVisitDate ? new Date(input.plannedVisitDate) : undefined,
          preVisitNotes:     input.preVisitNotes,
          status:            "applied",
        },
      });
    }),

  // Client: get their own pending visit for a location
  myVisit: protectedProcedure
    .input(z.object({ locationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const clientId = ctx.session.user.id;
      return ctx.prisma.mysteryShopperVisit.findFirst({
        where: { clientId, locationId: input.locationId, status: { notIn: ["rejected"] } },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Client: submit receipt + review after visit
  submit: protectedProcedure
    .input(z.object({
      visitId:                 z.string(),
      receiptUrl:              z.string().url("Please provide a valid URL to your receipt"),
      receiptAmount:           z.number().positive(),
      visitedAt:               z.string(),
      overallRating:           RatingSchema,
      firstImpressionRating:   RatingSchema,
      cleanlinessRating:       RatingSchema,
      treatmentQualityRating:  RatingSchema,
      staffFriendlinessRating: RatingSchema,
      productKnowledgeRating:  RatingSchema,
      valueRating:             RatingSchema,
      highlightsFeedback:      z.string().min(20, "Please provide at least 20 characters"),
      improvementFeedback:     z.string().optional(),
      staffFeedback:           z.string().optional(),
      wouldReturn:             z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const clientId = ctx.session.user.id;
      const visit = await ctx.prisma.mysteryShopperVisit.findUnique({ where: { id: input.visitId } });
      if (!visit || visit.clientId !== clientId) throw new TRPCError({ code: "FORBIDDEN" });
      if (visit.status === "completed" || visit.status === "approved" || visit.status === "reimbursed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Visit already submitted." });
      }
      const { visitId: _visitId, visitedAt, ...rest } = input;
      return ctx.prisma.mysteryShopperVisit.update({
        where: { id: input.visitId },
        data: {
          ...rest,
          visitedAt:   new Date(visitedAt),
          submittedAt: new Date(),
          status:      "completed",
        },
      });
    }),

  // Owner only: list all visits for a location (staff must not see shopper identities)
  listForAdmin: ownerProcedure
    .input(z.object({
      locationId: z.string(),
      status:     z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.mysteryShopperVisit.findMany({
        where: {
          locationId: input.locationId,
          ...(input.status ? { status: input.status as any } : {}),
        },
        include: {
          client: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Owner only: approve + set reimbursement amount
  approve: ownerProcedure
    .input(z.object({
      visitId:             z.string(),
      reimbursementAmount: z.number().positive(),
      adminNotes:          z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.mysteryShopperVisit.update({
        where: { id: input.visitId },
        data: {
          status:              "approved",
          reimbursementAmount: input.reimbursementAmount,
          adminNotes:          input.adminNotes,
        },
      });
    }),

  // Owner only: mark as reimbursed
  markReimbursed: ownerProcedure
    .input(z.object({ visitId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.mysteryShopperVisit.update({
        where: { id: input.visitId },
        data: { status: "reimbursed", reimbursedAt: new Date() },
      });
    }),
});
