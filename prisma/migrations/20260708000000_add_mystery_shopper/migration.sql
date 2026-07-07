-- CreateEnum
CREATE TYPE "MysteryShopperStatus" AS ENUM ('applied', 'scheduled', 'completed', 'approved', 'reimbursed', 'rejected');

-- CreateTable
CREATE TABLE "mystery_shopper_visits" (
    "id"                      TEXT NOT NULL,
    "locationId"               TEXT NOT NULL,
    "clientId"                 TEXT NOT NULL,
    "status"                   "MysteryShopperStatus" NOT NULL DEFAULT 'applied',
    "serviceToEvaluate"        TEXT,
    "plannedVisitDate"          TIMESTAMP(3),
    "preVisitNotes"            TEXT,
    "receiptUrl"               TEXT,
    "receiptAmount"            DOUBLE PRECISION,
    "visitedAt"                TIMESTAMP(3),
    "submittedAt"              TIMESTAMP(3),
    "overallRating"            INTEGER,
    "firstImpressionRating"    INTEGER,
    "cleanlinessRating"        INTEGER,
    "treatmentQualityRating"   INTEGER,
    "staffFriendlinessRating"  INTEGER,
    "productKnowledgeRating"   INTEGER,
    "valueRating"              INTEGER,
    "highlightsFeedback"       TEXT,
    "improvementFeedback"      TEXT,
    "staffFeedback"            TEXT,
    "wouldReturn"              BOOLEAN,
    "reimbursementAmount"      DOUBLE PRECISION,
    "reimbursedAt"             TIMESTAMP(3),
    "adminNotes"               TEXT,
    "createdAt"                TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mystery_shopper_visits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mystery_shopper_visits" ADD CONSTRAINT "mystery_shopper_visits_clientId_fkey"
    FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mystery_shopper_visits" ADD CONSTRAINT "mystery_shopper_visits_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
