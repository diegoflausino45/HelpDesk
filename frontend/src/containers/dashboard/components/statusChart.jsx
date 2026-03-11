import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

/**
 * statusChart.jsx — Gráfico de barras por status de chamados.
 *
 * Recebe totais por status via props e aplica cores semânticas por categoria.
 */

function StatusChart({open, inProgress, isClosed}) {
  // Paleta por status exibido no eixo X
  const statusColors = {
    Abertos: "var(--color-status-open)",
    "Em andamento": "var(--color-status-progress)",
    Resolvidos: "var(--color-status-resolved)",
    Atrasados: "var(--color-error)",
  }

  // Estrutura que o Recharts consome
  const data = [
  { status: "Abertos", total: open },
  { status: "Em andamento", total: inProgress },
  { status: "Resolvidos", total: isClosed },
  { status: "Atrasados", total: 1 }
]

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.status} fill={statusColors[entry.status] || "var(--color-primary)"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default StatusChart
