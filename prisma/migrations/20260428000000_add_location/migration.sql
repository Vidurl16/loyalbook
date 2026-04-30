-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "spaId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_slug_key" ON "locations"("slug");

-- AddForeignKey
ALTER TABLE "locations" ADD CONSTRAINT "locations_spaId_fkey" FOREIGN KEY ("spaId") REFERENCES "Spa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed Perfect 10 locations (run separately or via seed script)
-- INSERT INTO "locations" ("id","spaId","slug","name","address","timezone","currency")
-- VALUES
--   (gen_random_uuid(),'<SPA_ID>','ballito','Perfect 10 Ballito','Ballito, KwaZulu-Natal','Africa/Johannesburg','ZAR'),
--   (gen_random_uuid(),'<SPA_ID>','la-lucia','Perfect 10 La Lucia','La Lucia, KwaZulu-Natal','Africa/Johannesburg','ZAR');
