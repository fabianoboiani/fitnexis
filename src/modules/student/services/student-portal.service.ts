import { addDays, format, set, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export const studentAgendaStatuses = [
  "Agendado",
  "Confirmado",
  "Pendente",
  "Cancelado",
  "Conclu\u00eddo",
  "Reagendamento solicitado"
] as const;

export type StudentAppointmentStatus = (typeof studentAgendaStatuses)[number];
export type StudentAttendanceStatus = "Presen\u00e7a confirmada" | "Presente" | "Ausente justificado";
export type StudentHistoryPeriod = "all" | "30d" | "90d";
export type StudentHistoryAttendanceFilter = "all" | "present" | "absent";
export type StudentNoticeFilter = "all" | "unread" | "high-priority";
export type StudentNoticeKind = "info" | "success" | "warning";
export type StudentNoticePriority = "low" | "medium" | "high";
export type StudentNoticeCategory =
  | "Lembrete de sess\u00e3o"
  | "Altera\u00e7\u00e3o de hor\u00e1rio"
  | "Solicita\u00e7\u00e3o pendente"
  | "Confirma\u00e7\u00e3o pendente"
  | "Comunicado do personal"
  | "Aviso do sistema";

export type StudentAppointmentHistoryItem = {
  id: string;
  status: StudentAppointmentStatus | "Criado";
  occurredAt: Date;
  description: string;
};

export type StudentUpcomingAppointment = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  coach: string;
  location: string;
  format: string;
  status: StudentAppointmentStatus;
  notes?: string;
  preparationInstructions?: string;
  history: StudentAppointmentHistoryItem[];
};

export type StudentHistoryItem = {
  id: string;
  title: string;
  category: string;
  date: Date;
  startsAt: Date;
  endsAt: Date;
  finalStatus: "Conclu\u00eddo" | "Registrado";
  attendance: StudentAttendanceStatus;
  note: string;
  coach: string;
  location: string;
  insights: string[];
};

export type StudentProgressItem = {
  id: string;
  recordedAt: Date;
  title: string;
  value: string;
  note: string;
};

export type StudentProgressMetric = {
  id: string;
  label: string;
  value: string;
  description: string;
};

export type StudentProgressTrendPoint = {
  id: string;
  label: string;
  value: number;
};

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

export type StudentDashboardStat = {
  id: string;
  label: string;
  value: string;
  description: string;
};

export type StudentQuickAction = {
  id: string;
  label: string;
  description: string;
  href: string;
};

function createAppointment(daysFromNow: number, hour: number, minute: number, durationMinutes: number) {
  const startsAt = set(addDays(new Date(), daysFromNow), {
    hours: hour,
    minutes: minute,
    seconds: 0,
    milliseconds: 0
  });

  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

  return { startsAt, endsAt };
}

function createPastSession(daysAgo: number, hour: number, minute: number, durationMinutes: number) {
  const startsAt = set(subDays(new Date(), daysAgo), {
    hours: hour,
    minutes: minute,
    seconds: 0,
    milliseconds: 0
  });

  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

  return { startsAt, endsAt, date: startsAt };
}

const appointmentTimes = {
  first: createAppointment(1, 7, 0, 60),
  second: createAppointment(3, 18, 30, 50),
  third: createAppointment(5, 8, 0, 55),
  fourth: createAppointment(7, 19, 0, 50),
  completed: createAppointment(-2, 7, 0, 60)
};

const historyTimes = {
  first: createPastSession(2, 7, 0, 60),
  second: createPastSession(5, 18, 0, 50),
  third: createPastSession(12, 8, 30, 55),
  fourth: createPastSession(24, 7, 15, 60),
  fifth: createPastSession(54, 19, 0, 45)
};

const upcomingAppointments: StudentUpcomingAppointment[] = [  {
    id: "student-appointment-1",
    title: "Treino de for\u00e7a",
    ...appointmentTimes.first,
    coach: "Fabio Trainer",
    location: "Studio Fitnexis",
    format: "Presencial",
    status: "Confirmado",
    notes: "Chegue 10 minutos antes para aquecimento e revis\u00e3o do bloco da semana.",
    preparationInstructions: "Use roupa leve, traga sua garrafa e priorize alimenta\u00e7\u00e3o leve at\u00e9 90 minutos antes da sess\u00e3o.",
    history: [
      { id: "history-1-1", status: "Criado", occurredAt: addDays(new Date(), -4), description: "Sess\u00e3o criada pelo personal na agenda do aluno." },
      { id: "history-1-2", status: "Agendado", occurredAt: addDays(new Date(), -3), description: "Hor\u00e1rio reservado com foco no bloco de for\u00e7a da semana." },
      { id: "history-1-3", status: "Confirmado", occurredAt: addDays(new Date(), -1), description: "Presen\u00e7a confirmada para a sess\u00e3o de amanh\u00e3." }
    ]
  },
  {
    id: "student-appointment-2",
    title: "Sess\u00e3o de mobilidade",
    ...appointmentTimes.second,
    coach: "Fabio Trainer",
    location: "Atendimento online",
    format: "Online",
    status: "Pendente",
    notes: "Leve el\u00e1stico e tapete para a sess\u00e3o guiada por v\u00eddeo.",
    preparationInstructions: "Deixe o ambiente livre e o link da chamada acess\u00edvel alguns minutos antes do hor\u00e1rio.",
    history: [
      { id: "history-2-1", status: "Criado", occurredAt: addDays(new Date(), -2), description: "Sess\u00e3o aberta na agenda como complemento do ciclo atual." },
      { id: "history-2-2", status: "Pendente", occurredAt: addDays(new Date(), -1), description: "Aguardando sua confirma\u00e7\u00e3o de presen\u00e7a." }
    ]
  },
  {
    id: "student-appointment-3",
    title: "Avalia\u00e7\u00e3o de performance",
    ...appointmentTimes.third,
    coach: "Fabio Trainer",
    location: "Studio Fitnexis",
    format: "Presencial",
    status: "Agendado",
    notes: "Sess\u00e3o focada em revis\u00e3o t\u00e9cnica e ajustes de execu\u00e7\u00e3o.",
    preparationInstructions: "Traga seu t\u00eanis de treino habitual e esteja preparado para registros de v\u00eddeo curtos.",
    history: [
      { id: "history-3-1", status: "Criado", occurredAt: addDays(new Date(), -1), description: "Avalia\u00e7\u00e3o inserida na agenda para o pr\u00f3ximo bloco." },
      { id: "history-3-2", status: "Agendado", occurredAt: new Date(), description: "Sess\u00e3o aguardando confirma\u00e7\u00e3o do aluno." }
    ]
  },
  {
    id: "student-appointment-4",
    title: "Treino cardiorrespirat\u00f3rio",
    ...appointmentTimes.fourth,
    coach: "Fabio Trainer",
    location: "Studio Fitnexis",
    format: "Presencial",
    status: "Reagendamento solicitado",
    notes: "Sua solicita\u00e7\u00e3o foi registrada e depende da confirma\u00e7\u00e3o do personal.",
    preparationInstructions: "Aguarde a valida\u00e7\u00e3o do novo hor\u00e1rio antes de reorganizar sua rotina.",
    history: [
      { id: "history-4-1", status: "Agendado", occurredAt: addDays(new Date(), -3), description: "Sess\u00e3o reservada inicialmente para quarta-feira." },
      { id: "history-4-2", status: "Reagendamento solicitado", occurredAt: addDays(new Date(), -1), description: "Pedido de mudan\u00e7a enviado e aguardando retorno do personal." }
    ]
  },
  {
    id: "student-appointment-5",
    title: "Treino de membros inferiores",
    ...appointmentTimes.completed,
    coach: "Fabio Trainer",
    location: "Studio Fitnexis",
    format: "Presencial",
    status: "Conclu\u00eddo",
    notes: "Sess\u00e3o finalizada com registro de evolu\u00e7\u00e3o nas cargas.",
    preparationInstructions: "Sess\u00e3o j\u00e1 realizada.",
    history: [
      { id: "history-5-1", status: "Agendado", occurredAt: addDays(new Date(), -5), description: "Sess\u00e3o programada para o bloco anterior." },
      { id: "history-5-2", status: "Confirmado", occurredAt: addDays(new Date(), -3), description: "Presen\u00e7a confirmada pelo aluno." },
      { id: "history-5-3", status: "Conclu\u00eddo", occurredAt: addDays(new Date(), -2), description: "Treino conclu\u00eddo com anota\u00e7\u00f5es registradas no acompanhamento." }
    ]
  }
];

const historyItems: StudentHistoryItem[] = [
  {
    id: "student-history-1",
    title: "Treino de membros inferiores",
    category: "For\u00e7a",
    ...historyTimes.first,
    finalStatus: "Conclu\u00eddo",
    attendance: "Presente",
    note: "Boa execu\u00e7\u00e3o e evolu\u00e7\u00e3o nas cargas durante o bloco principal.",
    coach: "Fabio Trainer",
    location: "Studio Fitnexis",
    insights: ["Cargas evolu\u00edram de forma consistente.", "Execu\u00e7\u00e3o t\u00e9cnica mantida em todas as s\u00e9ries."]
  },
  {
    id: "student-history-2",
    title: "Treino metab\u00f3lico",
    category: "Condicionamento",
    ...historyTimes.second,
    finalStatus: "Conclu\u00eddo",
    attendance: "Presente",
    note: "Treino ajustado para condicionamento com boa resposta durante a sess\u00e3o.",
    coach: "Fabio Trainer",
    location: "Atendimento online",
    insights: ["Boa adapta\u00e7\u00e3o ao formato remoto.", "Ritmo mantido at\u00e9 o final da sess\u00e3o."]
  },
  {
    id: "student-history-3",
    title: "Avalia\u00e7\u00e3o f\u00edsica inicial",
    category: "Avalia\u00e7\u00e3o",
    ...historyTimes.third,
    finalStatus: "Registrado",
    attendance: "Presente",
    note: "Medidas iniciais registradas para acompanhar a evolu\u00e7\u00e3o do pr\u00f3ximo ciclo.",
    coach: "Fabio Trainer",
    location: "Studio Fitnexis",
    insights: ["Base inicial documentada.", "Foco definido para o pr\u00f3ximo per\u00edodo."]
  },
  {
    id: "student-history-4",
    title: "Sess\u00e3o de mobilidade",
    category: "Mobilidade",
    ...historyTimes.fourth,
    finalStatus: "Registrado",
    attendance: "Ausente justificado",
    note: "Sess\u00e3o remarcada ap\u00f3s aviso pr\u00e9vio do aluno, sem preju\u00edzo do planejamento.",
    coach: "Fabio Trainer",
    location: "Atendimento online",
    insights: ["Aus\u00eancia comunicada com anteced\u00eancia.", "Reorganiza\u00e7\u00e3o feita no mesmo ciclo."]
  },
  {
    id: "student-history-5",
    title: "Treino cardiorrespirat\u00f3rio",
    category: "Cardio",
    ...historyTimes.fifth,
    finalStatus: "Conclu\u00eddo",
    attendance: "Presente",
    note: "Sess\u00e3o conclu\u00edda com boa consist\u00eancia e controle de intensidade.",
    coach: "Fabio Trainer",
    location: "Studio Fitnexis",
    insights: ["Boa resposta cardiovascular.", "Manuten\u00e7\u00e3o de ritmo acima da m\u00e9dia anterior."]
  }
];

const progressItems: StudentProgressItem[] = [
  {
    id: "student-progress-1",
    recordedAt: addDays(new Date(), -21),
    title: "Peso corporal",
    value: "65,1 kg",
    note: "Ponto de compara\u00e7\u00e3o do in\u00edcio do ciclo atual."
  },
  {
    id: "student-progress-2",
    recordedAt: addDays(new Date(), -14),
    title: "Percentual de gordura",
    value: "21,5%",
    note: "Leve redu\u00e7\u00e3o desde a primeira avalia\u00e7\u00e3o."
  },
  {
    id: "student-progress-3",
    recordedAt: addDays(new Date(), -4),
    title: "Carga no agachamento",
    value: "+10%",
    note: "Evolu\u00e7\u00e3o consistente nas \u00faltimas semanas."
  },
  {
    id: "student-progress-4",
    recordedAt: addDays(new Date(), -1),
    title: "Peso corporal",
    value: "64,2 kg",
    note: "Est\u00e1vel em rela\u00e7\u00e3o ao \u00faltimo ciclo, com boa consist\u00eancia de rotina."
  }
];

const notices: StudentNoticeItem[] = [
  {
    id: "student-notice-1",
    title: "Presen\u00e7a aguardando confirma\u00e7\u00e3o",
    description: "Sua sess\u00e3o de mobilidade de ter\u00e7a-feira ainda depende da sua confirma\u00e7\u00e3o.",
    details:
      "Confirme sua presen\u00e7a para manter o hor\u00e1rio reservado. Caso precise ajustar a agenda, solicite o reagendamento com anteced\u00eancia para facilitar a reorganiza\u00e7\u00e3o do planejamento.",
    createdAt: addDays(new Date(), -1),
    kind: "warning",
    category: "Confirma\u00e7\u00e3o pendente",
    priority: "high",
    isRead: false,
    relatedHref: "/student/agenda",
    relatedLabel: "Ir para minha agenda"
  },
  {
    id: "student-notice-2",
    title: "Solicita\u00e7\u00e3o de reagendamento registrada",
    description: "Seu pedido de mudan\u00e7a de hor\u00e1rio foi enviado e est\u00e1 aguardando valida\u00e7\u00e3o do personal.",
    details:
      "Assim que houver retorno com novo hor\u00e1rio ou orienta\u00e7\u00e3o adicional, este aviso ser\u00e1 atualizado. At\u00e9 l\u00e1, mantenha seu hor\u00e1rio original em observa\u00e7\u00e3o para evitar desencontros.",
    createdAt: addDays(new Date(), -2),
    kind: "info",
    category: "Solicita\u00e7\u00e3o pendente",
    priority: "medium",
    isRead: false,
    relatedHref: "/student/agenda",
    relatedLabel: "Acompanhar solicita\u00e7\u00e3o"
  },
  {
    id: "student-notice-3",
    title: "Ajuste no hor\u00e1rio do pr\u00f3ximo treino",
    description: "O treino de for\u00e7a foi antecipado em 15 minutos para melhorar a organiza\u00e7\u00e3o do atendimento.",
    details:
      "Seu atendimento presencial acontecer\u00e1 \u00e0s 06h45 no Studio Fitnexis. Se esse ajuste impactar sua rotina, utilize a op\u00e7\u00e3o de solicita\u00e7\u00e3o na agenda para conversar com o personal antes da sess\u00e3o.",
    createdAt: addDays(new Date(), -3),
    kind: "warning",
    category: "Altera\u00e7\u00e3o de hor\u00e1rio",
    priority: "high",
    isRead: true,
    relatedHref: "/student/agenda",
    relatedLabel: "Ver sess\u00e3o atualizada"
  },
  {
    id: "student-notice-4",
    title: "Nova observa\u00e7\u00e3o no seu acompanhamento",
    description: "Seu personal registrou um coment\u00e1rio sobre sua evolu\u00e7\u00e3o recente no bloco atual.",
    details:
      "A observa\u00e7\u00e3o destaca boa consist\u00eancia nas cargas e melhor resposta ao volume de treino das \u00faltimas semanas. Voc\u00ea pode revisar esse contexto na \u00e1rea de evolu\u00e7\u00e3o.",
    createdAt: addDays(new Date(), -4),
    kind: "success",
    category: "Comunicado do personal",
    priority: "medium",
    isRead: true,
    relatedHref: "/student/progress",
    relatedLabel: "Ver evolu\u00e7\u00e3o"
  },
  {
    id: "student-notice-5",
    title: "Lembrete do pr\u00f3ximo atendimento",
    description: "Leve sua garrafa e chegue alguns minutos antes para o aquecimento orientado.",
    details:
      "Esse lembrete ajuda a manter o fluxo da sess\u00e3o e garantir que o tempo seja aproveitado com mais qualidade. Caso o formato mude para online, voc\u00ea ser\u00e1 avisado por aqui.",
    createdAt: addDays(new Date(), -5),
    kind: "info",
    category: "Lembrete de sess\u00e3o",
    priority: "low",
    isRead: false,
    relatedHref: "/student/agenda",
    relatedLabel: "Preparar sess\u00e3o"
  },
  {
    id: "student-notice-6",
    title: "Atualiza\u00e7\u00e3o importante da plataforma",
    description: "O Fitnexis est\u00e1 organizando seus avisos e confirma\u00e7\u00f5es em um fluxo mais claro para o seu acompanhamento.",
    details:
      "A proposta \u00e9 reduzir depend\u00eancia de mensagens externas e centralizar as comunica\u00e7\u00f5es mais relevantes dentro do seu painel, com hist\u00f3rico simples e a\u00e7\u00f5es r\u00e1pidas.",
    createdAt: addDays(new Date(), -6),
    kind: "info",
    category: "Aviso do sistema",
    priority: "low",
    isRead: true
  }
];

export const StudentPortalService = {
  getDashboardOverview() {
    const nextSession = upcomingAppointments.find((item) =>
      ["Agendado", "Confirmado", "Pendente", "Reagendamento solicitado"].includes(item.status)
    ) ?? upcomingAppointments[0];

    return {
      greetingMessage:
        "Seu acompanhamento est\u00e1 organizado para que voc\u00ea visualize agenda, avisos e evolu\u00e7\u00e3o com clareza.",
      nextSession,
      weeklySummary: [
        { id: "scheduled", label: "Sess\u00f5es agendadas", value: "3", description: "Compromissos previstos para sua semana atual." },
        { id: "completed", label: "Sess\u00f5es conclu\u00eddas", value: "2", description: "Treinos finalizados com registro recente." },
        { id: "pending", label: "Pend\u00eancias de confirma\u00e7\u00e3o", value: "1", description: "H\u00e1 um atendimento aguardando sua confirma\u00e7\u00e3o." },
        { id: "alerts", label: "Avisos importantes", value: "2", description: "Atualiza\u00e7\u00f5es que merecem sua aten\u00e7\u00e3o hoje." }
      ] satisfies StudentDashboardStat[],
      quickActions: [
        { id: "confirm-presence", label: "Confirmar presen\u00e7a", description: "Valide sua pr\u00f3xima sess\u00e3o diretamente pela agenda.", href: "/student/agenda" },
        { id: "full-agenda", label: "Ver agenda completa", description: "Acesse seus pr\u00f3ximos hor\u00e1rios e hist\u00f3rico de sess\u00f5es.", href: "/student/agenda" },
        { id: "reschedule", label: "Solicitar reagendamento", description: "Consulte os avisos e alinhe mudan\u00e7as com anteced\u00eancia.", href: "/student/notices" },
        { id: "profile", label: "Acessar perfil", description: "Revise seus dados e foco atual de acompanhamento.", href: "/student/profile" }
      ] satisfies StudentQuickAction[],
      notices: notices.slice(0, 3),
      progressSummary: [
        { id: "month-sessions", label: "Sess\u00f5es no m\u00eas", value: "8", description: "Treinos realizados ou confirmados no ciclo atual." },
        { id: "attendance", label: "Frequ\u00eancia", value: "92%", description: "Regularidade m\u00e9dia de presen\u00e7a nas \u00faltimas semanas." },
        { id: "evolution", label: "Indicador de evolu\u00e7\u00e3o", value: "Consistente", description: "Seu acompanhamento mostra progresso cont\u00ednuo no per\u00edodo." }
      ] satisfies StudentDashboardStat[],
      activePlan: "Acompanhamento Premium",
      nextSessionLabel: format(nextSession.startsAt, "EEEE, dd 'de' MMMM", { locale: ptBR }),
      weeklySessions: 3,
      completedSessions: 18,
      lastUpdateLabel: format(progressItems[progressItems.length - 1].recordedAt, "dd/MM/yyyy", { locale: ptBR }),
      upcomingAppointments,
      noticesPreview: notices.slice(0, 2)
    };
  },

  getAgenda(status?: StudentAppointmentStatus | "Todos") {
    if (!status || status === "Todos") {
      return upcomingAppointments;
    }

    return upcomingAppointments.filter((appointment) => appointment.status === status);
  },

  getAgendaById(id: string) {
    return upcomingAppointments.find((appointment) => appointment.id === id) ?? null;
  },

  getAgendaStatusOptions() {
    return ["Todos", ...studentAgendaStatuses] as const;
  },

  getHistory(filters?: {
    period?: StudentHistoryPeriod;
    attendance?: StudentHistoryAttendanceFilter;
  }) {
    const now = new Date();

    return historyItems.filter((item) => {
      const periodMatches =
        !filters?.period ||
        filters.period === "all" ||
        (filters.period === "30d" && item.date >= subDays(now, 30)) ||
        (filters.period === "90d" && item.date >= subDays(now, 90));

      const attendanceMatches =
        !filters?.attendance ||
        filters.attendance === "all" ||
        (filters.attendance === "present" && item.attendance !== "Ausente justificado") ||
        (filters.attendance === "absent" && item.attendance === "Ausente justificado");

      return periodMatches && attendanceMatches;
    });
  },

  getHistoryFilterOptions() {
    return {
      period: [
        { value: "all", label: "Todo o hist\u00f3rico" },
        { value: "30d", label: "\u00daltimos 30 dias" },
        { value: "90d", label: "\u00daltimos 90 dias" }
      ] as const,
      attendance: [
        { value: "all", label: "Todas as presen\u00e7as" },
        { value: "present", label: "Sess\u00f5es com presen\u00e7a" },
        { value: "absent", label: "Aus\u00eancias registradas" }
      ] as const
    };
  },

  getProgress() {
    return progressItems;
  },

  getProgressOverview() {
    return {
      metrics: [
        { id: "sessions-month", label: "Sess\u00f5es realizadas no m\u00eas", value: "8", description: "Treinos registrados no ciclo atual com acompanhamento ativo." },
        { id: "weekly-frequency", label: "Frequ\u00eancia semanal", value: "3x por semana", description: "M\u00e9dia recente de comparecimento nas \u00faltimas semanas." },
        { id: "comparison", label: "Comparativo recente", value: "+1 sess\u00e3o", description: "Em rela\u00e7\u00e3o ao per\u00edodo anterior, sua rotina ganhou mais const\u00e2ncia." }
      ] satisfies StudentProgressMetric[],
      trend: [
        { id: "week-1", label: "Sem 1", value: 55 },
        { id: "week-2", label: "Sem 2", value: 68 },
        { id: "week-3", label: "Sem 3", value: 74 },
        { id: "week-4", label: "Sem 4", value: 82 }
      ] satisfies StudentProgressTrendPoint[],
      highlights: [
        "Sua frequ\u00eancia est\u00e1 est\u00e1vel e acima do ciclo anterior.",
        "As sess\u00f5es recentes mostram boa continuidade no plano atual.",
        "O acompanhamento segue com registros suficientes para an\u00e1lises mais detalhadas no futuro."
      ],
      notes: [
        "Seu personal registrou evolu\u00e7\u00e3o consistente nas \u00faltimas semanas.",
        "A tend\u00eancia do per\u00edodo indica rotina mais previs\u00edvel e melhor ader\u00eancia ao planejamento."
      ],
      records: progressItems
    };
  },

  getNotices(filter: StudentNoticeFilter = "all") {
    if (filter === "unread") {
      return notices.filter((notice) => !notice.isRead);
    }

    if (filter === "high-priority") {
      return notices.filter((notice) => notice.priority === "high");
    }

    return notices;
  },

  getNoticeFilterOptions() {
    return [
      { value: "all", label: "Todos os avisos" },
      { value: "unread", label: "N\u00e3o lidos" },
      { value: "high-priority", label: "Prioridade alta" }
    ] as const;
  },

  getProfile(user: { name: string; email: string }) {
    return {
      editableProfile: {
        name: user.name,
        email: user.email,
        phone: "(11) 98888-1122",
        birthDate: "1996-08-14",
        goal: "Ganhar for\u00e7a com consist\u00eancia e melhorar condicionamento geral.",
        photoUrl: "",
        emergencyContact: "Marina Souza - (11) 97777-3344",
        personalNotes: "Prefiro treinos pela manh\u00e3 e tenho melhor rendimento em sess\u00f5es presenciais."
      },
      accountSummary: {
        memberSince: format(addDays(new Date(), -120), "dd/MM/yyyy", { locale: ptBR }),
        accountStatus: "Conta ativa",
        coach: "Fabio Trainer",
        plan: "Acompanhamento Premium",
        nextCheckIn: format(addDays(new Date(), 7), "dd/MM/yyyy", { locale: ptBR })
      }
    };
  }
};
