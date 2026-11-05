import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../libs/prisma.js';
import { authenticate } from '../middlewares/auth.js';
import { notifyTicketStakeholders } from '../libs/notifications.js';

const router = express.Router();

// Diretório de uploads
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Na Vercel o disco das funções é somente leitura e não persiste entre
// execuções, então o envio de anexos fica desativado na demonstração.
const UPLOADS_ENABLED = !process.env.VERCEL;

if (UPLOADS_ENABLED && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Recusa uploads antes do Multer tentar gravar em disco
const requireUploads = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!UPLOADS_ENABLED) {
    return res.status(503).json({ error: 'O envio de anexos está desativado nesta demonstração.' });
  }
  next();
};

// Tipos MIME permitidos
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
];
const MAX_SIZE_MB = 10;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
  },
});

// POST /api/attachments/ticket/:ticketId — upload de arquivo para ticket
router.post('/ticket/:ticketId', authenticate, requireUploads, upload.single('file'), async (req, res) => {
  const { ticketId } = req.params;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  try {
    const ticket = await prisma.ticket.findUnique({ where: { id: parseInt(ticketId as string) } });
    if (!ticket) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Chamado não encontrado' });
    }

    if (userRole !== 'admin' && userRole !== 'technician' && ticket.createdById !== userId && ticket.assignedToId !== userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        ticketId: parseInt(ticketId as string),
        uploadedById: userId,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    // Notificar envolvidos
    await notifyTicketStakeholders(
      parseInt(ticketId as string),
      userId,
      'ticket_updated',
      `Chamado #${ticketId} — novo anexo`,
      `Arquivo "${req.file.originalname}" adicionado`,
    );

    res.status(201).json(attachment);
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// POST /api/attachments/comment/:commentId — upload de arquivo para comentário
router.post('/comment/:commentId', authenticate, requireUploads, upload.single('file'), async (req, res) => {
  const { commentId } = req.params;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId as string) },
      include: { ticket: true },
    });
    if (!comment) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Comentário não encontrado' });
    }

    const ticket = comment.ticket;
    if (userRole !== 'admin' && userRole !== 'technician' && ticket.createdById !== userId && ticket.assignedToId !== userId) {
      fs.unlinkSync(req.file.path);
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        commentId: parseInt(commentId as string),
        ticketId: ticket.id,
        uploadedById: userId,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    res.status(201).json(attachment);
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// GET /api/attachments/:id/download — baixar arquivo
router.get('/:id/download', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: parseInt(id as string) },
      include: { ticket: true },
    });

    if (!attachment) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    if (attachment.ticket) {
      const t = attachment.ticket;
      if (userRole !== 'admin' && userRole !== 'technician' && t.createdById !== userId && t.assignedToId !== userId) {
        return res.status(403).json({ error: 'Sem permissão' });
      }
    }

    const filePath = path.join(UPLOAD_DIR, attachment.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Arquivo não encontrado no servidor' });
    }

    res.setHeader('Content-Disposition', `inline; filename="${attachment.originalName}"`);
    res.setHeader('Content-Type', attachment.mimetype);
    res.sendFile(filePath);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/attachments/:id — remover anexo
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;

  try {
    const attachment = await prisma.attachment.findUnique({ where: { id: parseInt(id as string) } });
    if (!attachment) {
      return res.status(404).json({ error: 'Anexo não encontrado' });
    }

    if (userRole !== 'admin' && attachment.uploadedById !== userId) {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    const filePath = path.join(UPLOAD_DIR, attachment.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await prisma.attachment.delete({ where: { id: parseInt(id as string) } });
    res.json({ message: 'Anexo removido' });
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

// Error handler do multer
router.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB` });
    }
  }
  res.status(400).json({ error: err.message || 'Erro no upload' });
});

export default router;
