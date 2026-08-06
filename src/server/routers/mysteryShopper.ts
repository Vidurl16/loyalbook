import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { randomInt } from "crypto";
import { router, publicProcedure, ownerProcedure } from "@/server/trpc";
import { generateOtp, verifyOtp } from "@/lib/otp";
import { sendEmail, emailLayout } from "@/lib/email";

type Prize = { label: string; weight: number; win: boolean };

const DEFAULT_PRIZES: Prize[] = [
  { label: "50% off your next treatment", weight: 1, win: true },
  { label: "20% off your next treatment", weight: 3, win: true },
  { label: "A complimentary add-on", weight: 3, win: true },
  { label: "No prize this time — thank you for entering", weight: 3, win: false },
];

const COOLDOWN_DAYS = 90;

function getPrizes(settings: unknown): Prize[] {
  const raw = (settings as { mysteryPrizes?: Prize[] } | null)?.mysteryPrizes;
  if (Array.isArray(raw) && raw.length) return raw;
  return DEFAULT_PRIZES;
}

// Server-authoritative weighted pick — never trust the client for the outcome.
function pickPrize(prizes: Prize[]): Prize {
  const total = prizes.reduce((s, p) => s + Math.max(0, p.weight), 0);
  let roll = randomInt(0, Math.max(1, total));
  for (const p of prizes) {
    roll -= Math.max(0, p.weight);
    if (roll < 0) return p;
  }
  return prizes[prizes.length - 1];
}

export const mysteryShopperRouter = router({
  // Public: enter the programme; sends an email OTP to verify the address.
  enter: publicProcedure
    .input(
      z.object({
        spaId: z.string(),
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();
      const existing = await ctx.prisma.mysteryShopperEntry.findUnique({
        where: { spaId_email: { spaId: input.spaId, email } },
      });

      if (existing?.cooldownUntil && existing.cooldownUntil.getTime() > Date.now()) {
        const days = Math.ceil((existing.cooldownUntil.getTime() - Date.now()) / 86_400_000);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `You've already taken part recently. You can enter again in ${days} day${days === 1 ? "" : "s"}.`,
        });
      }
      if (existing?.spunAt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "You've already spun with this email." });
      }

      // Resend throttle: at most one code per 60s per email (anti email-bomb / cost abuse).
      if (existing?.otpSentAt && Date.now() - existing.otpSentAt.getTime() < 60_000) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "A code was just sent. Please wait a minute before requesting another.",
        });
      }

      const { code, hash, expiresAt } = await generateOtp();

      await ctx.prisma.mysteryShopperEntry.upsert({
        where: { spaId_email: { spaId: input.spaId, email } },
        create: {
          spaId: input.spaId,
          name: input.name,
          email,
          phone: input.phone,
          otpHash: hash,
          otpExpiresAt: expiresAt,
          otpSentAt: new Date(),
          otpAttempts: 0,
          status: "entered",
        },
        update: {
          name: input.name,
          phone: input.phone,
          otpHash: hash,
          otpExpiresAt: expiresAt,
          otpSentAt: new Date(),
          otpAttempts: 0,
          verifiedAt: null,
          status: "entered",
        },
      });

      await sendEmail({
        to: email,
        subject: "Your Perfect 10 verification code",
        html: emailLayout(
          `<p style="color:#c9bca4;font-family:Arial,sans-serif;">Your mystery-shopper verification code is:</p>
           <p style="font-size:30px;letter-spacing:8px;color:#f5f0e8;font-family:Arial,sans-serif;margin:16px 0;">${code}</p>
           <p style="color:#8a7d68;font-size:13px;font-family:Arial,sans-serif;">This code expires in 10 minutes.</p>`
        ),
      });

      return { ok: true, needsVerification: true };
    }),

  // Public: verify the emailed code.
  verify: publicProcedure
    .input(z.object({ spaId: z.string(), email: z.string().email(), code: z.string().min(4) }))
    .mutation(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();
      const entry = await ctx.prisma.mysteryShopperEntry.findUnique({
        where: { spaId_email: { spaId: input.spaId, email } },
      });
      if (!entry) throw new TRPCError({ code: "NOT_FOUND", message: "No entry found — please enter first." });

      // Brute-force lockout: a 6-digit code is guessable within the 10-min window
      // without a cap. After 5 wrong tries the code is voided and must be re-requested.
      const MAX_ATTEMPTS = 5;
      if (!entry.otpHash) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "This code is no longer valid — please request a new one." });
      }
      if (entry.otpAttempts >= MAX_ATTEMPTS) {
        await ctx.prisma.mysteryShopperEntry.update({
          where: { id: entry.id },
          data: { otpHash: null, otpExpiresAt: null },
        });
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts — please request a new code." });
      }

      const ok = await verifyOtp(input.code.trim(), entry.otpHash, entry.otpExpiresAt);
      if (!ok) {
        await ctx.prisma.mysteryShopperEntry.update({
          where: { id: entry.id },
          data: { otpAttempts: { increment: 1 } },
        });
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired code." });
      }

      await ctx.prisma.mysteryShopperEntry.update({
        where: { id: entry.id },
        data: { verifiedAt: new Date(), status: "verified", otpHash: null, otpExpiresAt: null, otpAttempts: 0 },
      });
      return { verified: true };
    }),

  // Public: spin the wheel. Requires verification + consent. Prize decided server-side.
  spin: publicProcedure
    .input(
      z.object({
        spaId: z.string(),
        email: z.string().email(),
        consentReview: z.boolean(),
        consentPhoto: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.consentReview || !input.consentPhoto) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Both consents are required to take part." });
      }
      const email = input.email.trim().toLowerCase();
      const entry = await ctx.prisma.mysteryShopperEntry.findUnique({
        where: { spaId_email: { spaId: input.spaId, email } },
      });
      if (!entry) throw new TRPCError({ code: "NOT_FOUND", message: "No entry found." });
      if (!entry.verifiedAt) throw new TRPCError({ code: "BAD_REQUEST", message: "Please verify your email first." });
      if (entry.spunAt) throw new TRPCError({ code: "BAD_REQUEST", message: "You've already spun." });

      const spa = await ctx.prisma.spa.findUnique({ where: { id: input.spaId }, select: { settings: true } });
      const prize = pickPrize(getPrizes(spa?.settings));

      await ctx.prisma.mysteryShopperEntry.update({
        where: { id: entry.id },
        data: {
          prize: prize.label,
          spunAt: new Date(),
          consentReview: input.consentReview,
          consentPhoto: input.consentPhoto,
          status: prize.win ? "selected" : "verified",
          selectedAt: prize.win ? new Date() : null,
          cooldownUntil: prize.win ? new Date(Date.now() + COOLDOWN_DAYS * 86_400_000) : null,
        },
      });

      return { prize: prize.label, win: prize.win };
    }),

  // Public: check status/prize without exposing the OTP hash.
  getMyStatus: publicProcedure
    .input(z.object({ spaId: z.string(), email: z.string().email() }))
    .query(async ({ ctx, input }) => {
      const email = input.email.trim().toLowerCase();
      const entry = await ctx.prisma.mysteryShopperEntry.findUnique({
        where: { spaId_email: { spaId: input.spaId, email } },
        select: { status: true, verifiedAt: true, prize: true, spunAt: true, cooldownUntil: true },
      });
      return entry;
    }),

  // Owner only (NOT staff): the entry pool + who was selected stays secret from staff.
  listEntries: ownerProcedure
    .input(z.object({ spaId: z.string(), status: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.mysteryShopperEntry.findMany({
        where: {
          spaId: input.spaId,
          ...(input.status ? { status: input.status as never } : {}),
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Owner only: mark a selected shopper's prize as redeemed in-store.
  markRedeemed: ownerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.mysteryShopperEntry.update({
        where: { id: input.id },
        data: { status: "redeemed", redeemedAt: new Date() },
      });
    }),
});
