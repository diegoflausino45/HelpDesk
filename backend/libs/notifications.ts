import { prisma } from './prisma.js';

// Tipos de notificação suportados pelo sistema
type NotifType =
  | 'ticket_created'    // Chamado criado
  | 'ticket_updated'    // Chamado atualizado (novo anexo, edição, etc.)
  | 'status_changed'    // Mudança de status do chamado
  | 'comment_added'     // Novo comentário no chamado
  | 'sla_warning'       // SLA próximo do vencimento (<20% restante)
  | 'sla_violated'      // SLA violado (prazo excedido)
  | 'assigned';         // Chamado atribuído ao usuário

interface CreateNotifOptions {
  userId: number;
  type: NotifType;
  title: string;
  message: string;
  ticketId?: number; // Opcional — vincula a notificação a um chamado específico
}

/**
 * Cria uma notificação no banco para um usuário específico.
 * Erros são silenciados — notificações são não-críticas e não devem
 * interromper o fluxo principal da aplicação.
 */
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
