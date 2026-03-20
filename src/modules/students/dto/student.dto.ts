import type { StudentStatus } from "@prisma/client";

export type StudentListItemDto = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: StudentStatus;
  goal: string | null;
  createdAt: Date;
};

export type StudentDetailsDto = {
  id: string;
  tenantId: string;
  name: string;
  email: string | null;
  phone: string | null;
  birthDate: Date | null;
  goal: string | null;
  notes: string | null;
  status: StudentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type StudentFormValuesDto = {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  goal: string;
  notes: string;
  status: StudentStatus;
};
