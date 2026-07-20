-- AddColumn: OTP rate-limiting on mystery-shopper entries
ALTER TABLE "mystery_shopper_entries" ADD COLUMN "otpAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "mystery_shopper_entries" ADD COLUMN "lastOtpSentAt" TIMESTAMP(3);
