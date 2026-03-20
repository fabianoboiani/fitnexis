import packageJson from "../../../../../package.json";
import { prisma } from "@/lib/db";

export type AdminSettingsOverview = {
  platformName: string;
  systemVersion: string;
  environment: string;
  totalTenants: number;
  totalUsers: number;
  totalSubscriptions: number;
};

function getEnvironmentLabel() {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";
}

export const AdminSettingsService = {
  async getOverview(): Promise<AdminSettingsOverview> {
    const [totalTenants, totalUsers, totalSubscriptions] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.saaSSubscription.count()
    ]);

    return {
      platformName: "Fitnexis",
      systemVersion: packageJson.version,
      environment: getEnvironmentLabel(),
      totalTenants,
      totalUsers,
      totalSubscriptions
    };
  }
};
