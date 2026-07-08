import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout } from "@/lib/email";

export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/**
 * Automated win-back: emails clients who haven't visited in a while. Protected
 * by a shared secret; scheduled via Vercel Cron (see vercel.json). Records each
 * send in Notification so a client isn't re-emailed within the window.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || !auth || !safeEqual(auth, `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const windowDays = Number(process.env.WINBACK_DAYS ?? 60);
  const cutoff = new Date(Date.now() - windowDays * 86_400_000);
  const spaId = process.env.DEFAULT_SPA_ID ?? (await prisma.spa.findFirst({ select: { id: true } }))?.id;
  if (!spaId) return NextResponse.json({ error: "No spa configured" }, { status: 500 });

  // Opted-in clients whose last activity is older than the window.
  const candidates = await prisma.user.findMany({
    where: {
      spaId,
      role: "client",
      marketingOptIn: true,
      email: { not: null },
      loyaltyAccount: { lastActivityAt: { lt: cutoff } },
    },
    select: { id: true, name: true, email: true },
  });

  let sent = 0;
  for (const c of candidates) {
    if (!c.email) continue;

    // Skip if we've already sent a win-back within the window.
    const recent = await prisma.notification.findFirst({
      where: { userId: c.id, type: "winback", sentAt: { gte: cutoff } },
    });
    if (recent) continue;

    const html = emailLayout(
      `<p style="color:#c9bca4;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;">
         ${c.name ? `Hi ${c.name},` : "Hello,"} we&apos;ve missed you at Perfect 10.
       </p>
       <p style="color:#c9bca4;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;">
         It&apos;s been a little while since your last visit — treat yourself to something lovely.
         Your loyalty points are waiting.
       </p>`
    );

    try {
      await sendEmail({ to: c.email, subject: "We've missed you at Perfect 10", html });
      await prisma.notification.create({
        data: { userId: c.id, spaId, type: "winback", channel: "email", status: "sent", sentAt: new Date() },
      });
      sent++;
    } catch {
      await prisma.notification.create({
        data: { userId: c.id, spaId, type: "winback", channel: "email", status: "failed" },
      });
    }
  }

  return NextResponse.json({ candidates: candidates.length, sent });
}
