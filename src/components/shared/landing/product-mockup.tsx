import { CalendarDays, CreditCard, LineChart, Users2 } from "lucide-react";

const students = [
  { name: "Marina Costa", status: "Ativo" },
  { name: "Lucas Andrade", status: "Ativo" },
  { name: "Fernanda Lima", status: "Inadimplente" }
];

const appointments = [
  { time: "07:00", title: "Treino de inferiores", student: "Marina Costa" },
  { time: "18:30", title: "Sessao funcional", student: "Lucas Andrade" },
  { time: "09:00", title: "Avalia??o f?sica", student: "Camila Ribeiro" }
];

const payments = [
  { student: "Marina Costa", amount: "R$ 220,00", status: "Pago" },
  { student: "Camila Ribeiro", amount: "R$ 200,00", status: "Pendente" },
  { student: "Fernanda Lima", amount: "R$ 160,00", status: "Vencido" }
];

const progressItems = [
  { student: "Marina Costa", label: "Peso 64,2 kg" },
  { student: "Lucas Andrade", label: "BF 24,1%" },
  { student: "Camila Ribeiro", label: "Registro recente" }
];

function getStatusTone(status: string) {
  if (status === "Ativo" || status === "Pago") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "Pendente") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-rose-50 text-rose-700";
}

export function ProductMockup() {
  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="absolute inset-x-10 -top-8 h-44 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-4 shadow-[0_40px_120px_-40px_rgba(15,23,42,0.7)]">
        <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))] p-4 sm:p-6">
          <div className="space-y-4">
            <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Dashboard do personal</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">Vis?o da rotina de atendimento</h3>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  Opera??o do dia
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Alunos ativos</p>
                  <p className="mt-2 text-2xl font-semibold text-white">18</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Pendentes</p>
                  <p className="mt-2 text-2xl font-semibold text-white">4</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Recebido no mes</p>
                  <p className="mt-2 text-2xl font-semibold text-white">R$ 5,4k</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Agenda hoje</p>
                  <p className="mt-2 text-2xl font-semibold text-white">7</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <Users2 className="size-4 text-cyan-300" />
                    <span>Alunos</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {students.map((student) => (
                      <div
                        key={student.name}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/10 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{student.name}</p>
                          <p className="text-xs text-slate-400">Cadastro ativo no sistema</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusTone(student.status)}`}>
                          {student.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <CreditCard className="size-4 text-cyan-300" />
                    <span>Pagamentos</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={`${payment.student}-${payment.status}`}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/10 px-3 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{payment.student}</p>
                          <p className="text-xs text-slate-400">{payment.amount}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusTone(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <CalendarDays className="size-4 text-cyan-300" />
                    <span>Pr?ximos atendimentos</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {appointments.map((appointment) => (
                      <div
                        key={`${appointment.time}-${appointment.student}`}
                        className="rounded-2xl border border-white/5 bg-black/10 px-3 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-white">{appointment.title}</p>
                          <span className="text-xs text-cyan-300">{appointment.time}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{appointment.student}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    <LineChart className="size-4 text-cyan-300" />
                    <span>Evolu??o recente</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {progressItems.map((item) => (
                      <div
                        key={`${item.student}-${item.label}`}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/10 px-3 py-3"
                      >
                        <p className="text-sm font-medium text-white">{item.student}</p>
                        <p className="text-xs text-slate-400">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
