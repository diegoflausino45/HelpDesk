import { prisma } from './prisma.js';
import { calcSlaStatus } from './sla.js';
import { createNotification } from './notifications.js';

/**
 * Verificação de SLA dos chamados abertos.
 *
 * Busca todos os tickets ainda abertos e com deadline de SLA definido,
 * recalcula o status e emite notificações nas transições críticas:
 *   ok → warning  (menos de 20% do prazo restante)
 *   ok/warning → violated (prazo excedido)
 *
 * Localmente roda a cada 15 minutos via node-cron (index.ts); na Vercel é
 * chamada pelo Vercel Cron através da rota GET /api/cron/sla.
 */
export async function runSlaCheck(): Promise<{ checked: number; updated: number }> {
  const openTickets = await prisma.ticket.findMany({
    where: {
      status: { not: 'closed' },
      slaDeadline: { not: null },
    },
    select: {
      id: true, priority: true, slaDeadline: true,
      slaStatus: true, slaViolated: true,
      createdAt: true, createdById: true, assignedToId: true,
    },
  });

  let updated = 0;

  for (const ticket of openTickets) {
    if (!ticket.slaDeadline) continue;

    // Calcula status atual com base no tempo restante vs horas úteis
    const { status, violated } = calcSlaStatus(ticket.createdAt, ticket.slaDeadline, ticket.priority);

    // Nenhuma mudança de estado — pula sem gravar
    if (status === ticket.slaStatus && violated === ticket.slaViolated) continue;

    // Persiste o novo status no banco
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { slaStatus: status, slaViolated: violated },
    });
    updated++;

    // Notifica criador e atribuído (nunca duplica para o mesmo usuário)
    const recipients = [...new Set([ticket.createdById, ticket.assignedToId].filter(Boolean) as number[])];
    for (const uid of recipients) {
      if (status === 'violated' && ticket.slaStatus !== 'violated') {
        // Transição para violado — alerta crítico
        await createNotification({
          userId: uid,
          type: 'sla_violated',
          title: `SLA violado — Chamado #${ticket.id}`,
          message: `O prazo do chamado foi excedido.`,
          ticketId: ticket.id,
        });
      } else if (status === 'warning' && ticket.slaStatus === 'ok') {
        // Transição para aviso — prazo ficando curto
        await createNotification({
          userId: uid,
          type: 'sla_warning',
          title: `SLA em risco — Chamado #${ticket.id}`,
          message: `Menos de 20% do prazo restante.`,
          ticketId: ticket.id,
        });
      }
    }
  }

  return { checked: openTickets.length, updated };
}
