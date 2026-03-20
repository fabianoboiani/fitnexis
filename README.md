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

O projeto segue uma arquitetura monolitica modular:

- `src/app`: rotas, layouts e paginas
- `src/modules`: regra de negocio por dominio
- `src/lib`: infraestrutura, auth, tenant e utilitarios
- `src/components`: UI compartilhada
- `prisma`: schema, migrations e seed

## Multi-tenant

O sistema foi estruturado para:

- 1 aplicacao
- 1 banco PostgreSQL
- isolamento por `tenantId`

Entidades de negocio como `Student`, `Payment`, `Appointment`, `ProgressRecord` e `SaaSSubscription` usam `tenantId`.

Regras da base atual:

- toda listagem de dominio usa filtro explicito por `tenantId`
- toda busca por id em modulos de negocio valida o tenant atual
- `studentId` usado em pagamentos, agenda e evolucao e validado dentro do mesmo tenant
- a sessao do usuario carrega `tenantId` quando houver tenant vinculado

## Modulos implementados

- autenticacao com `Auth.js` e credenciais
- cadastro de personal com criacao automatica de `User + Tenant + SaaSSubscription`
- dashboard com metricas reais por tenant
- alunos
- pagamentos
- agenda
- evolucao fisica
- configuracoes de perfil e billing
- area administrativa global com dashboard, tenants, usuarios, assinaturas e configuracoes

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

### 3. Instalar dependencias

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

Aplicacao local:

- `http://localhost:3000`

## Login e cadastro

### Usuarios seed

Senha padrao:

- `123456`

Usuarios criados no seed:

- `admin@fitnexis.local`
  Papel: `ADMIN`
  Observacao: conta administrativa global da plataforma

- `personal@fitnexis.local`
  Papel: `PERSONAL`
  Observacao: dono do tenant demo, ideal para testar o MVP completo

### Fluxos disponiveis

- `/login`
  Login por credenciais com Auth.js

- `/register`
  Cadastro de novo personal com criacao automatica de:
  `User (PERSONAL) + Tenant + SaaSSubscription (TRIAL)`

## Scripts uteis

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
    admin/
  lib/
    auth.ts
    auth.config.ts
    auth-helpers.ts
    app-routes.ts
    db.ts
    tenant.ts
    permissions.ts
    utils.ts
  middleware.ts
prisma/
  schema.prisma
  seed.ts
```

## Observacoes

- `ADMIN` e um papel global da plataforma
- `PERSONAL` opera somente no escopo do proprio tenant
- a tela `/no-tenant` trata contas autenticadas sem tenant operacional vinculado
- a marca atual do produto e `Fitnexis`
