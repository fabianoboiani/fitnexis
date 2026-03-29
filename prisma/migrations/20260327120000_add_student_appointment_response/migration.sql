CREATE TYPE "StudentAppointmentResponseStatus" AS ENUM ('PENDING', 'CONFIRMED', 'RESCHEDULE_REQUESTED', 'CANCELED');

ALTER TABLE "Appointment"
  ADD COLUMN IF NOT EXISTS "studentResponseStatus" "StudentAppointmentResponseStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "studentRespondedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "studentResponseNote" TEXT;

CREATE INDEX IF NOT EXISTS "Appointment_tenantId_studentResponseStatus_idx"
  ON "Appointment"("tenantId", "studentResponseStatus");