import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../libs/prisma.js';
// Chave usada para assinar tokens JWT — a mesma lida pelo middleware auth
import { JWT_SECRET } from '../libs/env.js';

const router = express.Router();

// ─── POST /api/auth/register ────────────────────────────────────────────────
// Cria um novo usuário no sistema.
// Verifica duplicidade de e-mail, aplica hash bcrypt na senha (salt 10)
// e retorna o usuário criado junto com o JWT de sessão.
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, sectorId } = req.body;

  try {
    // Verifica e-mail duplicado antes de criar
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, sectorId: sectorId ? parseInt(sectorId) : null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        sectorId: true,
        sector: { select: { id: true, name: true } },
      },
    });

    // Token sem expiração explicit a — gerenciado via inspecc
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/auth/login ───────────────────────────────────────────────────
// Autentica um usuário via e-mail e senha.
// Compara a senha fornecida com o hash armazenado (bcrypt.compare)
// e retorna JWT em caso de sucesso.
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { sector: { select: { id: true, name: true } } },
    });
    if (!user) {
      // Retorna mensagem genérica para não vazar se e-mail existe ou não
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        sectorId: user.sectorId,
        sector: user.sector,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;