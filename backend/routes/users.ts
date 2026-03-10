import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { prisma } from '../libs/prisma.js';
import { authenticate, AuthRequest } from '../middlewares/auth.js';

const router = express.Router();

const MANAGEMENT_ROLES = ['admin', 'technician'];

const canManageUsers = (role?: string) => MANAGEMENT_ROLES.includes(role || '');
const isAdmin = (role?: string) => role === 'admin';

// Create user (admin / technician)
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req: AuthRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, sectorId } = req.body;
  const userRole = req.user?.role;

  if (!canManageUsers(userRole)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const requestedRole = (role || 'user').toString();
    const finalRole = isAdmin(userRole)
      ? requestedRole
      : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role: finalRole,
        sectorId: sectorId ? parseInt(sectorId) : null
      },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin / technician)
router.get('/', authenticate, async (req: AuthRequest, res) => {
  if (!canManageUsers(req.user?.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const where = isAdmin(req.user?.role) ? {} : { role: { not: 'admin' } };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        sectorId: true,
        sector: { select: { id: true, name: true } }
      },
    });

    res.json(users);

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const targetUserId = parseInt(id);
  const requesterId = req.user?.id;
  const requesterRole = req.user?.role;

  if (!requesterId) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  if (!canManageUsers(requesterRole) && requesterId !== targetUserId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        sectorId: true,
        sector: { select: { id: true, name: true } }
      },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!isAdmin(requesterRole) && canManageUsers(requesterRole) && user.role === 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user
router.put('/:id', authenticate, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req: AuthRequest, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, email, password, role, sectorId } = req.body;

  const targetUserId = parseInt(id);
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId || !userRole) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const editingSelf = targetUserId === userId;
  const managingOtherUser = !editingSelf;

  if (managingOtherUser && !canManageUsers(userRole)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!isAdmin(userRole) && targetUser.role === 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updateData: any = {};

    if (password && managingOtherUser && !isAdmin(userRole)) {
      return res.status(403).json({ error: 'Only admins can change another user password' });
    }

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (role && isAdmin(userRole)) updateData.role = role;

    if (sectorId !== undefined) {
      updateData.sectorId = sectorId ? parseInt(sectorId) : null;
    }

    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        sectorId: true,
        sector: { select: { id: true, name: true } }
      },
    });

    res.json(user);

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin / technician)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const targetUserId = parseInt(id);
  const requesterId = req.user?.id;
  const requesterRole = req.user?.role;

  if (!requesterId || !canManageUsers(requesterRole)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (requesterId === targetUserId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    if (!isAdmin(requesterRole) && targetUser.role === 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.user.delete({ where: { id: targetUserId } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;