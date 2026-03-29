import { redirect } from "next/navigation";
import { requireStudent } from "@/lib/auth-helpers";
import { StudentRepository } from "@/modules/students/repositories/student.repository";

export async function getCurrentStudent() {
  const user = await requireStudent();

  let student = null;

  if (user.studentId && user.tenantId) {
    student = await StudentRepository.findByIdAndTenant(user.studentId, user.tenantId);
  }

  if (!student) {
    const studentByUser = await StudentRepository.findByUserId(user.id);

    if (studentByUser && (!user.tenantId || studentByUser.tenantId === user.tenantId)) {
      student = studentByUser;
    }
  }

  if (!student || !student.portalAccessEnabled) {
    return null;
  }

  return student;
}

export async function requireCurrentStudent() {
  const student = await getCurrentStudent();

  if (!student) {
    redirect("/no-tenant");
  }

  return student;
}

export const getCurrentStudentProfile = getCurrentStudent;
export const requireCurrentStudentProfile = requireCurrentStudent;