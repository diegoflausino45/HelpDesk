import "dotenv/config";
import express from 'express';
import cors from 'cors';
import { prisma } from './libs/prisma.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import ticketRoutes from './routes/tickets.js';
import commentRoutes from './routes/comments.js';
const PORT = process.env.PORT || 3000;

const app = express()

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/comments', commentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});