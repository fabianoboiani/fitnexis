"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentStudent } from "@/lib/student";
import {
  AppointmentService,
  StudentAppointmentActionError
} from "@/modules/appointments/services/appointment.service";
import { StudentNoticeService } from "@/modules/student/notices/services/student-notice.service";

type StudentAppointmentActionResult = {
  success: boolean;
  message: string;
};

function handleError(error: unknown): StudentAppointmentActionResult {
  if (error instanceof StudentAppointmentActionError) {
    return {
      success: false,
      message: error.message
    };
  }

  throw error;
}

function revalidateAppointmentViews() {
  revalidatePath("/student");
  revalidatePath("/student/agenda");
  revalidatePath("/student/history");
  revalidatePath("/student/notices");
  revalidatePath("/appointments");
  revalidatePath("/dashboard");
}

export async function confirmStudentAppointmentAction(
  appointmentId: string
): Promise<StudentAppointmentActionResult> {
  const student = await requireCurrentStudent();

  try {
    await AppointmentService.confirmAttendanceByStudent(student.id, appointmentId);
    await StudentNoticeService.syncAppointmentNoticeById(appointmentId);
  } catch (error) {
    return handleError(error);
  }

  revalidateAppointmentViews();

  return {
    success: true,
    message: "Presença confirmada. Seu personal já consegue ver essa resposta."
  };
}

export async function requestStudentAppointmentRescheduleAction(
  appointmentId: string
): Promise<StudentAppointmentActionResult> {
  const student = await requireCurrentStudent();

  try {
    await AppointmentService.requestRescheduleByStudent(student.id, appointmentId);
    await StudentNoticeService.syncAppointmentNoticeById(appointmentId);
  } catch (error) {
    return handleError(error);
  }

  revalidateAppointmentViews();

  return {
    success: true,
    message: "Solicitação de reagendamento enviada para análise do personal."
  };
}

export async function requestStudentAppointmentCancellationAction(
  appointmentId: string
): Promise<StudentAppointmentActionResult> {
  const student = await requireCurrentStudent();

  try {
    await AppointmentService.requestCancellationByStudent(student.id, appointmentId);
    await StudentNoticeService.syncAppointmentNoticeById(appointmentId);
  } catch (error) {
    return handleError(error);
  }

  revalidateAppointmentViews();

  return {
    success: true,
    message: "Solicitação de cancelamento registrada para o personal."
  };
}


