import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../libs/prisma.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { calcSlaDeadline, calcSlaStatus } from '../libs/sla.js';
import { notifyTicketStakeholders, createNotification } from '../libs/notifications.js';

const router = express.Router();

// Helper: include completo para queries de ticket
const TICKET_INCLUDE = {
  createdBy: { select: { id: true, name: true, sector: { select: { id: true, name: true } } } },
  assignedTo: { select: { id: true, name: true } },
  comments: {
    include: {
      user: { select: { id: true, name: true } },
      attachments: true,
    },
    orderBy: { createdAt: 'asc' as const },
  },
  attachments: { include: { uploadedBy: { select: { id: true, name: true } } } },
  history: {
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' as const },
  },
};

// Get all tickets
router.get('/', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    const tickets = await prisma.ticket.findMany({
      where: userRole === 'admin' || userRole === 'technician' ? {} : {
        OR: [
          { createdById: userId },
          { assignedToId: userId },
        ],
      },
      include: TICKET_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ticket by ID
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
      include: TICKET_INCLUDE,
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (userRole !== 'admin' && userRole !== 'technician' && ticket.createdById !== userId && ticket.assignedToId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create ticket
router.post('/', authenticate, [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').optional(),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, priority, assignedToId } = req.body;
  const userId = (req as any).user.id;
  const finalPriority = priority || 'medium';

  try {
    const slaDeadline = calcSlaDeadline(new Date(), finalPriority);

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: finalPriority,
        createdById: userId,
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        slaDeadline,
        slaStatus: 'ok',
        slaViolated: false,
      },
      include: TICKET_INCLUDE,
    });

    // Histórico inicial
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        userId,
        fromStatus: null,
        toStatus: 'open',
        note: 'Chamado criado',
      },
    });

    // Notificar atribuído (se houver)
    if (ticket.assignedToId && ticket.assignedToId !== userId) {
      await createNotification({
        userId: ticket.assignedToId,
        type: 'assigned',
        title: `Chamado #${ticket.id} atribuído a você`,
        message: title,
        ticketId: ticket.id,
      });
    }

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update ticket
router.put('/:id', authenticate, [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional(),
  body('status').optional().isIn(['open', 'in-progress', 'closed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { title, description, status, priority, assignedToId, historyNote } = req.body;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Regras de transição de status (workflow)
    const WORKFLOW_RULES: Record<string, string[]> = {
      open: ['in-progress', 'closed'],
      'in-progress': ['open', 'closed'],
      closed: ['open'],
    };

    if (status && status !== ticket.status) {
      const allowed = WORKFLOW_RULES[ticket.status] ?? [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          error: `Transição de "${ticket.status}" para "${status}" não é permitida.`,
        });
      }
    }

    // Permissões por papel
    if (userRole !== 'admin' && userRole !== 'technician' && ticket.createdById !== userId && ticket.assignedToId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (userRole === 'user') {
      if (status && status !== 'closed') {
        return res.status(403).json({ error: 'Usuários podem apenas encerrar chamados próprios' });
      }
      if (assignedToId !== undefined || priority) {
        return res.status(403).json({ error: 'Usuários não podem alterar atribuição ou prioridade' });
      }
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) {
      updateData.priority = priority;
      // Recalcular SLA se prioridade mudou
      const newDeadline = calcSlaDeadline(ticket.createdAt, priority);
      updateData.slaDeadline = newDeadline;
      updateData.slaStatus = 'ok';
      updateData.slaViolated = false;
    }
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId ? parseInt(assignedToId) : null;

    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: TICKET_INCLUDE,
    });

    // Registrar histórico se status mudou
    if (status && status !== ticket.status) {
      await prisma.ticketHistory.create({
        data: {
          ticketId: parseInt(id),
          userId,
          fromStatus: ticket.status,
          toStatus: status,
          note: historyNote ?? null,
        },
      });

      // Notificar envolvidos sobre mudança de status
      await notifyTicketStakeholders(
        parseInt(id),
        userId,
        'status_changed',
        `Chamado #${id} — status atualizado`,
        `Status alterado de "${ticket.status}" para "${status}"`,
      );
    }

    // Notificar novo atribuído
    const newAssignedId = assignedToId ? parseInt(assignedToId) : null;
    if (newAssignedId && newAssignedId !== ticket.assignedToId && newAssignedId !== userId) {
      await createNotification({
        userId: newAssignedId,
        type: 'assigned',
        title: `Chamado #${id} atribuído a você`,
        message: updatedTicket.title,
        ticketId: parseInt(id),
      });
    }

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete ticket (admin only)
router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.ticket.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET histórico do ticket
router.get('/:id/history', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const history = await prisma.ticketHistory.findMany({
      where: { ticketId: parseInt(id) },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(history);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;