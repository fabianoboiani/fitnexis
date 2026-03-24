"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChangeStudentPasswordSchema,
  UpdateStudentProfileSchema,
  type ChangeStudentPasswordInput,
  type UpdateStudentProfileInput
} from "@/modules/student/schemas/student-profile.schema";

type StudentProfileFormProps = {
  initialProfile: UpdateStudentProfileInput;
  account: {
    memberSince: string;
    accountStatus: string;
    coach: string;
    plan: string;
    nextCheckIn: string;
  };
};

export function StudentProfileForm({ initialProfile, account }: StudentProfileFormProps) {
  const displayPlanName = account.plan.replace(/^Acompanhamento\s+/i, "").toLowerCase();
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const profileForm = useForm<UpdateStudentProfileInput>({
    resolver: zodResolver(UpdateStudentProfileSchema),
    defaultValues: initialProfile
  });

  const passwordForm = useForm<ChangeStudentPasswordInput>({
    resolver: zodResolver(ChangeStudentPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmitProfile = profileForm.handleSubmit(() => {
    setProfileMessage(
      "Dados atualizados localmente no MVP. A integração real com o backend pode usar esta mesma estrutura."
    );
  });

  const onSubmitPassword = passwordForm.handleSubmit(() => {
    setPasswordMessage(
      "Solicitação de troca de senha validada localmente. No backend real, esta ação exigirá confirmação segura."
    );
    passwordForm.reset();
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <div className="space-y-6">
        <Card className="border-white/70 bg-white/95 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <UserCircle2 className="size-5" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-950">Meus dados</CardTitle>
                <p className="text-sm text-slate-500">
                  Atualize suas informações pessoais dentro dos limites do seu acompanhamento.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmitProfile}>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" {...profileForm.register("name")} />
                <p className="text-xs text-destructive">{profileForm.formState.errors.name?.message}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" {...profileForm.register("email")} disabled />
                <p className="text-xs text-slate-500">
                  Seu e-mail é exibido para consulta. Alterações futuras podem exigir validação.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" {...profileForm.register("phone")} />
                <p className="text-xs text-destructive">{profileForm.formState.errors.phone?.message}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de nascimento</Label>
                <Input id="birthDate" type="date" {...profileForm.register("birthDate")} />
                <p className="text-xs text-destructive">{profileForm.formState.errors.birthDate?.message}</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="goal">Objetivo principal</Label>
                <Input id="goal" {...profileForm.register("goal")} />
                <p className="text-xs text-destructive">{profileForm.formState.errors.goal?.message}</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="photoUrl">Foto de perfil</Label>
                <Input id="photoUrl" placeholder="https://..." {...profileForm.register("photoUrl")} />
                <p className="text-xs text-slate-500">
                  No MVP, a foto usa uma URL simples para representar a futura integração de upload.
                </p>
                <p className="text-xs text-destructive">{profileForm.formState.errors.photoUrl?.message}</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emergencyContact">Contato de emergência</Label>
                <Input id="emergencyContact" {...profileForm.register("emergencyContact")} />
                <p className="text-xs text-destructive">
                  {profileForm.formState.errors.emergencyContact?.message}
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="personalNotes">Observações pessoais</Label>
                <Textarea id="personalNotes" {...profileForm.register("personalNotes")} />
                <p className="text-xs text-slate-500">
                  Use este espaço para informações úteis do seu dia a dia, sem alterar o planejamento do personal.
                </p>
                <p className="text-xs text-destructive">
                  {profileForm.formState.errors.personalNotes?.message}
                </p>
              </div>

              {profileMessage ? (
                <p className="text-sm text-emerald-600 md:col-span-2">{profileMessage}</p>
              ) : null}

              <div className="md:col-span-2">
                <Button type="submit">Salvar alterações</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/95 shadow-sm">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-950">Segurança da conta</CardTitle>
                <p className="text-sm text-slate-500">
                  Atualize sua senha com segurança. No MVP, o fluxo é validado localmente para preparar a integração real.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form className="grid gap-5 md:grid-cols-3" onSubmit={onSubmitPassword}>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha atual</Label>
                <Input id="currentPassword" type="password" {...passwordForm.register("currentPassword")} />
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.currentPassword?.message}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input id="newPassword" type="password" {...passwordForm.register("newPassword")} />
                <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword?.message}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                <Input id="confirmPassword" type="password" {...passwordForm.register("confirmPassword")} />
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.confirmPassword?.message}
                </p>
              </div>

              {passwordMessage ? (
                <p className="text-sm text-emerald-600 md:col-span-3">{passwordMessage}</p>
              ) : null}

              <div className="md:col-span-3">
                <Button type="submit" variant="outline" className="border-slate-200 bg-white">
                  Atualizar senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-white/70 bg-white/95 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex size-24 items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-semibold text-white shadow-lg">
                {initialProfile.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={initialProfile.photoUrl} alt={initialProfile.name} className="h-full w-full object-cover" />
                ) : (
                  initialProfile.name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{initialProfile.name}</h2>
                <p className="text-sm text-slate-500">
                  Aluno com acompanhamento ativo no plano {displayPlanName}.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Informações de conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="text-slate-500">Status da conta</p>
              <p className="font-medium text-slate-950">{account.accountStatus}</p>
            </div>
            <div>
              <p className="text-slate-500">Membro desde</p>
              <p className="font-medium text-slate-950">{account.memberSince}</p>
            </div>
            <div>
              <p className="text-slate-500">Plano atual</p>
              <p className="font-medium text-slate-950">{account.plan}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-white/95 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Acompanhamento responsável</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div>
              <p className="text-slate-500">Personal responsável</p>
              <p className="font-medium text-slate-950">{account.coach}</p>
            </div>
            <div>
              <p className="text-slate-500">Próximo check-in</p>
              <p className="font-medium text-slate-950">{account.nextCheckIn}</p>
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
              Algumas alterações de cadastro podem depender de validação futura para preservar a organização do seu acompanhamento.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}