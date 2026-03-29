"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  Loader2,
  MapPin,
  RotateCcw,
  XCircle
} from "lucide-react";
import type {
  StudentAppointmentStatus,
  StudentUpcomingAppointment
} from "@/modules/student/services/student-portal.service";
import {
  confirmStudentAppointmentAction,
  requestStudentAppointmentCancellationAction,
  requestStudentAppointmentRescheduleAction
} from "@/modules/student/actions/student-appointment.action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getStatusVariant(status: StudentAppointmentStatus) {
  if (status === "Confirmado") return "default" as const;
  if (status === "Pendente" || status === "Agendado") return "secondary" as const;
  return "outline" as const;
}

function getStatusHelper(status: StudentAppointmentStatus) {
  if (status === "Reagendamento solicitado") {
    return "Seu pedido foi registrado e depende da aprovação do personal.";
  }

  if (status === "Cancelado") {
    return "Sessão cancelada ou com solicitação de cancelamento registrada. Em caso de necessidade, alinhe um novo horário com o personal.";
  }

  if (status === "Concluído") {
    return "Sessão já finalizada e registrada no seu histórico.";
  }

  if (status === "Confirmado") {
    return "Sua presença já foi confirmada e o personal consegue visualizar essa resposta.";
  }

  return "Essa sessão está aguardando sua confirmação ou uma nova interação com o personal responsável.";
}

type StudentAgendaItemCardProps = {
  appointment: StudentUpcomingAppointment;
};

export function StudentAgendaItemCard({ appointment }: StudentAgendaItemCardProps) {
  const [status, setStatus] = useState<StudentAppointmentStatus>(appointment.status);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const actionState = useMemo(() => {
    const isFinal = status === "Cancelado" || status === "Concluído";

    return {
      canConfirm: !isFinal && status !== "Confirmado" && status !== "Reagendamento solicitado",
      canReschedule: !isFinal && status !== "Reagendamento solicitado",
      canCancel: !isFinal
    };
  }, [status]);

  function handleAction(
    nextStatus: StudentAppointmentStatus,
    action: (appointmentId: string) => Promise<{ success: boolean; message: string }>,
    openDetails = false
  ) {
    setFeedbackMessage(null);

    startTransition(async () => {
      const result = await action(appointment.id);

      if (!result.success) {
        setFeedbackMessage(result.message);
        return;
      }

      setStatus(nextStatus);
      setFeedbackMessage(result.message);
      if (openDetails) {
        setDetailsOpen(true);
      }
    });
  }

  return (
    <Card className="border-white/70 bg-white/90 shadow-sm">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl text-slate-950">{appointment.title}</CardTitle>
              <Badge variant={getStatusVariant(status)}>{status}</Badge>
            </div>
            <p className="text-sm text-slate-600">Com {appointment.coach}</p>
          </div>
          <div className="text-sm text-slate-600">
            {format(appointment.startsAt, "dd/MM/yyyy", { locale: ptBR })}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <CalendarDays className="size-4 text-primary" />
              <span>Data</span>
            </div>
            <p className="mt-2 font-semibold text-slate-950">
              {format(appointment.startsAt, "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Clock3 className="size-4 text-primary" />
              <span>Horário</span>
            </div>
            <p className="mt-2 font-semibold text-slate-950">
              {format(appointment.startsAt, "HH:mm", { locale: ptBR })} - {format(appointment.endsAt, "HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 px-4 py-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <MapPin className="size-4 text-primary" />
              <span>Local ou formato</span>
            </div>
            <p className="mt-2 font-semibold text-slate-950">{appointment.location}</p>
            <p className="mt-1 text-xs text-slate-500">{appointment.format}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 px-4 py-4">
            <p className="text-sm font-medium text-slate-500">Observações</p>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">
              {appointment.notes ?? "Sem observações adicionais para esta sessão."}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4">
          <p className="text-sm font-medium text-slate-950">Condição da sessão</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{getStatusHelper(status)}</p>
          {feedbackMessage ? <p className="mt-3 text-sm font-medium text-primary">{feedbackMessage}</p> : null}
        </div>

        {detailsOpen ? (
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl border border-slate-200 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">Instruções prévias</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {appointment.preparationInstructions ?? "Nenhuma instrução específica foi adicionada para este compromisso."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-4">
              <p className="text-sm font-medium text-slate-500">Histórico resumido</p>
              <div className="mt-3 space-y-3">
                {appointment.history.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant={item.status === "Criado" ? "outline" : getStatusVariant(item.status)}>
                        {item.status}
                      </Badge>
                      <p className="text-xs text-slate-500">
                        {format(item.occurredAt, "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" onClick={() => setDetailsOpen((current) => !current)}>
            {detailsOpen ? (
              <>
                <ChevronUp className="mr-2 size-4" />
                Ocultar detalhes
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 size-4" />
                Ver mais
              </>
            )}
          </Button>
          <Button
            type="button"
            disabled={!actionState.canConfirm || isPending}
            onClick={() => handleAction("Confirmado", confirmStudentAppointmentAction)}
          >
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Confirmar presença
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!actionState.canReschedule || isPending}
            onClick={() => handleAction("Reagendamento solicitado", requestStudentAppointmentRescheduleAction, true)}
          >
            <RotateCcw className="mr-2 size-4" />
            Solicitar reagendamento
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!actionState.canCancel || isPending}
            onClick={() => handleAction("Cancelado", requestStudentAppointmentCancellationAction, true)}
          >
            <XCircle className="mr-2 size-4" />
            Cancelar sessão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}