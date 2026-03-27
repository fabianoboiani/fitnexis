import { SubscriptionStatus, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db";
import { PasswordService } from "@/modules/auth/services/password.service";
import { LoginSchema, type LoginInput } from "@/modules/auth/schemas/login.schema";
import { RegisterSchema, type RegisterInput } from "@/modules/auth/schemas/register.schema";
import { TenantService } from "@/modules/tenants/services/tenant.service";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  studentId: string | null;
};

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const AuthService = {
  async authenticateWithCredentials(input: LoginInput): Promise<AuthenticatedUser | null> {
    const parsed = LoginSchema.safeParse(input);
    if (!parsed.success) {
      return null;
    }

    const email = parsed.data.email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedTenant: {
          select: {
            id: true
          }
        },
        studentProfile: {
          select: {
            id: true,
            tenantId: true
          }
        }
      }
    });

    if (!user) {
      return null;
    }

    const passwordMatches = await PasswordService.compare(parsed.data.password, user.passwordHash);
    if (!passwordMatches) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.ownedTenant?.id ?? user.studentProfile?.tenantId ?? null,
      studentId: user.studentProfile?.id ?? null
    };
  },

  async registerPersonal(input: RegisterInput) {
    const parsed = RegisterSchema.parse(input);
    const email = parsed.email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      throw new AuthError("Já existe uma conta cadastrada com este e-mail.");
    }

    const passwordHash = await PasswordService.hash(parsed.password);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: parsed.name,
          email,
          passwordHash,
          role: UserRole.PERSONAL
        }
      });

      const tenant = await TenantService.createForOwner(
        {
          ownerUserId: user.id,
          businessName: parsed.businessName,
          personalName: parsed.name,
          phone: parsed.phone,
          email
        },
        tx
      );

      const subscription = await tx.saaSSubscription.create({
        data: {
          tenantId: tenant.id,
          planName: "Trial",
          status: SubscriptionStatus.TRIAL
        }
      });

      return {
        userId: user.id,
        tenantId: tenant.id,
        subscriptionId: subscription.id
      };
    });
  }
};