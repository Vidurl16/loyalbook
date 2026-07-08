-- CreateEnum
CREATE TYPE "MysteryEntryStatus" AS ENUM ('entered', 'verified', 'selected', 'redeemed', 'expired');

-- CreateTable
CREATE TABLE "mystery_shopper_entries" (
    "id"            TEXT NOT NULL,
    "spaId"         TEXT NOT NULL,
    "clientId"      TEXT,
    "name"          TEXT NOT NULL,
    "email"         TEXT NOT NULL,
    "phone"         TEXT,
    "otpHash"       TEXT,
    "otpExpiresAt"  TIMESTAMP(3),
    "verifiedAt"    TIMESTAMP(3),
    "prize"         TEXT,
    "spunAt"        TIMESTAMP(3),
    "consentReview" BOOLEAN NOT NULL DEFAULT false,
    "consentPhoto"  BOOLEAN NOT NULL DEFAULT false,
    "status"        "MysteryEntryStatus" NOT NULL DEFAULT 'entered',
    "selectedAt"    TIMESTAMP(3),
    "redeemedAt"    TIMESTAMP(3),
    "cooldownUntil" TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mystery_shopper_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mystery_shopper_entries_spaId_email_key" ON "mystery_shopper_entries"("spaId", "email");
