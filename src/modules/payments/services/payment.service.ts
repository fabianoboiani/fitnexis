import { notFound } from "next/navigation";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import type {
  PaymentDetailsDto,
  PaymentFormValuesDto,
  PaymentListItemDto
} from "@/modules/payments/dto/payment.dto";
import { PaymentRepository } from "@/modules/payments/repositories/payment.repository";
import {
  CreatePaymentSchema,
  type CreatePaymentInput,
  UpdatePaymentSchema,
  type UpdatePaymentInput
} from "@/modules/payments/schemas/payment.schema";
import { StudentService } from "@/modules/students/services/student.service";

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function resolvePaymentStatus(status: PaymentStatus, dueDate: Date, paidAt: Date | null) {
  if (status === PaymentStatus.PAID) {
    return PaymentStatus.PAID;
  }

  if (!paidAt && dueDate < new Date() && status !== PaymentStatus.CANCELED) {
    return PaymentStatus.OVERDUE;
  }

  return status;
}

function mapFormValues(payment?: PaymentDetailsDto): PaymentFormValuesDto {
  if (!payment) {
    return {
      studentId: "",
      amount: 0,
      dueDate: "",
      paymentMethod: undefined,
      notes: "",
      status: PaymentStatus.PENDING,
      paidAt: ""
    };
  }

    return {
      studentId: payment.studentId,
      amount: payment.amount,
      dueDate: payment.dueDate.toISOString().slice(0, 10),
      paymentMethod: payment.paymentMethod ?? undefined,
      notes: payment.notes ?? "",
      status: payment.status,
      paidAt: payment.paidAt ? payment.paidAt.toISOString().slice(0, 10) : ""
    };
  }

export const PaymentService = {
  async listByTenant(
    tenantId: string,
    filters?: {
      status?: PaymentStatus | "OVERDUE";
      studentId?: string;
    }
  ): Promise<PaymentListItemDto[]> {
    const payments = await PaymentRepository.findManyByTenant(tenantId, filters);

    return payments.map((payment) => {
      const displayStatus = resolvePaymentStatus(payment.status, payment.dueDate, payment.paidAt);

      return {
        id: payment.id,
        studentId: payment.studentId,
        studentName: payment.student.name,
        amount: Number(payment.amount),
        dueDate: payment.dueDate,
        paidAt: payment.paidAt,
        status: payment.status,
        displayStatus,
        paymentMethod: payment.paymentMethod,
        notes: payment.notes,
        isOverdue: displayStatus === PaymentStatus.OVERDUE
      };
    });
  },

  async getByIdOrThrow(tenantId: string, id: string): Promise<PaymentDetailsDto> {
    const payment = await PaymentRepository.findByIdAndTenant(id, tenantId);

    if (!payment) {
      notFound();
    }

    return {
      id: payment.id,
      tenantId: payment.tenantId,
      studentId: payment.studentId,
      amount: Number(payment.amount),
      dueDate: payment.dueDate,
      paidAt: payment.paidAt,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      notes: payment.notes
    };
  },

  async create(tenantId: string, input: CreatePaymentInput) {
    const parsed = CreatePaymentSchema.parse(input);
    const student = await StudentService.getById(tenantId, parsed.studentId);

    if (!student) {
      throw new Error("O aluno informado n?o pertence ao tenant atual.");
    }

    const shouldMarkAsPaid = parsed.status === PaymentStatus.PAID;
    const paidAt = shouldMarkAsPaid
      ? parsed.paidAt
        ? parseDate(parsed.paidAt)
        : new Date()
      : undefined;

    return PaymentRepository.create({
      tenantId,
      studentId: parsed.studentId,
      amount: parsed.amount,
      dueDate: parseDate(parsed.dueDate),
      paidAt,
      status: shouldMarkAsPaid ? PaymentStatus.PAID : parsed.status,
      paymentMethod: parsed.paymentMethod,
      notes: parsed.notes
    });
  },

  async update(tenantId: string, id: string, input: UpdatePaymentInput) {
    const parsed = UpdatePaymentSchema.parse(input);
    const existingPayment = await PaymentRepository.findByIdAndTenant(id, tenantId);

    if (!existingPayment) {
      notFound();
    }

    const student = await StudentService.getById(tenantId, parsed.studentId);

    if (!student) {
      throw new Error("O aluno informado n?o pertence ao tenant atual.");
    }

    const isPaid = parsed.status === PaymentStatus.PAID;
    const paidAt = isPaid ? (parsed.paidAt ? parseDate(parsed.paidAt) : new Date()) : null;

    await PaymentRepository.updateByIdAndTenant(id, tenantId, {
      studentId: parsed.studentId,
      amount: parsed.amount,
      dueDate: parseDate(parsed.dueDate),
      paidAt,
      status: isPaid ? PaymentStatus.PAID : parsed.status,
      paymentMethod: parsed.paymentMethod ?? null,
      notes: parsed.notes ?? null
    });

    return PaymentRepository.findByIdAndTenant(id, tenantId);
  },

  async markAsPaid(tenantId: string, id: string, paidAt?: string) {
    const payment = await PaymentRepository.findByIdAndTenant(id, tenantId);

    if (!payment) {
      notFound();
    }

    await PaymentRepository.updateByIdAndTenant(id, tenantId, {
      studentId: payment.studentId,
      amount: payment.amount,
      dueDate: payment.dueDate,
      paidAt: paidAt ? parseDate(paidAt) : new Date(),
      status: PaymentStatus.PAID,
      paymentMethod: payment.paymentMethod ?? null,
      notes: payment.notes ?? null
    });
  },

  getFormValues(payment?: PaymentDetailsDto) {
    return mapFormValues(payment);
  },

  getPaymentMethodOptions() {
    return [
      { value: "", label: "N?o informado" },
      { value: PaymentMethod.PIX, label: "PIX" },
      { value: PaymentMethod.CASH, label: "Dinheiro" },
      { value: PaymentMethod.CARD, label: "Cartao" },
      { value: PaymentMethod.TRANSFER, label: "Transferencia" },
      { value: PaymentMethod.OTHER, label: "Outro" }
    ];
  }
};
