import { notFound } from "next/navigation";
import type {
  AdminUserDetailsDto,
  AdminUserFormValuesDto,
  AdminUserListItemDto
} from "@/modules/admin/users/dto/admin-user.dto";
import { AdminUserRepository } from "@/modules/admin/users/repositories/admin-user.repository";
import {
  UpdateAdminUserSchema,
  type UpdateAdminUserInput
} from "@/modules/admin/users/schemas/admin-user.schema";

export const AdminUserService = {
  async list(filters?: {
    name?: string;
    email?: string;
    role?: UpdateAdminUserInput["role"];
  }): Promise<AdminUserListItemDto[]> {
    const users = await AdminUserRepository.findMany(filters);

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      tenantId: user.ownedTenant?.id ?? null,
      tenantBusinessName: user.ownedTenant?.businessName ?? null
    }));
  },

  async getById(id: string): Promise<AdminUserDetailsDto | null> {
    const user = await AdminUserRepository.findById(id);

    if (!user) {
      return null;
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
            phone: user.ownedTenant.phone
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

  async getByIdOrThrow(id: string): Promise<AdminUserDetailsDto> {
    const user = await this.getById(id);

    if (!user) {
      notFound();
    }

    return user;
  },

  async update(
    targetUserId: string,
    actingAdminUserId: string,
    input: UpdateAdminUserInput
  ) {
    const parsed = UpdateAdminUserSchema.parse(input);
    const currentUser = await AdminUserRepository.findById(targetUserId);

    if (!currentUser) {
      notFound();
    }

    if (
      targetUserId === actingAdminUserId &&
      currentUser.role === "ADMIN" &&
      parsed.role !== "ADMIN"
    ) {
      throw new Error("Voce n?o pode remover seu pr?prio acesso administrativo.");
    }

    if (currentUser.role === "ADMIN" && parsed.role !== "ADMIN") {
      const adminCount = await AdminUserRepository.countAdmins();

      if (adminCount <= 1) {
        throw new Error("O sistema precisa manter pelo menos um usu?rio ADMIN.");
      }
    }

    return AdminUserRepository.updateById(targetUserId, {
      name: parsed.name,
      role: parsed.role
    });
  },

  getFormValues(user: AdminUserDetailsDto): AdminUserFormValuesDto {
    return {
      name: user.name,
      role: user.role
    };
  }
};
