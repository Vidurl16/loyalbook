import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import superjson from "superjson";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const createTRPCContext = async () => {
  const session = await getServerSession(authOptions);
  return {
    prisma,
    session,
    // Server-derived tenant — routers should prefer these over client-supplied ids.
    spaId: process.env.DEFAULT_SPA_ID ?? process.env.NEXT_PUBLIC_SPA_ID ?? null,
    locationId: process.env.DEFAULT_LOCATION_ID ?? process.env.NEXT_PUBLIC_LOCATION_ID ?? null,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

/**
 * Admin-only: any staff member or owner. Use for salon-management endpoints
 * (services, staff, bookings, loyalty config, gallery/product content, campaigns).
 */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const role = ctx.session.user.role;
  if (role !== "owner" && role !== "staff") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});

/**
 * Owner-only: the salon owner, NOT regular staff. Use for anything staff must
 * not see — critically, the mystery-shopper programme, where staff must never
 * learn who the secret shopper is.
 */
export const ownerProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (ctx.session.user.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Owner access required." });
  }
  return next({ ctx: { ...ctx, session: ctx.session } });
});
