import { endOfMonth, format, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentStatus, PaymentStatus, StudentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

type DashboardOverviewInput = {
  tenantId: string;
};

export type DashboardOverview = {
  activeStudentsCount: number;
  pendingPaymentsCount: number;
  receivedAmountThisMonth: number;
  upcomingAppointments: Array<{
    id: string;
    title: string;
    studentName: string;
    startsAt: Date;
    endsAt: Date;
    startsAtLabel: string;
  }>;
};

export const DashboardSummaryService = {
  async getOverview({ tenantId }: DashboardOverviewInput): Promise<DashboardOverview> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const [activeStudentsCount, pendingPaymentsCount, receivedAmountThisMonth, upcomingAppointments] =
      await Promise.all([
        prisma.student.count({
          where: {
            tenantId,
            status: StudentStatus.ACTIVE
          }
        }),
        prisma.payment.count({
          where: {
            tenantId,
            status: PaymentStatus.PENDING
          }
        }),
        prisma.payment.aggregate({
          where: {
            tenantId,
            status: PaymentStatus.PAID,
            paidAt: {
              gte: monthStart,
              lte: monthEnd
            }
          },
          _sum: {
            amount: true
          }
        }),
        prisma.appointment.findMany({
          where: {
            tenantId,
            status: AppointmentStatus.SCHEDULED,
            startsAt: {
              gte: now
            }
          },
          orderBy: {
            startsAt: "asc"
          },
          take: 5,
          select: {
            id: true,
            title: true,
            startsAt: true,
            endsAt: true,
            student: {
              select: {
                name: true
              }
            }
          }
        })
      ]);

    return {
      activeStudentsCount,
      pendingPaymentsCount,
      receivedAmountThisMonth: Number(receivedAmountThisMonth._sum.amount ?? 0),
      upcomingAppointments: upcomingAppointments.map((appointment) => ({
        id: appointment.id,
        title: appointment.title,
        studentName: appointment.student.name,
        startsAt: appointment.startsAt,
        endsAt: appointment.endsAt,
        startsAtLabel: format(appointment.startsAt, "dd 'de' MMMM 'às' HH:mm", {
          locale: ptBR
        })
      }))
    };
  }
};
