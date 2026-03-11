import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

/**
 * periodChart.jsx — Gráfico de linha de chamados por dia/período.
 */
function PeriodChart({data}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="dia" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="chamados"
          stroke="var(--color-primary)"
          strokeWidth={3}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default PeriodChart
