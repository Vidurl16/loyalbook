-- CreateTable
CREATE TABLE "transformations" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "therapist" TEXT NOT NULL,
    "description" TEXT,
    "beforeImageUrl" TEXT,
    "afterImageUrl" TEXT,
    "rating" INTEGER,
    "appointmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transformations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transformations_locationId_idx" ON "transformations"("locationId");
CREATE INDEX "transformations_category_idx" ON "transformations"("category");

-- AddForeignKey
ALTER TABLE "transformations" ADD CONSTRAINT "transformations_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
