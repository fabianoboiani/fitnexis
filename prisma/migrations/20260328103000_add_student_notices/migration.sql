CREATE TYPE "StudentNoticeKind" AS ENUM ('INFO', 'SUCCESS', 'WARNING');
CREATE TYPE "StudentNoticePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "StudentNoticeCategory" AS ENUM ('SESSION_REMINDER', 'SCHEDULE_CHANGE', 'PENDING_REQUEST', 'CONFIRMATION_REQUIRED', 'PAYMENT_ALERT', 'PROGRESS_UPDATE', 'SYSTEM');
CREATE TYPE "StudentNoticeEntityType" AS ENUM ('APPOINTMENT', 'PAYMENT', 'PROGRESS_RECORD', 'STUDENT', 'SYSTEM');

CREATE TABLE "StudentNotice" (
  "id" TEXT NOT NULL,
  "externalKey" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "kind" "StudentNoticeKind" NOT NULL,
  "category" "StudentNoticeCategory" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "priority" "StudentNoticePriority" NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "relatedEntityType" "StudentNoticeEntityType",
  "relatedEntityId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StudentNotice_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentNotice_externalKey_key" ON "StudentNotice"("externalKey");
CREATE INDEX "StudentNotice_tenantId_studentId_idx" ON "StudentNotice"("tenantId", "studentId");
CREATE INDEX "StudentNotice_studentId_isRead_idx" ON "StudentNotice"("studentId", "isRead");
CREATE INDEX "StudentNotice_studentId_priority_idx" ON "StudentNotice"("studentId", "priority");
CREATE INDEX "StudentNotice_studentId_createdAt_idx" ON "StudentNotice"("studentId", "createdAt");

ALTER TABLE "StudentNotice"
ADD CONSTRAINT "StudentNotice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StudentNotice"
ADD CONSTRAINT "StudentNotice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
