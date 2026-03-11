/**
 * Motor de SLA — calcula prazos em horas úteis por prioridade.
 *
 * Horário útil configurável: 08:00 – 18:00, segunda a sexta.
 * Prazos padrão:
 *   high   →  4 h úteis
 *   medium →  8 h úteis
 *   low    → 24 h úteis
 */

export const SLA_HOURS: Record<string, number> = {
  high: 4,
  medium: 8,
  low: 24,
};

const WORK_START = 8;   // 08:00
const WORK_END = 18;    // 18:00
const WORK_DAYS = [1, 2, 3, 4, 5]; // seg–sex (0=dom, 6=sab)

/** Verifica se um determinado momento está em horário útil. */
function isWorkTime(d: Date): boolean {
  const day = d.getDay();
  const hour = d.getHours() + d.getMinutes() / 60;
  return WORK_DAYS.includes(day) && hour >= WORK_START && hour < WORK_END;
}

/**
 * Avança `hoursToAdd` horas úteis a partir de `from` e retorna o prazo.
 */
export function addBusinessHours(from: Date, hoursToAdd: number): Date {
  let remaining = hoursToAdd * 60; // em minutos
  const current = new Date(from);

  while (remaining > 0) {
    if (!WORK_DAYS.includes(current.getDay())) {
      // Dia não útil — avança para segunda
      current.setDate(current.getDate() + 1);
      current.setHours(WORK_START, 0, 0, 0);
      continue;
    }

    const hour = current.getHours() + current.getMinutes() / 60;

    if (hour < WORK_START) {
      current.setHours(WORK_START, 0, 0, 0);
      continue;
    }

    if (hour >= WORK_END) {
      // Passa para o próximo dia útil
      current.setDate(current.getDate() + 1);
      current.setHours(WORK_START, 0, 0, 0);
      continue;
    }

    // Minutos disponíveis até o fim do expediente
    const minutesLeftToday = (WORK_END - hour) * 60;
    const minutesToAdd = Math.min(remaining, minutesLeftToday);
    current.setMinutes(current.getMinutes() + minutesToAdd);
    remaining -= minutesToAdd;
  }

  return current;
}

/**
 * Calcula o prazo SLA de um ticket com base na data de criação e prioridade.
 */
export function calcSlaDeadline(createdAt: Date, priority: string): Date {
  const hours = SLA_HOURS[priority] ?? SLA_HOURS.medium;
  return addBusinessHours(createdAt, hours);
}

/**
 * Retorna o status SLA de um ticket:
 *   "violated" — prazo já passou
 *   "warning"  — menos de 20% do prazo total restante
 *   "ok"       — dentro do prazo
 */
export function calcSlaStatus(
  createdAt: Date,
  deadline: Date,
  priority: string,
  now: Date = new Date()
): { status: string; violated: boolean } {
  if (now >= deadline) {
    return { status: 'violated', violated: true };
  }

  const totalMs = deadline.getTime() - createdAt.getTime();
  const remainingMs = deadline.getTime() - now.getTime();

  if (remainingMs / totalMs <= 0.2) {
    return { status: 'warning', violated: false };
  }

  return { status: 'ok', violated: false };
}

/**
 * Retorna string legível com o tempo restante ou vencido.
 * Ex: "2h 15min restantes" ou "Vencido há 1h"
 */
export function slaRemainingLabel(deadline: Date, now: Date = new Date()): string {
  const diffMs = deadline.getTime() - now.getTime();
  const abs = Math.abs(diffMs);
  const hours = Math.floor(abs / 36e5);
  const minutes = Math.floor((abs % 36e5) / 6e4);

  if (diffMs < 0) {
    return hours > 0
      ? `Vencido há ${hours}h ${minutes}min`
      : `Vencido há ${minutes}min`;
  }

  return hours > 0
    ? `${hours}h ${minutes}min restantes`
    : `${minutes}min restantes`;
}
