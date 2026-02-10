import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const data = [
  { status: "Abertos", total: 18 },
  { status: "Em andamento", total: 32 },
  { status: "Resolvidos", total: 74 },
  { status: "Atrasados", total: 5 }
]

function StatusChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <XAxis dataKey="status" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="#c62828" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default StatusChart
