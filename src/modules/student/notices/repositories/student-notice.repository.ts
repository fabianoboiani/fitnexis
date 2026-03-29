import type { Prisma, PrismaClient, StudentNoticePriority } from "@prisma/client";
import { prisma } from "@/lib/db";

type DbClient = PrismaClient | Prisma.TransactionClient;

export const StudentNoticeRepository = {
  async findManyByStudent(
    studentId: string,
    filters?: {
      isRead?: boolean;
      priority?: StudentNoticePriority;
    }
  ) {
    return prisma.studentNotice.findMany({
      where: {
        studentId,
        ...(typeof filters?.isRead === "boolean" ? { isRead: filters.isRead } : {}),
        ...(filters?.priority ? { priority: filters.priority } : {})
      },
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }]
    });
  },

  async upsertByExternalKey(
    data: {
      externalKey: string;
      tenantId: string;
      studentId: string;
      kind: Prisma.StudentNoticeCreateInput["kind"];
      category: Prisma.StudentNoticeCreateInput["category"];
      title: string;
      description: string;
      details: string;
      priority: Prisma.StudentNoticeCreateInput["priority"];
      relatedEntityType?: Prisma.StudentNoticeCreateInput["relatedEntityType"];
      relatedEntityId?: string;
      createdAt?: Date;
    },
    db: DbClient = prisma
  ) {
    const {
      externalKey,
      tenantId,
      studentId,
      kind,
      category,
      title,
      description,
      details,
      priority,
      relatedEntityType,
      relatedEntityId,
      createdAt
    } = data;

    return db.studentNotice.upsert({
      where: { externalKey },
      update: {
        tenantId,
        studentId,
        kind,
        category,
        title,
        description,
        details,
        priority,
        relatedEntityType: relatedEntityType ?? null,
        relatedEntityId: relatedEntityId ?? null
      },
      create: {
        externalKey,
        tenantId,
        studentId,
        kind,
        category,
        title,
        description,
        details,
        priority,
        relatedEntityType: relatedEntityType ?? null,
        relatedEntityId: relatedEntityId ?? null,
        ...(createdAt ? { createdAt } : {})
      }
    });
  },

  async create(
    data: {
      externalKey: string;
      tenantId: string;
      studentId: string;
      kind: Prisma.StudentNoticeCreateInput["kind"];
      category: Prisma.StudentNoticeCreateInput["category"];
      title: string;
      description: string;
      details: string;
      priority: Prisma.StudentNoticeCreateInput["priority"];
      relatedEntityType?: Prisma.StudentNoticeCreateInput["relatedEntityType"];
      relatedEntityId?: string;
      createdAt?: Date;
    },
    db: DbClient = prisma
  ) {
    return db.studentNotice.create({
      data: {
        externalKey: data.externalKey,
        tenantId: data.tenantId,
        studentId: data.studentId,
        kind: data.kind,
        category: data.category,
        title: data.title,
        description: data.description,
        details: data.details,
        priority: data.priority,
        relatedEntityType: data.relatedEntityType ?? null,
        relatedEntityId: data.relatedEntityId ?? null,
        ...(data.createdAt ? { createdAt: data.createdAt } : {})
      }
    });
  },

  async deleteByExternalKey(externalKey: string, db: DbClient = prisma) {
    return db.studentNotice.deleteMany({
      where: { externalKey }
    });
  },

  async markAsRead(studentId: string, noticeId: string) {
    return prisma.studentNotice.updateMany({
      where: {
        id: noticeId,
        studentId
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });
  }
};