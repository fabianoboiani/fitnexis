import { PageHeader } from "@/components/shared/page-header";
import { StudentProfileForm } from "@/components/shared/student-profile-form";
import { requireCurrentStudent } from "@/lib/student";
import {
  changeStudentPasswordAction,
  updateStudentProfileAction
} from "@/modules/student/actions/student-profile.action";
import { StudentPortalService } from "@/modules/student/services/student-portal.service";

export default async function StudentProfilePage() {
  const student = await requireCurrentStudent();
  const profile = await StudentPortalService.getProfile(student.id);

  return (
    <main className="min-w-0 space-y-8 px-6 py-8">
      <PageHeader
        title="Perfil"
        description="Consulte seus dados, mantenha informações pessoais atualizadas e acompanhe o contexto da sua conta."
      />

      <StudentProfileForm
        initialProfile={profile.editableProfile}
        account={profile.accountSummary}
        onSubmitProfileAction={updateStudentProfileAction}
        onSubmitPasswordAction={changeStudentPasswordAction}
      />
    </main>
  );
}
