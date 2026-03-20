ALTER TABLE "Tenant"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Tenant_isActive_idx" ON "Tenant"("isActive");
