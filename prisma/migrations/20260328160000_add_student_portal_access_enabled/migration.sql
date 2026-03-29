ALTER TABLE "Student"
ADD COLUMN "portalAccessEnabled" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Student"
SET "portalAccessEnabled" = true
WHERE "userId" IS NOT NULL;