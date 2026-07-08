-- AlterTable: loyalty config gains voucher expiry + tier ladder
ALTER TABLE "LoyaltyConfig" ADD COLUMN "voucherExpiryDays" INTEGER NOT NULL DEFAULT 90;
ALTER TABLE "LoyaltyConfig" ADD COLUMN "tiers" JSONB NOT NULL DEFAULT '[{"name":"Bronze","minLifetimeEarned":0},{"name":"Silver","minLifetimeEarned":2500},{"name":"Gold","minLifetimeEarned":5000},{"name":"Perfect 10","minLifetimeEarned":10000}]';

-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('active', 'redeemed', 'expired', 'void');
CREATE TYPE "VoucherDiscountType" AS ENUM ('fixed', 'percent');

-- CreateTable
CREATE TABLE "vouchers" (
    "id"                  TEXT NOT NULL,
    "spaId"               TEXT NOT NULL,
    "clientId"            TEXT NOT NULL,
    "code"                TEXT NOT NULL,
    "pointsSpent"         INTEGER NOT NULL,
    "discountType"        "VoucherDiscountType" NOT NULL DEFAULT 'fixed',
    "discountValue"       DOUBLE PRECISION NOT NULL,
    "status"              "VoucherStatus" NOT NULL DEFAULT 'active',
    "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt"           TIMESTAMP(3),
    "redeemedAt"          TIMESTAMP(3),
    "redeemedByStaffId"   TEXT,
    "appointmentId"       TEXT,
    "pointsTransactionId" TEXT,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");
CREATE INDEX "vouchers_spaId_status_idx" ON "vouchers"("spaId", "status");

-- AddForeignKey
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_spaId_fkey"
    FOREIGN KEY ("spaId") REFERENCES "Spa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
