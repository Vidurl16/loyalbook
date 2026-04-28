-- AlterTable: add galleryItems relation column on locations (none needed — relation is on gallery_items)

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "therapist" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "durationMins" INTEGER NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "isTall" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gallery_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gallery_items_locationId_idx" ON "gallery_items"("locationId");
CREATE INDEX "gallery_items_category_idx" ON "gallery_items"("category");

-- AddForeignKey
ALTER TABLE "gallery_items" ADD CONSTRAINT "gallery_items_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
