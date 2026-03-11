import styles from "./slaBadge.module.css"

/**
 * Renderiza badge de SLA com countdown.
 * Props:
 *   slaDeadline  {string|Date} — prazo ISO/Date
 *   slaStatus    {string}      — "ok" | "warning" | "violated"
 *   slaViolated  {boolean}
 *   ticketStatus {string}      — se "closed", não exibe badge de prazo ativo
 */
function SlaBadge({ slaDeadline, slaStatus, slaViolated, ticketStatus }) {
  if (!slaDeadline) return null

  const deadline = new Date(slaDeadline)
  const now = new Date()
  const diffMs = deadline - now
  const abs = Math.abs(diffMs)
  const hours = Math.floor(abs / 36e5)
  const minutes = Math.floor((abs % 36e5) / 6e4)

  // Chamado fechado — exibe apenas se violou
  if (ticketStatus === "closed") {
    if (!slaViolated) return null
    return (
      <span className={`${styles.badge} ${styles.violated}`} title="SLA violado antes do fechamento">
        ⚠ SLA violado
      </span>
    )
  }

  let label, cls
  if (diffMs < 0) {
    label = hours > 0 ? `Vencido ${hours}h ${minutes}min` : `Vencido ${minutes}min`
    cls = styles.violated
  } else if (slaStatus === "warning") {
    label = hours > 0 ? `${hours}h ${minutes}min ⚡` : `${minutes}min ⚡`
    cls = styles.warning
  } else {
    label = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
    cls = styles.ok
  }

  return (
    <span className={`${styles.badge} ${cls}`} title={`Prazo SLA: ${deadline.toLocaleString("pt-BR")}`}>
      🕐 {label}
    </span>
  )
}

export default SlaBadge
