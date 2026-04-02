# Fitnexis

Plataforma profissional para personal trainers gerenciarem alunos, agenda, pagamentos e rotina de atendimento com arquitetura multi-tenant.

## Stack

- Next.js 15
- React
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui
- Prisma
- PostgreSQL
- Auth.js
- Zod
- React Hook Form
- date-fns
- bcrypt

## Arquitetura

O projeto segue uma arquitetura monolítica modular:

- `src/app`: rotas, layouts e páginas
- `src/modules`: regra de negócio por domínio
- `src/lib`: infraestrutura, auth, tenant e utilitários
- `src/components`: UI compartilhada
- `prisma`: schema, migrations e seed

## Multi-tenant

O sistema foi estruturado para:

- 1 aplicação
- 1 banco PostgreSQL
- isolamento por `tenantId`

Entidades de negócio como `Student`, `Payment`, `Appointment`, `ProgressRecord` e `SaaSSubscription` usam `tenantId`.

Regras da base atual:

- toda listagem de domínio usa filtro explícito por `tenantId`
- toda busca por id em módulos de negócio valida o tenant atual
- `studentId` usado em pagamentos, agenda e evolução é validado dentro do mesmo tenant
- a sessão do usuário carrega `tenantId` quando houver tenant vinculado
- usuários com role `STUDENT` ficam vinculados a um `Student` real do mesmo domínio

## Módulos implementados

- autenticação com `Auth.js` e credenciais
- cadastro de personal com criação automática de `User + Tenant + SaaSSubscription`
- dashboard com métricas reais por tenant
- alunos
- pagamentos
- agenda
- evolução física
- configurações de perfil e billing
- área do aluno integrada ao mesmo domínio do personal
- área administrativa global com dashboard, tenants, usuários, assinaturas e configurações

## Como rodar localmente

### 1. Configurar ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

### 2. Subir o PostgreSQL com Docker

```bash
docker compose up -d
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Gerar o Prisma Client

```bash
npm run prisma:generate
```

### 5. Rodar as migrations

```bash
npm run prisma:migrate -- --name init
```

Se existirem migrations novas, rode o comando novamente com o nome correspondente ou apenas:

```bash
npx prisma migrate dev
```

### 6. Popular dados de exemplo

```bash
npm run prisma:seed
```

### 7. Iniciar o projeto

```bash
npm run dev
```

Aplicação local:

- `http://localhost:3000`

## Login e cenários de teste

Senha padrão de todas as contas seed:

- `123456`

### Usuários seed

- `admin@fitnexis.local`
  Papel: `ADMIN`
  Uso: painel administrativo global em `/admin`

- `personal@fitnexis.local`
  Papel: `PERSONAL`
  Uso: painel operacional do personal em `/dashboard`

- `aluno@fitnexis.local`
  Papel: `STUDENT`
  Uso: portal do aluno em `/student`
  Vínculo: `Marina Costa`

- `lucas.aluno@fitnexis.local`
  Papel: `STUDENT`
  Uso: portal do aluno em `/student`
  Vínculo: `Lucas Andrade`

### Como testar cada perfil

#### Admin

1. Acesse `/login`
2. Entre com `admin@fitnexis.local`
3. Você será redirecionado para `/admin`

#### Personal

1. Acesse `/login`
2. Entre com `personal@fitnexis.local`
3. Você será redirecionado para `/dashboard`
4. Use o menu para testar alunos, pagamentos, agenda, evolução e configurações

#### Aluno

1. Acesse `/login`
2. Entre com `aluno@fitnexis.local` ou `lucas.aluno@fitnexis.local`
3. Você será redirecionado para `/student`
4. Teste dashboard, agenda, histórico, evolução, avisos e perfil com dados reais do mesmo tenant do personal

## O que o seed cria

- 1 usuário `ADMIN`
- 1 usuário `PERSONAL`
- 1 tenant ativo do personal
- 5 alunos no tenant demo
- 2 alunos com `User` vinculado e role `STUDENT`
- pagamentos reais vinculados aos alunos
- agendamentos reais vinculados aos alunos
- registros de evolução reais vinculados aos alunos
- 1 assinatura SaaS do tenant
- avisos persistidos do aluno, incluindo eventos automáticos e comunicados manuais de exemplo

## Fluxos disponíveis

### Testar avisos do aluno

- No painel do personal, abra `Alunos` e entre no detalhe de um aluno com acesso ao portal.
- Use o bloco `Comunicado manual` para enviar um aviso direto para a central do aluno.
- Alterações em agenda, pagamentos e evolução também atualizam avisos reais no portal do aluno.

## Fluxos disponíveis

- `/login`
  Login por credenciais com Auth.js

- `/register`
  Cadastro de novo personal com criação automática de:
  `User (PERSONAL) + Tenant + SaaSSubscription (TRIAL)`

## Scripts úteis

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run typecheck`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:studio`
- `npm run prisma:seed`

## Estrutura principal

```text
src/
  app/
    (auth)/
    (authenticated)/
    (admin)/
    (student)/
    api/
  components/
    shared/
    ui/
  modules/
    auth/
    tenants/
    dashboard/
    students/
    payments/
    appointments/
    progress/
    settings/
    student/
    admin/
  lib/
    auth.ts
    auth.config.ts
    auth-helpers.ts
    app-routes.ts
    db.ts
    tenant.ts
    student.ts
    permissions.ts
    utils.ts
  middleware.ts
prisma/
  schema.prisma
  seed.ts
```

## Observações

- `ADMIN` é um papel global da plataforma
- `PERSONAL` opera somente no escopo do próprio tenant
- `STUDENT` acessa apenas o `Student` vinculado ao próprio usuário
- a tela `/no-tenant` trata contas autenticadas sem tenant operacional vinculado
- a marca atual do produto é `Fitnexis`
