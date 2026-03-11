import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../libs/prisma.js';
import { authenticate } from '../middlewares/auth.js';
import { notifyTicketStakeholders } from '../libs/notifications.js';

const router = express.Router();

// ─── GET /api/comments/ticket/:ticketId ───────────────────────────────────────────
// Retorna todos os comentários de um chamado, ordenados por data crescente.
// Verifica se o usuário tem acesso ao chamado antes de listar.
router.get('/ticket/:ticketId', authenticate, async (req, res) => {
  const { ticketId } = req.params;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    // Check if user has access to the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (userRole !== 'admin' && ticket.createdById !== userId && ticket.assignedToId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const comments = await prisma.comment.findMany({
      where: { ticketId: parseInt(ticketId) },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/comments ───────────────────────────────────────────────────────────────
// Cria um comentário em um chamado e notifica os envolvidos (exceto o autor).
router.post('/', authenticate, [
  body('ticketId').isInt().withMessage('Valid ticket ID is required'),
  body('content').notEmpty().withMessage('Content is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { ticketId, content } = req.body;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    // Check if user has access to the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(ticketId) },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (userRole !== 'admin' && ticket.createdById !== userId && ticket.assignedToId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        ticketId: parseInt(ticketId),
        userId,
      },
      include: {
        user: { select: { id: true, name: true } },
        attachments: true,
      },
    });

    // Notificar envolvidos sobre novo comentário
    await notifyTicketStakeholders(
      parseInt(ticketId),
      userId,
      'comment_added',
      `Chamado #${ticketId} — novo comentário`,
      content.length > 100 ? content.slice(0, 100) + '…' : content,
    );

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── PUT /api/comments/:id ───────────────────────────────────────────────────────────────
// Edita o conteúdo de um comentário. Apenas o autor ou admin podem editar.
router.put('/:id', authenticate, [
  body('content').notEmpty().withMessage('Content is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { content } = req.body;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Allow update if owner or admin
    if (comment.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── DELETE /api/comments/:id ──────────────────────────────────────────────────────────────
// Remove um comentário. Apenas o autor ou admin podem deletar.
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Allow delete if owner or admin
    if (comment.userId !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.comment.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;