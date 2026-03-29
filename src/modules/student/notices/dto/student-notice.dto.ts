export type StudentNoticeFilter = "all" | "unread" | "high-priority";
export type StudentNoticeKind = "info" | "success" | "warning";
export type StudentNoticePriority = "low" | "medium" | "high";
export type StudentNoticeCategory =
  | "Lembrete de sessão"
  | "Alteração de horário"
  | "Solicitação pendente"
  | "Confirmação pendente"
  | "Aviso financeiro"
  | "Atualização de evolução"
  | "Comunicado do personal"
  | "Aviso do sistema";

export type StudentNoticeItem = {
  id: string;
  title: string;
  description: string;
  details: string;
  createdAt: Date;
  kind: StudentNoticeKind;
  category: StudentNoticeCategory;
  priority: StudentNoticePriority;
  isRead: boolean;
  relatedHref?: string;
  relatedLabel?: string;
};