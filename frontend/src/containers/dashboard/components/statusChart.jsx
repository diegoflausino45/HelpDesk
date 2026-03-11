import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"



function StatusChart({open, inProgress, isClosed}) {
  const statusColors = {
    Abertos: "var(--color-status-open)",
    "Em andamento": "var(--color-status-progress)",
    Resolvidos: "var(--color-status-resolved)",
    Atrasados: "var(--color-error)",
  }

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
