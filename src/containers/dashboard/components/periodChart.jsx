import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const data = [
  { dia: "Seg", chamados: 12 },
  { dia: "Ter", chamados: 19 },
  { dia: "Qua", chamados: 7 },
  { dia: "Qui", chamados: 22 },
  { dia: "Sex", chamados: 15 }
]

function PeriodChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="dia" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="chamados"
          stroke="#c62828"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default PeriodChart
