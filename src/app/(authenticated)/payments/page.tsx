import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus } from "lucide-react";
import { PaymentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { PaymentStatusBadge } from "@/components/shared/payment-status-badge";
import { requireTenant } from "@/lib/tenant";
import { markPaymentAsPaidNowAction } from "@/modules/payments/actions/payment.action";
import { PaymentService } from "@/modules/payments/services/payment.service";
import { StudentService } from "@/modules/students/services/student.service";

type PaymentsPageProps = {
  searchParams?: Promise<{
    status?: PaymentStatus | "OVERDUE";
    studentId?: string;
    success?: string;
  }>;
};

const successMessages: Record<string, string> = {
  created: "Pagamento cadastrado com sucesso.",
  updated: "Pagamento atualizado com sucesso.",
  paid: "Pagamento marcado como pago."
};

const statusFilterOptions: Array<{ value: string; label: string }> = [
  { value: "", label: "Todos os status" },
  { value: PaymentStatus.PENDING, label: "Pendente" },
  { value: PaymentStatus.PAID, label: "Pago" },
  { value: "OVERDUE", label: "Vencido" },
  { value: PaymentStatus.CANCELED, label: "Cancelado" }
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export default async function PaymentsPage({ searchParams }: PaymentsPageProps) {
  const tenant = await requireTenant();
  const params = searchParams ? await searchParams : undefined;
  const studentOptions = await StudentService.listByTenant(tenant.id);
  const payments = await PaymentService.listByTenant(tenant.id, {
    status: params?.status,
    studentId: params?.studentId
  });
  const successMessage = params?.success ? successMessages[params.success] : undefined;

  return (
    <main className="space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="Pagamentos"
          description="Controle manual dos pagamentos dos alunos do tenant autenticado."
        />
        <Button asChild>
          <Link href="/payments/new">
            <Plus className="size-4" />
            Novo pagamento
          </Link>
        </Button>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <Card className="border-white/70 bg-white/90 shadow-sm">
        <CardHeader className="gap-4">
          <CardTitle className="text-xl">Lista de pagamentos</CardTitle>
          <form className="grid gap-3 md:grid-cols-[1fr_1fr_auto] lg:max-w-3xl" method="get">
            <select
              name="status"
              defaultValue={params?.status ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {statusFilterOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              name="studentId"
              defaultValue={params?.studentId ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Todos os alunos</option>
              {studentOptions.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            <Button type="submit" variant="outline">
              Filtrar
            </Button>
          </form>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <EmptyState
              title="Nenhum pagamento encontrado"
              description="Cadastre pagamentos ou ajuste os filtros para visualizar resultados."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Aluno</th>
                    <th className="px-4 py-3 font-medium">Valor</th>
                    <th className="px-4 py-3 font-medium">Vencimento</th>
                    <th className="px-4 py-3 font-medium">Pagamento</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Forma</th>
                    <th className="px-4 py-3 font-medium text-right">A??es</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className={payment.isOverdue ? "bg-rose-50/70 text-rose-950" : "text-slate-700"}
                    >
                      <td className="px-4 py-4 font-medium">{payment.studentName}</td>
                      <td className="px-4 py-4">{formatCurrency(payment.amount)}</td>
                      <td className="px-4 py-4">
                        {format(payment.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-4">
                        {payment.paidAt
                          ? format(payment.paidAt, "dd/MM/yyyy", { locale: ptBR })
                          : "Ainda n?o pago"}
                      </td>
                      <td className="px-4 py-4">
                        <PaymentStatusBadge status={payment.displayStatus} />
                      </td>
                      <td className="px-4 py-4">{payment.paymentMethod ?? "N?o informado"}</td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {payment.displayStatus !== PaymentStatus.PAID ? (
                            <form action={markPaymentAsPaidNowAction.bind(null, payment.id)}>
                              <Button size="sm" type="submit" variant="outline">
                                Marcar como pago
                              </Button>
                            </form>
                          ) : null}
                          <Button asChild size="sm">
                            <Link href={`/payments/${payment.id}/edit`}>Editar</Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
