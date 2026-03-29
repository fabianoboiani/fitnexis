import type { AppointmentStatus, StudentAppointmentResponseStatus } from "@prisma/client";

export type AppointmentListItemDto = {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  studentResponseStatus: StudentAppointmentResponseStatus;
  studentRespondedAt: Date | null;
  studentResponseNote: string | null;
  notes: string | null;
};

export type AppointmentDetailsDto = {
  id: string;
  tenantId: string;
  studentId: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  status: AppointmentStatus;
  studentResponseStatus: StudentAppointmentResponseStatus;
  studentRespondedAt: Date | null;
  studentResponseNote: string | null;
  notes: string | null;
};

export type AppointmentFormValuesDto = {
  studentId: string;
  title: string;
  startsAt: string;
  endsAt: string;
  notes: string;
  status: AppointmentStatus;
};
