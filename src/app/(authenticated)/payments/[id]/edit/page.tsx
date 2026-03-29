import { PageHeader } from "@/components/shared/page-header";
import { PaymentForm } from "@/components/shared/payment-form";
import { requireTenant } from "@/lib/tenant";
import { updatePaymentAction } from "@/modules/payments/actions/payment.action";
import { PaymentService } from "@/modules/payments/services/payment.service";
import { StudentService } from "@/modules/students/services/student.service";

type EditPaymentPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPaymentPage({ params }: EditPaymentPageProps) {
  const tenant = await requireTenant();
  const { id } = await params;
  const [payment, students] = await Promise.all([
    PaymentService.getByIdOrThrow(tenant.id, id),
    StudentService.listByTenant(tenant.id)
  ]);
  const boundUpdateAction = updatePaymentAction.bind(null, payment.id);

  return (
    <main className="space-y-8 px-6 py-8">
      <PageHeader
        title="Editar pagamento"
        description="Atualize os dados do pagamento mantendo o isolamento por tenant."
      />
      <PaymentForm
        title="Edição de pagamento"
        description="Somente alunos do tenant autenticado podem ser vinculados a este pagamento."
        submitLabel="Salvar alterações"
        initialValues={PaymentService.getFormValues(payment)}
        studentOptions={students.map((student) => ({
          id: student.id,
          name: student.name
        }))}
        onSubmitAction={boundUpdateAction}
      />
    </main>
  );
}
