"use client";

import Link from "next/link";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bell, Check, CheckCheck, ChevronDown, ChevronUp, Info, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StudentNoticeItem } from "@/modules/student/services/student-portal.service";

function getNoticeIcon(kind: StudentNoticeItem["kind"]) {
  if (kind === "success") return CheckCheck;
  if (kind === "warning") return TriangleAlert;
  return Bell;
}

function getPriorityLabel(priority: StudentNoticeItem["priority"]) {
  if (priority === "high") return "Alta prioridade";
  if (priority === "medium") return "Prioridade moderada";
  return "Prioridade informativa";
}

function getPriorityClasses(priority: StudentNoticeItem["priority"]) {
  if (priority === "high") return "border-rose-200 bg-rose-50 text-rose-700";
  if (priority === "medium") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-100 text-slate-600";
}

export function StudentNoticeCard({ notice }: { notice: StudentNoticeItem }) {
  const [isRead, setIsRead] = useState(notice.isRead);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const Icon = getNoticeIcon(notice.kind);

  return (
    <Card
      className={cn(
        "border-white/70 bg-white/95 shadow-sm transition-all duration-200",
        !isRead && "border-blue-200/80 shadow-[0_18px_45px_-30px_rgba(37,99,235,0.55)]"
      )}
    >
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-4">
          <div
            className={cn(
              "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl border",
              !isRead ? "border-blue-100 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-100 text-slate-600"
            )}
          >
            <Icon className="size-5" />
          </div>

          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-slate-200 bg-white text-slate-600">
                {notice.category}
              </Badge>
              <Badge variant="outline" className={getPriorityClasses(notice.priority)}>
                {getPriorityLabel(notice.priority)}
              </Badge>
              {!isRead ? (
                <Badge className="bg-blue-600 text-white hover:bg-blue-600">Não lido</Badge>
              ) : (
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                  Lido
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <CardTitle className="text-xl text-slate-950">{notice.title}</CardTitle>
              <p className="text-sm leading-7 text-slate-600">{notice.description}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-500 sm:text-right">
          <p>{formatDistanceToNow(notice.createdAt, { addSuffix: true, locale: ptBR })}</p>
          <p>{format(notice.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {detailsOpen ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-7 text-slate-600">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900">
              <Info className="size-4 text-blue-600" />
              Detalhes do aviso
            </div>
            <p>{notice.details}</p>
            {notice.relatedHref ? (
              <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-3 text-sm text-slate-600">
                Se este aviso estiver ligado a uma sessão ou área específica, você pode seguir pelo atalho abaixo.
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={isRead ? "outline" : "default"}
            className={cn(isRead && "border-slate-200 bg-white")}
            onClick={() => setIsRead(true)}
            disabled={isRead}
          >
            {isRead ? <CheckCheck className="mr-2 size-4" /> : <Check className="mr-2 size-4" />}
            {isRead ? "Marcado como lido" : "Marcar como lido"}
          </Button>

          <Button type="button" variant="outline" className="border-slate-200 bg-white" onClick={() => setDetailsOpen((value) => !value)}>
            {detailsOpen ? <ChevronUp className="mr-2 size-4" /> : <ChevronDown className="mr-2 size-4" />}
            {detailsOpen ? "Ocultar detalhes" : "Visualizar detalhes"}
          </Button>

          {notice.relatedHref ? (
            <Button asChild variant="ghost" className="text-blue-700 hover:bg-blue-50 hover:text-blue-800">
              <Link href={notice.relatedHref}>{notice.relatedLabel ?? "Abrir item relacionado"}</Link>
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}