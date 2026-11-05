import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
// Chave secreta para verificar tokens JWT (obrigatória, validada na inicialização)
import { JWT_SECRET } from '../libs/env.js';

// Extende o tipo Request do Express para carregar o usuário autenticado
export interface AuthRequest extends Request {
  user?: { id: number; role: string };
}

/**
 * Middleware de autenticação
 * Verifica o token JWT do header Authorization (Bearer <token>).
 * Em caso de sucesso, popula req.user com { id, role } e chama next().
 * Em caso de falha, retorna 401.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // Decodifica e valida a assinatura do token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

/**
 * Middleware de autorização baseado em papéis (RBAC simples).
 * Deve ser usado após `authenticate`.
 * @param roles Lista de papéis permitidos (ex.: ['admin', 'technician'])
 */
export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};