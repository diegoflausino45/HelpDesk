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

const PORT = process.env.PORT || 3000;

const app = express()

// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos de upload
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/sectors', sectorRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// ─── Cron: verificar SLA a cada 15 minutos ─────────────────────────────────
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
      const { status, violated } = calcSlaStatus(ticket.createdAt, ticket.slaDeadline, ticket.priority);

      if (status === ticket.slaStatus && violated === ticket.slaViolated) continue;

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { slaStatus: status, slaViolated: violated },
      });

      // Notificar somente nas transições relevantes
      const recipients = [ticket.createdById, ticket.assignedToId].filter(Boolean) as number[];
      for (const uid of recipients) {
        if (status === 'violated' && ticket.slaStatus !== 'violated') {
          await createNotification({
            userId: uid,
            type: 'sla_violated',
            title: `SLA violado — Chamado #${ticket.id}`,
            message: `O prazo do chamado foi excedido.`,
            ticketId: ticket.id,
          });
        } else if (status === 'warning' && ticket.slaStatus === 'ok') {
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

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});