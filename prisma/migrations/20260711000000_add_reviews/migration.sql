-- CreateTable
CREATE TABLE "reviews" (
    "id"               TEXT NOT NULL,
    "locationId"       TEXT NOT NULL,
    "clientId"         TEXT,
    "authorName"       TEXT NOT NULL,
    "rating"           INTEGER NOT NULL,
    "body"             TEXT NOT NULL,
    "serviceName"      TEXT,
    "therapist"        TEXT,
    "imageUrl"         TEXT,
    "consentToPublish" BOOLEAN NOT NULL DEFAULT true,
    "isPublished"      BOOLEAN NOT NULL DEFAULT true,
    "sortOrder"        INTEGER NOT NULL DEFAULT 0,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_locationId_fkey"
    FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
