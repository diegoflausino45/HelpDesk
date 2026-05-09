import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../libs/prisma.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// ─── GET /api/sectors ───────────────────────────────────────────────────────
// Retorna todos os setores. Público para suportar cadastro e selects da aplicação.
router.get('/', async (req, res) => {
  try {
    const sectors = await prisma.sector.findMany({
      select: { id: true, name: true },
    });
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /api/sectors ──────────────────────────────────────────────────────
// Cria um novo setor. Restrito a admins.
// Verifica duplicidade de nome antes de persistir.
router.post('/', authenticate, authorize(['admin']), [
  body('name').notEmpty().withMessage('Name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
    // Evita setores duplicados (nome único no banco)
    const existingSector = await prisma.sector.findUnique({ where: { name } });
    if (existingSector) {
      return res.status(400).json({ error: 'Sector already exists' });
    }

    const sector = await prisma.sector.create({
      data: { name },
    });
    res.status(201).json(sector);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;