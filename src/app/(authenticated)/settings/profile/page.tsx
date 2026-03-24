import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsProfileForm } from "@/components/shared/settings-profile-form";
import { requireTenant } from "@/lib/tenant";
import { updateTenantProfileAction } from "@/modules/settings/actions/profile-settings.action";
import { SettingsService } from "@/modules/settings/services/settings.service";

type SettingsProfilePageProps = {
  searchParams?: Promise<{
    success?: string;
  }>;
};

export default async function SettingsProfilePage({
  searchParams
}: SettingsProfilePageProps) {
  const tenant = await requireTenant();
  const profile = await SettingsService.getTenantProfile(tenant.id);
  const params = searchParams ? await searchParams : undefined;

  if (!profile) {
    throw new Error("Perfil do tenant não encontrado.");
  }

  return (
    <main className="space-y-8 px-6 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader
          title="Perfil"
          description="Edite os dados principais do personal e do negócio em um fluxo simples e profissional."
        />
        <Button asChild variant="outline" className="border-slate-200 bg-white">
          <Link href="/settings">Voltar para configurações</Link>
        </Button>
      </div>

      {params?.success === "updated" ? (
        <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Perfil atualizado com sucesso.
        </div>
      ) : null}

      <SettingsProfileForm
        initialValues={{
          personalName: profile.personalName,
          businessName: profile.businessName,
          phone: profile.phone,
          email: profile.email
        }}
        onSubmitAction={updateTenantProfileAction}
      />
    </main>
  );
}