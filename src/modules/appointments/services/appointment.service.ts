import { notFound } from "next/navigation";
import { AppointmentStatus, StudentAppointmentResponseStatus } from "@prisma/client";
import type {
  AppointmentDetailsDto,
  AppointmentFormValuesDto,
  AppointmentListItemDto
} from "@/modules/appointments/dto/appointment.dto";
import { AppointmentRepository } from "@/modules/appointments/repositories/appointment.repository";
import {
  AppointmentFormSchema,
  type CreateAppointmentInput,
  type UpdateAppointmentInput
} from "@/modules/appointments/schemas/appointment.schema";
import { StudentService } from "@/modules/students/services/student.service";

function parseDateTime(value: string) {
  return new Date(value);
}

function toDateTimeLocalValue(date: Date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function mapFormValues(appointment?: AppointmentDetailsDto): AppointmentFormValuesDto {
  if (!appointment) {
    return {
      studentId: "",
      title: "",
      startsAt: "",
      endsAt: "",
      notes: "",
      status: AppointmentStatus.SCHEDULED
    };
  }

  return {
    studentId: appointment.studentId,
    title: appointment.title,
    startsAt: toDateTimeLocalValue(appointment.startsAt),
    endsAt: toDateTimeLocalValue(appointment.endsAt),
    notes: appointment.notes ?? "",
    status: appointment.status
  };
}

function sortUpcomingFirst(appointments: AppointmentListItemDto[]) {
  const now = new Date().getTime();

  return [...appointments].sort((a, b) => {
    const aUpcoming = a.startsAt.getTime() >= now ? 0 : 1;
    const bUpcoming = b.startsAt.getTime() >= now ? 0 : 1;

    if (aUpcoming !== bUpcoming) {
      return aUpcoming - bUpcoming;
    }

    return a.startsAt.getTime() - b.startsAt.getTime();
  });
}

async function ensureNoScheduleConflict(
  tenantId: string,
  startsAt: Date,
  endsAt: Date,
  excludeId?: string
) {
  const conflictingAppointment = await AppointmentRepository.findOverlappingByTenant(
    tenantId,
    startsAt,
    endsAt,
    excludeId
  );

  if (!conflictingAppointment) {
    return;
  }

  const conflictStart = conflictingAppointment.startsAt.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
  const conflictEnd = conflictingAppointment.endsAt.toLocaleString("pt-BR", {
    timeStyle: "short"
  });

  throw new Error(
    `Já existe um compromisso agendado entre ${conflictStart} e ${conflictEnd} para ${conflictingAppointment.student.name}.`
  );
}

export class StudentAppointmentActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentAppointmentActionError";
  }
}

export const AppointmentService = {
  async listByTenant(
    tenantId: string,
    filters?: {
      status?: AppointmentStatus;
    }
  ): Promise<AppointmentListItemDto[]> {
    const appointments = await AppointmentRepository.findManyByTenant(tenantId, filters);

    return sortUpcomingFirst(
      appointments.map((appointment) => ({
        id: appointment.id,
        studentId: appointment.studentId,
        studentName: appointment.student.name,
        title: appointment.title,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        status: appointment.status,
        studentResponseStatus: appointment.studentResponseStatus,
        studentRespondedAt: appointment.studentRespondedAt,
        studentResponseNote: appointment.studentResponseNote,
        notes: appointment.notes
      }))
    );
  },

  async getByIdOrThrow(tenantId: string, id: string): Promise<AppointmentDetailsDto> {
    const appointment = await AppointmentRepository.findByIdAndTenant(id, tenantId);

    if (!appointment) {
      notFound();
    }

    return {
      id: appointment.id,
      tenantId: appointment.tenantId,
      studentId: appointment.studentId,
      title: appointment.title,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      status: appointment.status,
      studentResponseStatus: appointment.studentResponseStatus,
      studentRespondedAt: appointment.studentRespondedAt,
      studentResponseNote: appointment.studentResponseNote,
      notes: appointment.notes
    };
  },

  async create(tenantId: string, input: CreateAppointmentInput) {
    const parsed = AppointmentFormSchema.parse(input);
    const student = await StudentService.getById(tenantId, parsed.studentId);

    if (!student) {
      throw new Error("O aluno informado não pertence ao tenant atual.");
    }

    const startsAt = parseDateTime(parsed.startsAt);
    const endsAt = parseDateTime(parsed.endsAt);

    await ensureNoScheduleConflict(tenantId, startsAt, endsAt);

    return AppointmentRepository.create({
      tenantId,
      studentId: parsed.studentId,
      title: parsed.title,
      startsAt,
      endsAt,
      status: parsed.status,
      notes: parsed.notes
    });
  },

  async update(tenantId: string, id: string, input: UpdateAppointmentInput) {
    const parsed = AppointmentFormSchema.parse(input);
    const existingAppointment = await AppointmentRepository.findByIdAndTenant(id, tenantId);

    if (!existingAppointment) {
      notFound();
    }

    const student = await StudentService.getById(tenantId, parsed.studentId);

    if (!student) {
      throw new Error("O aluno informado não pertence ao tenant atual.");
    }

    const startsAt = parseDateTime(parsed.startsAt);
    const endsAt = parseDateTime(parsed.endsAt);

    await ensureNoScheduleConflict(tenantId, startsAt, endsAt, id);

    await AppointmentRepository.updateByIdAndTenant(id, tenantId, {
      studentId: parsed.studentId,
      title: parsed.title,
      startsAt,
      endsAt,
      status: parsed.status,
      notes: parsed.notes ?? null,
      studentResponseStatus:
        parsed.status === AppointmentStatus.SCHEDULED
          ? StudentAppointmentResponseStatus.PENDING
          : existingAppointment.studentResponseStatus,
      studentRespondedAt: parsed.status === AppointmentStatus.SCHEDULED ? null : existingAppointment.studentRespondedAt,
      studentResponseNote: parsed.status === AppointmentStatus.SCHEDULED ? null : existingAppointment.studentResponseNote
    });

    return AppointmentRepository.findByIdAndTenant(id, tenantId);
  },

  async cancel(tenantId: string, id: string) {
    const appointment = await AppointmentRepository.findByIdAndTenant(id, tenantId);

    if (!appointment) {
      notFound();
    }

    await AppointmentRepository.updateByIdAndTenant(id, tenantId, {
      studentId: appointment.studentId,
      title: appointment.title,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      status: AppointmentStatus.CANCELED,
      notes: appointment.notes ?? null,
      studentResponseStatus: appointment.studentResponseStatus,
      studentRespondedAt: appointment.studentRespondedAt,
      studentResponseNote: appointment.studentResponseNote
    });
  },

  async confirmAttendanceByStudent(studentId: string, appointmentId: string) {
    const appointment = await AppointmentRepository.findByIdAndStudent(appointmentId, studentId);

    if (!appointment) {
      notFound();
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new StudentAppointmentActionError("Essa sessão não está disponível para confirmação.");
    }

    await AppointmentRepository.updateStudentResponseByIdAndStudent(appointmentId, studentId, {
      studentResponseStatus: StudentAppointmentResponseStatus.CONFIRMED,
      studentRespondedAt: new Date(),
      studentResponseNote: "Presença confirmada pelo aluno no portal."
    });
  },

  async requestRescheduleByStudent(studentId: string, appointmentId: string) {
    const appointment = await AppointmentRepository.findByIdAndStudent(appointmentId, studentId);

    if (!appointment) {
      notFound();
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new StudentAppointmentActionError("Essa sessão não aceita solicitação de reagendamento neste momento.");
    }

    await AppointmentRepository.updateStudentResponseByIdAndStudent(appointmentId, studentId, {
      studentResponseStatus: StudentAppointmentResponseStatus.RESCHEDULE_REQUESTED,
      studentRespondedAt: new Date(),
      studentResponseNote: "Aluno solicitou reagendamento pelo portal."
    });
  },

  async requestCancellationByStudent(studentId: string, appointmentId: string) {
    const appointment = await AppointmentRepository.findByIdAndStudent(appointmentId, studentId);

    if (!appointment) {
      notFound();
    }

    if (appointment.status !== AppointmentStatus.SCHEDULED) {
      throw new StudentAppointmentActionError("Essa sessão não aceita cancelamento neste momento.");
    }

    await AppointmentRepository.updateStudentResponseByIdAndStudent(appointmentId, studentId, {
      studentResponseStatus: StudentAppointmentResponseStatus.CANCELED,
      studentRespondedAt: new Date(),
      studentResponseNote: "Aluno solicitou cancelamento pelo portal."
    });
  },

  getFormValues(appointment?: AppointmentDetailsDto) {
    return mapFormValues(appointment);
  }
};