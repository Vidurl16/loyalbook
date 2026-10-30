import { Resend } from "resend";
import { brand } from "@/lib/brand";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? `${brand.name} <onboarding@resend.dev>`;

let resend: Resend | null = null;
function client(): Resend | null {
  if (!apiKey) return null;
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

export type SendEmailArgs = {
  to: string | string[];
  subject: string;
  html: string;
};

/**
 * Send an email via Resend. When RESEND_API_KEY is not configured (e.g. local
 * dev) this logs instead of sending and reports success, so flows that depend on
 * email (OTP, campaigns, win-back) remain testable without a key.
 */
export async function sendEmail({ to, subject, html }: SendEmailArgs): Promise<{ sent: boolean; skipped?: boolean }> {
  const c = client();
  if (!c) {
    console.info(`[email:skipped] to=${Array.isArray(to) ? to.join(",") : to} subject="${subject}"`);
    return { sent: false, skipped: true };
  }
  const { error } = await c.emails.send({ from: FROM, to, subject, html });
  if (error) throw new Error(error.message);
  return { sent: true };
}

/** Minimal branded email shell. */
export function emailLayout(bodyHtml: string): string {
  return `
  <div style="background:#faf6f5;padding:32px 0;font-family:'Century Gothic',Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #efdcd8;border-radius:4px;overflow:hidden;">
      <div style="height:3px;background:${brand.accent};"></div>
      <div style="padding:32px 28px;color:#232122;">
        <div style="font-size:20px;font-style:italic;color:${brand.accent};margin-bottom:20px;">${brand.name}</div>
        ${bodyHtml}
      </div>
    </div>
  </div>`;
}
