import { z } from "zod";
import { router, adminProcedure } from "@/server/trpc";
import { sendEmail, emailLayout } from "@/lib/email";

export const emailRouter = router({
  // How many clients would receive a marketing campaign.
  audienceCount: adminProcedure
    .input(z.object({ spaId: z.string() }))
    .query(async ({ ctx, input }) => {
      const spaId = ctx.spaId ?? input.spaId;
      return ctx.prisma.user.count({
        where: { spaId, role: "client", marketingOptIn: true, email: { not: null } },
      });
    }),

  // Send a campaign to opted-in clients (POPIA: only marketingOptIn recipients).
  sendCampaign: adminProcedure
    .input(z.object({ spaId: z.string(), subject: z.string().min(1), body: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const spaId = ctx.spaId ?? input.spaId;
      const recipients = await ctx.prisma.user.findMany({
        where: { spaId, role: "client", marketingOptIn: true, email: { not: null } },
        select: { id: true, email: true, name: true },
      });

      const html = emailLayout(
        `<div style="color:#c9bca4;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;">${input.body}</div>`
      );

      let sent = 0;
      for (const r of recipients) {
        if (!r.email) continue;
        try {
          await sendEmail({ to: r.email, subject: input.subject, html });
          await ctx.prisma.notification.create({
            data: {
              userId: r.id,
              spaId,
              type: "campaign",
              channel: "email",
              status: "sent",
              sentAt: new Date(),
              payload: { subject: input.subject },
            },
          });
          sent++;
        } catch {
          await ctx.prisma.notification.create({
            data: {
              userId: r.id,
              spaId,
              type: "campaign",
              channel: "email",
              status: "failed",
              payload: { subject: input.subject },
            },
          });
        }
      }

      return { recipients: recipients.length, sent };
    }),
});
