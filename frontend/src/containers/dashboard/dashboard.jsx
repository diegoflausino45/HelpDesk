import styles from "./dashboard.module.css"
import { FiUsers, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi"
import StatusChart from "./components/statusChart"
import PeriodChart from "./components/periodChart"

function Dashboard() {
  return (
    <main className={styles.dashboard}>
      
      <section className={styles.kpis}>
        <div className={styles.card}>
          <FiUsers size={28} />
          <div>
            <span>Total</span>
            <strong>124</strong>
          </div>
        </div>

        <div className={styles.card}>
          <FiAlertCircle size={28} />
          <div>
            <span>Abertos</span>
            <strong>18</strong>
          </div>
        </div>

        <div className={styles.card}>
          <FiClock size={28} />
          <div>
            <span>Em andamento</span>
            <strong>32</strong>
          </div>
        </div>

        <div className={styles.card}>
          <FiCheckCircle size={28} />
          <div>
            <span>Resolvidos</span>
            <strong>74</strong>
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
            <tr>
              <td>#1023</td>
              <td>Erro no sistema</td>
              <td>Aberto</td>
              <td>Alta</td>
            </tr>
            <tr>
              <td>#1022</td>
              <td>Computador lento</td>
              <td>Em andamento</td>
              <td>Média</td>
            </tr>
          </tbody>
        </table>
      </section>

    </main>
  )
}

export default Dashboard
