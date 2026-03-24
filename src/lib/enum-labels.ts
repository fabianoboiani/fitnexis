import type {
  AppointmentStatus,
  PaymentMethod,
  PaymentStatus,
  StudentStatus,
  SubscriptionStatus,
  UserRole
} from "@prisma/client";

export const userRoleLabels: Record<UserRole, string> = {
  ADMIN: "Administrador",
  PERSONAL: "Personal trainer",
  STUDENT: "Aluno"
};

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  TRIAL: "Em teste",
  ACTIVE: "Ativa",
  PAST_DUE: "Em atraso",
  CANCELED: "Cancelada"
};

export const studentStatusLabels: Record<StudentStatus, string> = {
  ACTIVE: "Ativo",
  PAUSED: "Pausado",
  DELINQUENT: "Inadimplente",
  INACTIVE: "Inativo"
};

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  OVERDUE: "Vencido",
  CANCELED: "Cancelado"
};

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "Agendado",
  COMPLETED: "Concluído",
  CANCELED: "Cancelado",
  MISSED: "Faltou"
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  PIX: "Pix",
  CASH: "Dinheiro",
  CARD: "Cartão",
  TRANSFER: "Transferência",
  OTHER: "Outro"
};
