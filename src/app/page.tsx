import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  MonitorSmartphone,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users2
} from "lucide-react";
import { LandingNavbar } from "@/components/shared/landing/landing-navbar";
import { FeatureCard } from "@/components/shared/landing/feature-card";
import { ProductMockup } from "@/components/shared/landing/product-mockup";
import { SectionHeading } from "@/components/shared/landing/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, getDefaultAuthenticatedRoute } from "@/lib/auth-helpers";
import { BRAND_COPY, BRAND_NAME } from "@/lib/branding";

const problems = [
  "Agenda e atendimentos controlados em vários lugares ao mesmo tempo.",
  "Informações de alunos espalhadas entre conversas, notas e planilhas.",
  "Pouca visibilidade sobre pagamentos, compromissos e rotina operacional.",
  "Dificuldade para manter um atendimento organizado conforme a carteira cresce."
];

const solutions = [
  "Centraliza alunos, agenda, pagamentos e evolução em um único ambiente.",
  "Entrega uma visão clara do que precisa de atenção no dia e na semana.",
  "Ajuda o personal a operar com mais consistência e postura profissional.",
  "Cria uma base organizada para crescer sem perder controle do atendimento."
];

const features = [
  {
    icon: Users2,
    eyebrow: "Gestão de alunos",
    title: "Cadastros organizados e fáceis de acompanhar",
    description:
      "Mantenha a carteira de alunos centralizada, com status, observações e contexto do atendimento em um fluxo simples de consultar."
  },
  {
    icon: CalendarDays,
    eyebrow: "Agenda operacional",
    title: "Compromissos visíveis e rotina sob controle",
    description:
      "Acompanhe sessões, horários e próximos atendimentos com uma agenda pensada para a operação do personal trainer."
  },
  {
    icon: LayoutDashboard,
    eyebrow: "Painel principal",
    title: "Indicadores claros para tomar decisão mais rápido",
    description:
      "Veja alunos ativos, pagamentos pendentes, recebimentos e próximos compromissos sem depender de conferências manuais."
  },
  {
    icon: UserRound,
    eyebrow: "Experiência do aluno",
    title: "Base pronta para uma jornada mais conectada",
    description:
      "Estruture uma experiência mais profissional para o aluno com evolução, acompanhamento e relacionamento melhor organizados."
  },
  {
    icon: ClipboardList,
    eyebrow: "Histórico operacional",
    title: "Registros que ajudam a manter continuidade",
    description:
      "Documente sessões, observações e pontos importantes para acompanhar cada aluno com mais clareza ao longo do tempo."
  },
  {
    icon: LineChart,
    eyebrow: "Visão de crescimento",
    title: "Uma operação preparada para evoluir",
    description:
      "Use uma estrutura que atende a rotina atual e sustenta a expansão para assessorias, studios e equipes."
  }
];

const audiences = [
  {
    title: "Personais autônomos",
    description: "Para quem quer operar com mais organização, previsibilidade e padrão profissional no dia a dia."
  },
  {
    title: "Assessorias esportivas",
    description: "Ideal para operações que precisam acompanhar mais alunos, processos e rotina com clareza."
  },
  {
    title: "Studios e pequenos times",
    description: "Uma base adequada para organizar agenda, atendimentos e operação em estruturas menores."
  },
  {
    title: "Profissionais em crescimento",
    description: "Para quem quer escalar o atendimento com mais controle e menos improviso."
  }
];

const benefits = [
  {
    icon: Sparkles,
    title: "Rotina mais organizada",
    description: "Menos informação solta e mais visibilidade sobre o que precisa ser acompanhado."
  },
  {
    icon: BellRing,
    title: "Mais eficiência no dia a dia",
    description: "Reduza retrabalho operacional e ganhe tempo para focar no atendimento."
  },
  {
    icon: ShieldCheck,
    title: "Mais controle da operação",
    description: "Tenha visão sobre agenda, alunos, pagamentos e pontos de atenção."
  },
  {
    icon: Dumbbell,
    title: "Apresentação mais profissional",
    description: "Sua estrutura passa a refletir a qualidade do serviço que você entrega."
  },
  {
    icon: UserRound,
    title: "Melhor experiência para o aluno",
    description: "Atendimentos mais organizados geram mais confiança e continuidade."
  },
  {
    icon: BarChart3,
    title: "Base para crescer com consistência",
    description: "Expanda sua operação sem depender de controles improvisados."
  }
];

const productCards = [
  {
    title: "Painel com visão imediata da operação",
    description: "Indicadores essenciais para acompanhar o negócio e agir com rapidez no que precisa de atenção.",
    icon: LayoutDashboard
  },
  {
    title: "Agenda desenhada para a rotina do personal",
    description: "Compromissos e atendimentos organizados de forma objetiva, com leitura simples e prática.",
    icon: CalendarDays
  },
  {
    title: "Controle financeiro conectado ao atendimento",
    description: "Pagamentos, vencimentos e situações financeiras em um fluxo fácil de acompanhar.",
    icon: CreditCard
  },
  {
    title: "Estrutura pronta para a área do aluno",
    description: "Uma base que prepara o produto para evoluir a experiência de acompanhamento e relacionamento.",
    icon: MonitorSmartphone
  }
];

const credibility = [
  "Pensado para a rotina real de quem atende alunos e precisa manter a operação em ordem.",
  "Construído com foco em clareza operacional, confiabilidade e uso prático no dia a dia.",
  "Desenhado para apoiar crescimento com mais processo, visibilidade e consistência.",
  "Preparado para evoluir sem exigir que a operação seja reorganizada do zero no futuro."
];

const faqs = [
  {
    question: "O Fitnexis atende apenas personal trainers?",
    answer:
      "O foco inicial da plataforma é o personal trainer, mas a estrutura já considera a expansão para assessorias, studios e equipes."
  },
  {
    question: "Consigo gerenciar vários alunos ao mesmo tempo?",
    answer:
      "Sim. O Fitnexis foi pensado para centralizar a carteira de alunos e facilitar o acompanhamento da rotina de atendimento."
  },
  {
    question: "O aluno também terá acesso à plataforma?",
    answer:
      "Sim. A evolução do produto considera uma área do aluno integrada ao restante da operação."
  },
  {
    question: "Funciona bem no celular?",
    answer:
      "Sim. A interface foi projetada para funcionar de forma responsiva em celular, tablet e desktop."
  },
  {
    question: "Vai existir suporte para operações com equipe?",
    answer:
      "Sim. A base do produto foi planejada para suportar modelos mais estruturados em fases futuras."
  },
  {
    question: `Como posso começar a usar o ${BRAND_NAME}?`,
    answer:
      "Você pode criar sua conta diretamente pela plataforma ou falar com o time comercial para entender a melhor forma de uso para sua operação."
  }
];

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_38%,#f8fafc_100%)]">
      <LandingNavbar />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_left,rgba(37,99,235,0.14),transparent_30%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-14 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:pb-28 lg:pt-20">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex rounded-full border border-cyan-100 bg-white/80 px-4 py-2 text-sm font-semibold text-cyan-950 shadow-sm backdrop-blur">
                {BRAND_COPY.hero.badge}
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">
                    Fitnexis
                  </p>
                  <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-slate-950 sm:text-6xl xl:text-7xl">
                    {BRAND_COPY.hero.title}
                  </h1>
                </div>
                <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                  {BRAND_COPY.hero.description}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-slate-950 px-6 text-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.7)] transition-transform hover:-translate-y-0.5 hover:bg-slate-900"
                >
                  <Link href="/register">
                    {BRAND_COPY.cta.primary}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-slate-200 bg-white/80 px-6 backdrop-blur hover:bg-white"
                >
                  <a href="#produto">
                    {BRAND_COPY.cta.tertiary}
                    <PlayCircle className="ml-2 size-4" />
                  </a>
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  "Mais controle da rotina",
                  "Mais organização no atendimento",
                  "Mais estrutura para crescer"
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/70 bg-white/70 px-4 py-4 text-sm font-medium text-slate-700 shadow-sm backdrop-blur"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <ProductMockup />
          </div>
        </section>

        <section id="problema" className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionHeading
              eyebrow="Desafio operacional"
              title="Sem estrutura, a rotina fica mais pesada do que deveria."
              description="Quando agenda, alunos e controles ficam espalhados, o personal perde tempo, reduz visibilidade da operação e dificulta a própria expansão."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {problems.map((problem, index) => (
                <Card
                  key={problem}
                  className="border-white/70 bg-white/85 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]"
                >
                  <CardHeader>
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                      0{index + 1}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base leading-7 text-slate-600">{problem}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="solucao" className="border-y border-slate-200/70 bg-white/70 py-24 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading
              eyebrow="Como o Fitnexis ajuda"
              title="Uma plataforma para dar ordem à operação e mais segurança ao crescimento."
              description="O Fitnexis concentra o que o personal precisa acompanhar e transforma a rotina em um processo mais claro, profissional e fácil de gerenciar."
            />

            <div className="mt-12 grid gap-4 md:grid-cols-2">
              {solutions.map((item) => (
                <div
                  key={item}
                  className="group flex gap-4 rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm transition-transform hover:-translate-y-1"
                >
                  <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-900">
                    <ChevronRight className="size-5" />
                  </div>
                  <p className="text-base leading-7 text-slate-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="recursos" className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeading
            eyebrow="Funcionalidades principais"
            title="Recursos pensados para a operação real do personal trainer."
            description="Cada módulo foi planejado para simplificar a rotina e melhorar a qualidade da gestão no atendimento."
            align="center"
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionHeading
              eyebrow="Para quem foi feito"
              title="Flexível para a rotina atual e preparado para operações mais estruturadas."
              description="O Fitnexis atende o profissional autônomo de hoje sem limitar a evolução do negócio no futuro."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {audiences.map((item) => (
                <Card key={item.title} className="border-white/70 bg-white/85 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-950">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(239,246,255,0.8))] py-24">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading
              eyebrow="Benefícios"
              title="Ganhos práticos para quem quer atender com mais estrutura."
              description="O valor da plataforma aparece no controle da rotina, na apresentação do negócio e na capacidade de crescer com mais consistência."
              align="center"
            />

            <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {benefits.map((benefit) => (
                <Card key={benefit.title} className="border-white/70 bg-white/90 shadow-sm">
                  <CardHeader className="space-y-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <benefit.icon className="size-5" />
                    </div>
                    <CardTitle className="text-xl text-slate-950">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="produto" className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeading
            eyebrow="Visão do produto"
            title="Uma interface criada para facilitar leitura, ação e acompanhamento."
            description="Dashboard, agenda, alunos, pagamentos e evolução organizados em uma experiência clara e objetiva."
          />

          <div className="mt-14 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <ProductMockup />
            <div className="grid gap-4">
              {productCards.map((item) => (
                <Card key={item.title} className="border-white/70 bg-white/90 shadow-sm">
                  <CardHeader className="space-y-4">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-950">
                      <item.icon className="size-5" />
                    </div>
                    <CardTitle className="text-xl text-slate-950">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-slate-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeading
            eyebrow="Confiança de produto"
            title="Tecnologia aplicada a uma rotina que precisa de previsibilidade."
            description="O Fitnexis foi desenhado para apoiar a operação com clareza, confiabilidade e espaço para evolução."
            align="center"
          />

          <div className="mt-14 grid gap-4 md:grid-cols-2">
            {credibility.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-slate-200/80 bg-white/85 px-6 py-6 shadow-sm"
              >
                <p className="text-base leading-8 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(135deg,#020617,#0f172a_42%,#082f49)] p-8 text-white shadow-[0_40px_120px_-40px_rgba(2,6,23,0.85)] sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl space-y-5">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  {`${BRAND_NAME} para sua operação`}
                </p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
                  Estruture sua operação com um software feito para a rotina do personal trainer.
                </h2>
                <p className="text-lg leading-8 text-slate-300">
                  Comece a usar o Fitnexis ou fale com nosso time para entender como a plataforma se adapta à sua rotina de atendimento.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100"
                >
                  <Link href="/register">{BRAND_COPY.cta.primary}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-white hover:bg-white/10"
                >
                  <a href="mailto:contato@fitnexis.com.br">{BRAND_COPY.cta.secondary}</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeading
            eyebrow="FAQ"
            title="Perguntas frequentes"
            description="Informações objetivas para quem está avaliando o Fitnexis."
          />

          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            {faqs.map((item) => (
              <Card key={item.question} className="border-white/70 bg-white/90 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-950">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1fr_auto_auto] lg:items-start">
          <div className="max-w-xl space-y-4">
            <div>
              <p className="text-2xl font-semibold tracking-tight text-slate-950">{BRAND_NAME}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {BRAND_COPY.institutional.footerDescription}
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <a href="#" className="transition-colors hover:text-slate-950">Instagram</a>
              <a href="#" className="transition-colors hover:text-slate-950">LinkedIn</a>
              <a href="#" className="transition-colors hover:text-slate-950">YouTube</a>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <p className="font-semibold uppercase tracking-[0.22em] text-slate-400">Navegação</p>
            <div className="grid gap-2">
              <a href="#solucao" className="transition-colors hover:text-slate-950">Como funciona</a>
              <a href="#recursos" className="transition-colors hover:text-slate-950">Funcionalidades</a>
              <a href="#produto" className="transition-colors hover:text-slate-950">Produto</a>
              <a href="#faq" className="transition-colors hover:text-slate-950">FAQ</a>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-semibold uppercase tracking-[0.22em] text-slate-400">Pronto para usar?</p>
            <Button asChild className="rounded-full bg-slate-950 px-6 text-white hover:bg-slate-900">
              <Link href="/register">{BRAND_COPY.cta.primary}</Link>
            </Button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <LifeBuoy className="size-4" />
              <span>contato@fitnexis.com.br</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/80 px-6 py-5 text-center text-sm text-slate-500">
          (c) 2026 Fitnexis. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
