import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

const OTP_TTL_MINUTES = 10;

/** Generate a 6-digit one-time code plus its hash and expiry for storage. */
export async function generateOtp() {
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const hash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
  return { code, hash, expiresAt };
}

/** Verify a submitted code against a stored hash + expiry. */
export async function verifyOtp(code: string, hash: string | null, expiresAt: Date | null): Promise<boolean> {
  if (!hash || !expiresAt) return false;
  if (expiresAt.getTime() < Date.now()) return false;
  return bcrypt.compare(code, hash);
}
