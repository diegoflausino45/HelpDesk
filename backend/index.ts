import "dotenv/config";
import express from 'express';
import cors from 'cors';
import path from 'path';
import cron from 'node-cron';
import { prisma } from './libs/prisma.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import ticketRoutes from './routes/tickets.js';
import commentRoutes from './routes/comments.js';
import sectorRoutes from './routes/sectors.js';
import attachmentRoutes from './routes/attachments.js';
import notificationRoutes from './routes/notifications.js';
import { calcSlaStatus } from './libs/sla.js';
import { createNotification } from './libs/notifications.js';

// Porta configurável via variável de ambiente (padrão: 3000)
const PORT = process.env.PORT || 3000;

const app = express()

// ─── Middlewares globais ────────────────────────────────────────────────────

// Permite requisições cross-origin do frontend
app.use(cors());

// Parseia o body de requisições como JSON
app.use(express.json());

// Servir arquivos enviados via upload (imagens, PDFs, etc.)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Registro de rotas ──────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);           // Autenticação (login / register)
app.use('/api/users', userRoutes);           // CRUD de usuários
app.use('/api/tickets', ticketRoutes);       // CRUD de chamados
app.use('/api/comments', commentRoutes);     // Comentários em chamados
app.use('/api/sectors', sectorRoutes);       // Setores da organização
app.use('/api/attachments', attachmentRoutes); // Anexos de chamados e comentários
app.use('/api/notifications', notificationRoutes); // Central de notificações

// Endpoint de saúde — verificação de disponibilidade do servidor
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ─── Job agendado: verificação de SLA a cada 15 minutos ────────────────────
// Busca todos os tickets ainda abertos e com deadline de SLA definido,
// recalcula o status e emite notificações nas transições críticas:
//   ok → warning  (menos de 20% do prazo restante)
//   ok/warning → violated (prazo excedido)
cron.schedule('*/15 * * * *', async () => {
  try {
    const openTickets = await prisma.ticket.findMany({
      where: {
        status: { not: 'closed' },
        slaDeadline: { not: null },
      },
      select: {
        id: true, priority: true, slaDeadline: true,
        slaStatus: true, slaViolated: true,
        createdAt: true, createdById: true, assignedToId: true,
      },
    });

    for (const ticket of openTickets) {
      if (!ticket.slaDeadline) continue;

      // Calcula status atual com base no tempo restante vs horas úteis
      const { status, violated } = calcSlaStatus(ticket.createdAt, ticket.slaDeadline, ticket.priority);

      // Nenhuma mudança de estado — pula sem gravar
      if (status === ticket.slaStatus && violated === ticket.slaViolated) continue;

      // Persiste o novo status no banco
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { slaStatus: status, slaViolated: violated },
      });

      // Notifica criador e atribuído (nunca duplica para o mesmo usuário)
      const recipients = [ticket.createdById, ticket.assignedToId].filter(Boolean) as number[];
      for (const uid of recipients) {
        if (status === 'violated' && ticket.slaStatus !== 'violated') {
          // Transição para violado — alerta crítico
          await createNotification({
            userId: uid,
            type: 'sla_violated',
            title: `SLA violado — Chamado #${ticket.id}`,
            message: `O prazo do chamado foi excedido.`,
            ticketId: ticket.id,
          });
        } else if (status === 'warning' && ticket.slaStatus === 'ok') {
          // Transição para aviso — prazo ficando curto
          await createNotification({
            userId: uid,
            type: 'sla_warning',
            title: `SLA em risco — Chamado #${ticket.id}`,
            message: `Menos de 20% do prazo restante.`,
            ticketId: ticket.id,
          });
        }
      }
    }
  } catch (e) {
    console.error('Erro no cron SLA:', e);
  }
});

// ─── Middleware global de tratamento de erros ───────────────────────────────
// Captura qualquer exceção não tratada nas rotas e retorna 500 genérico
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});