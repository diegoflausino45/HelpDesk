import express from 'express';
import { prisma } from '../libs/prisma.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// ─── GET /api/notifications ─────────────────────────────────────────────────
// Lista as últimas 50 notificações do usuário autenticado, mais recentes primeiro.
// Inclui informações básicas do chamado vinculado (se houver).
router.get('/', authenticate, async (req, res) => {
  const userId = (req as any).user.id;

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        ticket: { select: { id: true, title: true, status: true } },
      },
    });
    res.json(notifications);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /api/notifications/unread-count ────────────────────────────────────
// Retorna somente a contagem de notificações não lidas.
// Usado pelo badge do sino no header para evitar carregar dados completos.
router.get('/unread-count', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const count = await prisma.notification.count({ where: { userId, read: false } });
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/notifications/:id/read ──────────────────────────────────────
// Marca uma notificação específica como lida.
// Verifica que a notificação pertence ao usuário antes de atualizar.
router.patch('/:id/read', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  try {
    const notif = await prisma.notification.findUnique({ where: { id: parseInt(id as string) } });
    if (!notif || notif.userId !== userId) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }
    await prisma.notification.update({ where: { id: parseInt(id as string) }, data: { read: true } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PATCH /api/notifications/read-all ──────────────────────────────────────
// Marca todas as notificações do usuário como lidas de uma vez.
router.patch('/read-all', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/notifications/:id ──────────────────────────────────────────
// Remove uma notificação específica do usuário autenticado.
router.delete('/:id', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  const { id } = req.params;
  try {
    const notif = await prisma.notification.findUnique({ where: { id: parseInt(id as string) } });
    if (!notif || notif.userId !== userId) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }
    await prisma.notification.delete({ where: { id: parseInt(id as string) } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/notifications ──────────────────────────────────────────────
// Remove todas as notificações do usuário ("limpar tudo").
router.delete('/', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    await prisma.notification.deleteMany({ where: { userId } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
