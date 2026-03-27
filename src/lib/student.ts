import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth-helpers";
import { StudentRepository } from "@/modules/students/repositories/student.repository";

export async function getCurrentStudentProfile() {
  const user = await requireStudent();

  if (user.studentId && user.tenantId) {
    const student = await StudentRepository.findByIdAndTenant(user.studentId, user.tenantId);

    if (student) {
      return student;
    }
  }

  return StudentRepository.findByUserId(user.id);
}

export async function requireCurrentStudentProfile() {
  const student = await getCurrentStudentProfile();

  if (!student) {
    redirect("/student");
  }

  return student;
}