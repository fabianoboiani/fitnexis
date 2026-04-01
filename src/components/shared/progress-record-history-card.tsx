import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { ProgressRecordListItemDto } from "@/modules/progress/dto/progress-record.dto";

type ProgressRecordHistoryCardProps = {
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  records: ProgressRecordListItemDto[];
};

export function ProgressRecordHistoryCard({
  title = "Histórico",
  emptyTitle = "Nenhuma evolução registrada",
  emptyDescription = "Os registros deste aluno aparecerão aqui conforme forem cadastrados.",
  records
}: ProgressRecordHistoryCardProps) {
  return (
    <Card className="border-white/70 bg-white/90 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <p className="font-medium text-slate-950">
                    {format(record.recordedAt, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <span>Peso: {record.weight ? `${record.weight} kg` : "Não informado"}</span>
                    <span>
                      Gordura: {record.bodyFat ? `${record.bodyFat}%` : "Não informada"}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  {record.notes ?? "Sem observações neste registro."}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}