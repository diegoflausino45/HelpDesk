import { prisma } from './prisma.js';

type NotifType =
  | 'ticket_created'
  | 'ticket_updated'
  | 'status_changed'
  | 'comment_added'
  | 'sla_warning'
  | 'sla_violated'
  | 'assigned';

interface CreateNotifOptions {
  userId: number;
  type: NotifType;
  title: string;
  message: string;
  ticketId?: number;
}

export async function createNotification(opts: CreateNotifOptions) {
  try {
    await prisma.notification.create({
      data: {
        userId: opts.userId,
        type: opts.type,
        title: opts.title,
        message: opts.message,
        ticketId: opts.ticketId ?? null,
      },
    });
  } catch {
    // Notificação é não-crítica — não propaga o erro
  }
}

/**
 * Notifica o criador e o atribuído de um ticket (exceto o próprio autor da ação).
 */
export async function notifyTicketStakeholders(
  ticketId: number,
  actorId: number,
  type: NotifType,
  title: string,
  message: string,
) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    select: { createdById: true, assignedToId: true },
  });
  if (!ticket) return;

  const recipients = new Set<number>();
  recipients.add(ticket.createdById);
  if (ticket.assignedToId) recipients.add(ticket.assignedToId);
  recipients.delete(actorId); // não notifica quem executou a ação

  for (const userId of recipients) {
    await createNotification({ userId, type, title, message, ticketId });
  }
}
