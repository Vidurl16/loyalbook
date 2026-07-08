import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "Perfect 10 <onboarding@resend.dev>";

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
  <div style="background:#0e0c0a;padding:32px 0;font-family:Georgia,serif;">
    <div style="max-width:520px;margin:0 auto;background:#16120f;border:1px solid rgba(201,168,92,0.2);border-radius:4px;overflow:hidden;">
      <div style="height:3px;background:linear-gradient(90deg,#b8922e,#c9a85c,#dfc07a,#c9a85c,#b8922e);"></div>
      <div style="padding:32px 28px;color:#f5f0e8;">
        <div style="font-size:20px;font-style:italic;color:#c9a85c;margin-bottom:20px;">Perfect 10</div>
        ${bodyHtml}
      </div>
    </div>
  </div>`;
}
