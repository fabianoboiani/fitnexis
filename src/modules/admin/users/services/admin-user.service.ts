import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";
import type { UpdateAdminUserInput } from "@/modules/admin/users/schemas/admin-user.schema";
import { AdminUserRepository } from "@/modules/admin/users/repositories/admin-user.repository";

export const AdminUserService = {
  async list(filters?: {
    name?: string;
    email?: string;
    role?: UpdateAdminUserInput["role"];
  }) {
    const users = await AdminUserRepository.findMany(filters);

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      tenantId: user.ownedTenant?.id ?? null,
      tenantName: user.ownedTenant?.businessName ?? null,
      tenantBusinessName: user.ownedTenant?.businessName ?? null
    }));
  },

  async getByIdOrThrow(id: string) {
    const user = await AdminUserRepository.findById(id);

    if (!user) {
      notFound();
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      tenant: user.ownedTenant
        ? {
            id: user.ownedTenant.id,
            businessName: user.ownedTenant.businessName,
            personalName: user.ownedTenant.personalName,
            email: user.ownedTenant.email,
            phone: user.ownedTenant.phone,
            subscription: user.ownedTenant.saasSubscription
              ? {
                  id: user.ownedTenant.saasSubscription.id,
                  planName: user.ownedTenant.saasSubscription.planName,
                  status: user.ownedTenant.saasSubscription.status,
                  currentPeriodEnd: user.ownedTenant.saasSubscription.currentPeriodEnd
                }
              : null
          }
        : null,
      subscription: user.ownedTenant?.saasSubscription
        ? {
            id: user.ownedTenant.saasSubscription.id,
            planName: user.ownedTenant.saasSubscription.planName,
            status: user.ownedTenant.saasSubscription.status,
            currentPeriodEnd: user.ownedTenant.saasSubscription.currentPeriodEnd
          }
        : null
    };
  },

  async update(
    userId: string,
    input: UpdateAdminUserInput,
    context: {
      currentUserId: string;
    }
  ) {
    const user = await AdminUserRepository.findById(userId);

    if (!user) {
      notFound();
    }

    if (context.currentUserId === userId && input.role !== UserRole.ADMIN) {
      throw new Error("Você não pode remover seu próprio acesso administrativo.");
    }

    if (user.role === UserRole.ADMIN && input.role !== UserRole.ADMIN) {
      const adminCount = await AdminUserRepository.countAdmins();

      if (adminCount <= 1) {
        throw new Error("O sistema precisa manter ao menos um administrador ativo.");
      }
    }

    await AdminUserRepository.updateById(userId, {
      name: input.name,
      role: input.role
    });

    return AdminUserRepository.findById(userId);
  },

  getFormValues(user: { name: string; role: UserRole }) {
    return {
      name: user.name,
      role: user.role
    };
  }
};
