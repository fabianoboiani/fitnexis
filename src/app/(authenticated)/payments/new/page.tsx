import { PageHeader } from "@/components/shared/page-header";
import { PaymentForm } from "@/components/shared/payment-form";
import { createPaymentAction } from "@/modules/payments/actions/payment.action";
import { PaymentService } from "@/modules/payments/services/payment.service";
import { requireTenant } from "@/lib/tenant";
import { StudentService } from "@/modules/students/services/student.service";

export default async function NewPaymentPage() {
  const tenant = await requireTenant();
  const students = await StudentService.listByTenant(tenant.id);

  return (
    <main className="space-y-8 px-6 py-8">
      <PageHeader
        title="Novo pagamento"
        description="Cadastre um pagamento manualmente para um aluno do tenant atual."
      />
      <PaymentForm
        title="Cadastro de pagamento"
        description="Selecione um aluno do tenant autenticado e informe os dados do pagamento."
        submitLabel="Cadastrar pagamento"
        initialValues={PaymentService.getFormValues()}
        studentOptions={students.map((student) => ({
          id: student.id,
          name: student.name
        }))}
        onSubmitAction={createPaymentAction}
      />
    </main>
  );
}
