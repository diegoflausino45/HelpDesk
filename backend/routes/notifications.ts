import express from 'express';
import { prisma } from '../libs/prisma.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// GET /api/notifications — lista notificações do usuário autenticado
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

// GET /api/notifications/unread-count — conta não lidas
router.get('/unread-count', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const count = await prisma.notification.count({ where: { userId, read: false } });
    res.json({ count });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/notifications/:id/read — marcar uma como lida
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

// PATCH /api/notifications/read-all — marcar todas como lidas
router.patch('/read-all', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/notifications/:id — remover notificação
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

// DELETE /api/notifications — limpar todas
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
