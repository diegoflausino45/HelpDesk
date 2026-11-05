# HelpDesk

Sistema de chamados de TI full stack: abertura e acompanhamento de chamados com SLA em horas
úteis, comentários, anexos, histórico de status, notificações, relatórios exportáveis e controle
de acesso por papel.

> Projeto pessoal de portfólio. Os dados do seed são fictícios e servem apenas para demonstração
> local.

## Funcionalidades

- **Chamados**: criação, edição, atribuição a técnicos, prioridade (baixa, média, alta) e fluxo de
  status (aberto, em andamento, encerrado), com visualização em lista ou grade e filtros.
- **SLA**: prazo calculado em horas úteis conforme a prioridade, com indicador de situação
  (no prazo, em risco, violado) e filtro por SLA.
- **Comentários e anexos**: conversa dentro do chamado, com upload de imagens, PDF, documentos
  Office, texto e ZIP (até 10 MB por arquivo).
- **Histórico**: cada mudança de status fica registrada com autor, data e observação.
- **Notificações in-app**: central com contador de não lidas para novos chamados, atribuições,
  mudanças de status, comentários, anexos e alertas de SLA.
- **Tarefa agendada**: a cada 15 minutos o backend reavalia o SLA dos chamados abertos e notifica
  os envolvidos quando um prazo entra em risco ou é violado.
- **Dashboard e relatórios**: KPIs, gráficos por status e por período, filtros por data, setor e
  responsável, e exportação para **PDF** e **Excel**.
- **Autenticação JWT**: login, cadastro com escolha de setor e rotas protegidas.
- **Usuários e setores**: gestão de usuários com paginação, papéis (usuário, técnico, admin) e
  cadastro de setores.
- **Tema claro/escuro**.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, Vite, React Router, Axios, Recharts, jsPDF + jspdf-autotable, SheetJS (xlsx), react-hot-toast, CSS Modules |
| Backend | Node.js, Express 5, TypeScript (executado com tsx), express-validator, Multer, node-cron |
| Dados | PostgreSQL, Prisma 7 (driver adapter `@prisma/adapter-pg`) com migrations versionadas |
| Segurança | JWT (jsonwebtoken), hash de senha com bcrypt |
| Infra | Docker e Docker Compose |

## Estrutura

```
HelpDesk/
├── backend/
│   ├── index.ts            # servidor Express, rotas e job de SLA
│   ├── libs/               # env, prisma, sla, notificações
│   ├── middlewares/auth.ts # autenticação JWT e autorização por papel
│   ├── routes/             # auth, users, tickets, comments, attachments, sectors, notifications
│   ├── prisma/             # schema e migrations
│   └── seed.ts             # setores padrão e conta admin de demonstração
├── frontend/
│   └── src/                # containers (páginas), components, hooks, utils/api.js
└── docker-compose.yml
```

## Como rodar

Pré-requisitos: Node.js 20.19+ e um PostgreSQL acessível. Se não tiver um, suba um container:

```bash
docker run -d --name helpdesk-db -e POSTGRES_USER=helpdesk -e POSTGRES_PASSWORD=helpdesk -e POSTGRES_DB=helpdesk -p 5432:5432 postgres:16
```

### Variáveis de ambiente

Copie o exemplo e preencha:

```bash
cp backend/.env.example backend/.env
```

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | String de conexão do PostgreSQL |
| `JWT_SECRET` | sim | Segredo para assinar os tokens. A API **não inicia** sem ele |
| `PORT` | não | Porta da API (padrão `3000`) |

Para gerar um `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

O frontend não usa variáveis de ambiente: ele chama a API em `http://localhost:3000/api`
(`frontend/src/utils/api.js`).

### Sem Docker

```bash
# Backend (http://localhost:3000)
cd backend
npm install
npx prisma generate        # gera o Prisma Client em backend/generated/prisma
npx prisma migrate deploy  # cria as tabelas
npm run seed               # setores padrão + conta de demonstração
npm run dev
```

```bash
# Frontend (http://localhost:5173), em outro terminal
cd frontend
npm install
npm run dev
```

Também é possível subir os dois juntos pela raiz, depois de instalar as dependências de cada
pasta: `npm install && npm run dev`.

### Com Docker

O `docker-compose.yml` sobe a API e o frontend; o banco fica fora dele (use o container
PostgreSQL acima ou outro servidor).

1. Em `backend/.env`, aponte o `DATABASE_URL` para o banco visto de dentro do container. Com o
   PostgreSQL na sua máquina (Docker Desktop), troque `localhost` por `host.docker.internal`.
2. Gere o Prisma Client antes do build, pois a imagem copia a pasta `backend/generated`:

   ```bash
   cd backend && npm install && npx prisma generate && cd ..
   ```

3. Suba os serviços e, com eles no ar, crie as tabelas e os dados de demonstração:

   ```bash
   docker compose up --build
   ```

   ```bash
   docker compose exec backend npx prisma migrate deploy
   docker compose exec backend npm run seed
   ```

Frontend em `http://localhost:5173`, API em `http://localhost:3000/api` (saúde:
`/api/health`).

## Login de demonstração

O seed cria uma conta **somente para uso local**:

| E-mail | Senha | Papel |
| --- | --- | --- |
| `admin@helpdesk.com` | `admin123` | admin |

Essa senha é pública (está no `seed.ts`). Não rode o seed em um ambiente acessível pela internet
sem antes trocar a senha ou remover a conta. Novos usuários podem se cadastrar pela tela de login
(papel `user`) ou ser criados por um admin.

## Decisões técnicas

- **SLA em horas úteis.** O prazo é calculado na abertura a partir da prioridade: alta 4 h,
  média 8 h, baixa 24 h, contando apenas o expediente de segunda a sexta, das 08h às 18h
  (`backend/libs/sla.ts`). Se a prioridade muda, o prazo é recalculado a partir da data de
  abertura. O status fica "em risco" quando resta 20% ou menos do tempo até o prazo e "violado"
  quando ele passa.
- **Job agendado em vez de cálculo a cada leitura.** Um `node-cron` roda a cada 15 minutos,
  recalcula o SLA dos chamados não encerrados, grava só quando o status muda e notifica criador e
  responsável apenas nas transições (no prazo → em risco, qualquer → violado), evitando
  notificações repetidas.
- **Fluxo de status como máquina de estados.** As transições permitidas são explícitas
  (aberto → em andamento/encerrado, em andamento → aberto/encerrado, encerrado → aberto). Qualquer
  outra é recusada com 400, e toda mudança gera um registro em `TicketHistory` (de/para, autor,
  observação), que funciona como trilha de auditoria.
- **Controle de acesso por papel.** O middleware `authenticate` valida o JWT (que carrega `id` e
  `role`) e `authorize` restringe rotas por papel. Além disso, cada rota checa a posse do recurso:
  usuários comuns só veem chamados que criaram ou que estão atribuídos a eles, só podem
  encerrá-los e não alteram prioridade nem responsável; técnicos veem todos os chamados e criam
  apenas usuários comuns; excluir chamados e criar setores é exclusivo de admins.
- **Notificações persistidas e não bloqueantes.** Ficam na tabela `Notification`, são
  enviadas aos envolvidos (nunca para quem fez a ação) e, em novos chamados, a todos os admins.
  Falhas ao criar uma notificação são ignoradas para não derrubar a operação principal. O
  frontend consulta um endpoint leve de contagem (`/api/notifications/unread-count`) a cada
  30 segundos.
- **Uploads validados.** O Multer grava em disco com nome único (timestamp + sufixo aleatório),
  aceita só uma lista fechada de tipos MIME e limita o tamanho a 10 MB; o download passa por uma
  rota autenticada que verifica a permissão sobre o chamado.
- **Integridade no banco.** O schema Prisma usa `onDelete: Cascade` para que excluir um chamado
  remova comentários, anexos, histórico e notificações ligados a ele, e o e-mail do usuário e o
  nome do setor são únicos.
- **Configuração obrigatória e sem valores padrão inseguros.** `backend/libs/env.ts` lê o
  `JWT_SECRET` uma única vez e encerra a API com uma mensagem clara se ele não estiver definido.
  Senhas são armazenadas com bcrypt e o login responde com a mesma mensagem genérica para e-mail
  inexistente ou senha errada.

## Limitações conhecidas

- Os tokens JWT não têm expiração.
- Além da rota de download autenticada, os arquivos enviados também são servidos estaticamente
  em `/uploads`; o nome aleatório dificulta, mas não impede, o acesso direto.
- A URL da API está fixa no frontend (`http://localhost:3000/api`).
- As preferências da tela de Configurações ficam salvas apenas no navegador (`localStorage`).
- Não há testes automatizados.

## Prints

<!--
Adicione as imagens em docs/prints/ e substitua esta lista:
![Dashboard](docs/prints/dashboard.png)
![Lista de chamados](docs/prints/chamados.png)
![Detalhes do chamado com SLA](docs/prints/detalhes-chamado.png)
![Relatórios](docs/prints/relatorios.png)
-->

_Em breve: dashboard, lista de chamados, detalhes do chamado com SLA e relatórios._
