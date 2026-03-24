import { PageHeader } from "@/components/shared/page-header";
import { StudentProfileForm } from "@/components/shared/student-profile-form";
import { requireStudent } from "@/lib/auth-helpers";
import { StudentPortalService } from "@/modules/student/services/student-portal.service";

export default async function StudentProfilePage() {
  const student = await requireStudent();
  const profile = StudentPortalService.getProfile(student);

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Perfil"
        description="Consulte seus dados, mantenha informações pessoais atualizadas e acompanhe o contexto da sua conta."
      />

      <StudentProfileForm initialProfile={profile.editableProfile} account={profile.accountSummary} />
    </main>
  );
}