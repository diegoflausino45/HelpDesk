import { useState, useEffect } from "react"
import styles from "./dashboard.module.css"
import { FiUsers, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi"
import StatusChart from "./components/statusChart"
import PeriodChart from "./components/periodChart"
import { ticketsAPI } from "../../utils/api"

function Dashboard() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    try {
      const response = await ticketsAPI.getAll()
      setTickets(response.data)
    } catch (err) {
      setError('Erro ao carregar chamados')
    } finally {
      setLoading(false)
    }
  }

  // Calcular KPIs
  const totalTickets = tickets.length
  const openTickets = tickets.filter(t => t.status === 'open').length
  const inProgressTickets = tickets.filter(t => t.status === 'in-progress').length
  const closedTickets = tickets.filter(t => t.status === 'closed').length

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>
  }

  if (error) {
    return <div className={styles.error}>{error}</div>
  }
  return (
    <main className={styles.dashboard}>
      
      <section className={styles.kpis}>
        <div className={styles.card}>
          <FiUsers size={28} />
          <div>
            <span>Total</span>
            <strong>{totalTickets}</strong>
          </div>
        </div>

        <div className={styles.card}>
          <FiAlertCircle size={28} />
          <div>
            <span>Abertos</span>
            <strong>{openTickets}</strong>
          </div>
        </div>

        <div className={styles.card}>
          <FiClock size={28} />
          <div>
            <span>Em andamento</span>
            <strong>{inProgressTickets}</strong>
          </div>
        </div>

        <div className={styles.card}>
          <FiCheckCircle size={28} />
          <div>
            <span>Resolvidos</span>
            <strong>{closedTickets}</strong>
          </div>
        </div>
      </section>

      <section className={styles.content}>
          <div className={styles.box}>
              <h3>Chamados por Status</h3>
              <StatusChart />
          </div>

          <div className={styles.box}>
              <h3>Chamados por Período</h3>
              <PeriodChart />
          </div>
      </section>

      <section className={styles.table}>
        <h3>Últimos Chamados</h3>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Assunto</th>
              <th>Status</th>
              <th>Prioridade</th>
            </tr>
          </thead>
          <tbody>
            {tickets.slice(0, 5).map(ticket => (
              <tr key={ticket.id}>
                <td>#{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>
                  <span className={`${styles.status} ${styles[ticket.status]}`}>
                    {ticket.status === 'open' ? 'Aberto' :
                     ticket.status === 'in-progress' ? 'Em andamento' :
                     ticket.status === 'closed' ? 'Fechado' : ticket.status}
                  </span>
                </td>
                <td>
                  <span className={`${styles.priority} ${styles[ticket.priority]}`}>
                    {ticket.priority === 'low' ? 'Baixa' :
                     ticket.priority === 'medium' ? 'Média' :
                     ticket.priority === 'high' ? 'Alta' : ticket.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </main>
  )
}

export default Dashboard
