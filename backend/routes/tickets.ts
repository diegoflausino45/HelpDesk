import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../libs/prisma.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Get all tickets
router.get('/', authenticate, async (req, res) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    const tickets = await prisma.ticket.findMany({
      where: userRole === 'admin' ? {} : {
        OR: [
          { createdById: userId },
          { assignedToId: userId },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true, sector: {select:{id: true, name:true}} } },
        assignedTo: { select: { id: true, name: true } },
        comments: { include: { user: { select: { id: true, name: true } } } },
      },
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
      include: {
        createdBy: { select: { id: true, name: true, sector: {select:{id: true, name:true}}} },
        assignedTo: { select: { id: true, name: true } },
        comments: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check permissions
    if (userRole !== 'admin' && ticket.createdById !== userId && ticket.assignedToId !== userId) {
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

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || 'medium',
        createdById: userId,
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
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
  const { title, description, status, priority, assignedToId } = req.body;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: parseInt(id) } });
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Check permissions
    if (userRole !== 'admin' && ticket.createdById !== userId && ticket.assignedToId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (userRole === 'user') {
      if (status && status !== 'closed') {
        return res.status(403).json({ error: 'Users can only close tickets' });
      }

      if (assignedToId !== undefined || priority) {
        return res.status(403).json({ error: 'Users cannot update assignment or priority' });
      }
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId ? parseInt(assignedToId) : null;

    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
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

export default router;