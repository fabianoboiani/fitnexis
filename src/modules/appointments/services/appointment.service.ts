import { notFound } from "next/navigation";
import { AppointmentStatus } from "@prisma/client";
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
      notes: appointment.notes
    };
  },

  async create(tenantId: string, input: CreateAppointmentInput) {
    const parsed = AppointmentFormSchema.parse(input);
    const student = await StudentService.getById(tenantId, parsed.studentId);

    if (!student) {
      throw new Error("O aluno informado n?o pertence ao tenant atual.");
    }

    return AppointmentRepository.create({
      tenantId,
      studentId: parsed.studentId,
      title: parsed.title,
      startsAt: parseDateTime(parsed.startsAt),
      endsAt: parseDateTime(parsed.endsAt),
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
      throw new Error("O aluno informado n?o pertence ao tenant atual.");
    }

    await AppointmentRepository.updateByIdAndTenant(id, tenantId, {
      studentId: parsed.studentId,
      title: parsed.title,
      startsAt: parseDateTime(parsed.startsAt),
      endsAt: parseDateTime(parsed.endsAt),
      status: parsed.status,
      notes: parsed.notes ?? null
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
      notes: appointment.notes ?? null
    });
  },

  getFormValues(appointment?: AppointmentDetailsDto) {
    return mapFormValues(appointment);
  }
};
