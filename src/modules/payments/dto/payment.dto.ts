import type { PaymentMethod, PaymentStatus } from "@prisma/client";

export type PaymentListItemDto = {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  status: PaymentStatus;
  displayStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
  isOverdue: boolean;
};

export type PaymentDetailsDto = {
  id: string;
  tenantId: string;
  studentId: string;
  amount: number;
  dueDate: Date;
  paidAt: Date | null;
  status: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  notes: string | null;
};

export type PaymentFormValuesDto = {
  studentId: string;
  amount: number;
  dueDate: string;
  paymentMethod?: PaymentMethod;
  notes: string;
  status: PaymentStatus;
  paidAt: string;
};
