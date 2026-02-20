import express from 'express';
import { body, validationResult } from 'express-validator';
import { prisma } from '../libs/prisma.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Get all sectors
router.get('/', authenticate, async (req, res) => {
  try {
    const sectors = await prisma.sector.findMany({
      select: { id: true, name: true },
    });
    res.json(sectors);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create sector (admin only)
router.post('/', authenticate, authorize(['admin']), [
  body('name').notEmpty().withMessage('Name is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name } = req.body;

  try {
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