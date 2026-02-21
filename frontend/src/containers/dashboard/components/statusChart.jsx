import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"



function StatusChart({open, inProgress, isClosed}) {

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
        <Bar dataKey="total" fill="#c62828" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default StatusChart
