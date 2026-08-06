-- Add OTP brute-force / resend throttling to mystery-shopper entries.
ALTER TABLE "mystery_shopper_entries" ADD COLUMN "otpAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "mystery_shopper_entries" ADD COLUMN "otpSentAt" TIMESTAMP(3);
