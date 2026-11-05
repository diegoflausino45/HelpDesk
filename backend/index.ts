import "dotenv/config";
// Valida as variáveis obrigatórias antes de qualquer outra coisa
// (encerra o processo com mensagem clara se JWT_SECRET faltar)
import './libs/env.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import cron from 'node-cron';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import ticketRoutes from './routes/tickets.js';
import commentRoutes from './routes/comments.js';
import sectorRoutes from './routes/sectors.js';
import attachmentRoutes from './routes/attachments.js';
import notificationRoutes from './routes/notifications.js';
import { runSlaCheck } from './libs/slaJob.js';

// Porta configurável via variável de ambiente (padrão: 3000)
const PORT = process.env.PORT || 3000;

// Na Vercel o app roda como função serverless: não há porta para escutar
// nem processo contínuo para o node-cron (a Vercel define VERCEL=1).
const IS_VERCEL = Boolean(process.env.VERCEL);

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

// ─── Verificação de SLA via HTTP (usada pelo Vercel Cron) ───────────────────
// A Vercel chama esta rota no horário definido em vercel.json e envia
// "Authorization: Bearer <CRON_SECRET>". Sem CRON_SECRET configurado, a rota
// fica sempre bloqueada.
app.get('/api/cron/sla', async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(await runSlaCheck());
});

// ─── Middleware global de tratamento de erros ───────────────────────────────
// Captura qualquer exceção não tratada nas rotas e retorna 500 genérico
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

if (!IS_VERCEL) {
  // ─── Job agendado: verificação de SLA a cada 15 minutos ──────────────────
  cron.schedule('*/15 * * * *', async () => {
    try {
      await runSlaCheck();
    } catch (e) {
      console.error('Erro no cron SLA:', e);
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Exportado para a Vercel, que transforma o app em uma Vercel Function
export default app;