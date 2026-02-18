import styles from "./relatorios.module.css"
import { useMemo, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

const COLORS = ["#c62828", "#f9a825", "#2e7d32", "#1565c0"]

function Relatorios() {
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [setor, setSetor] = useState("")
  const [responsavel, setResponsavel] = useState("")

  const chamados = [
    { id: 1, setor: "TI", status: "Aberto", responsavel: "João", data: "2024-02-01", tempo: 5 },
    { id: 2, setor: "RH", status: "Resolvido", responsavel: "Maria", data: "2024-02-03", tempo: 2 },
    { id: 3, setor: "Financeiro", status: "Em atendimento", responsavel: "Carlos", data: "2024-02-04", tempo: 8 },
    { id: 4, setor: "TI", status: "Resolvido", responsavel: "João", data: "2024-02-05", tempo: 3 },
  ]

  /* 🔎 Filtros */
  const dadosFiltrados = useMemo(() => {
    return chamados.filter(c => {
      const periodo =
        (!dataInicio || c.data >= dataInicio) &&
        (!dataFim || c.data <= dataFim)

      const setorOk = !setor || c.setor === setor
      const responsavelOk = !responsavel || c.responsavel === responsavel

      return periodo && setorOk && responsavelOk
    })
  }, [dataInicio, dataFim, setor, responsavel])

  /* 📊 Gráficos */
  const porSetor = useMemo(() => {
    const map = {}
    dadosFiltrados.forEach(c => {
      map[c.setor] = (map[c.setor] || 0) + 1
    })
    return Object.keys(map).map(k => ({ setor: k, total: map[k] }))
  }, [dadosFiltrados])

  const porStatus = useMemo(() => {
    const map = {}
    dadosFiltrados.forEach(c => {
      map[c.status] = (map[c.status] || 0) + 1
    })
    return Object.keys(map).map(k => ({ status: k, total: map[k] }))
  }, [dadosFiltrados])

  /* 📄 PDF sem gráficos */
  function exportPDF() {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Relatório de Chamados", 14, 18)

    autoTable(doc, {
      startY: 28,
      head: [["ID", "Setor", "Status", "Responsável", "Data", "Tempo (h)"]],
      body: dadosFiltrados.map(c => [
        c.id,
        c.setor,
        c.status,
        c.responsavel,
        c.data,
        c.tempo,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [198, 40, 40] },
    })

    doc.save("relatorio_chamados.pdf")
  }

  /* 📊 Excel */
  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(dadosFiltrados)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Chamados")
    XLSX.writeFile(wb, "relatorio_chamados.xlsx")
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Relatórios</h1>
        <div className={styles.actions}>
          <button onClick={exportPDF}>Exportar PDF</button>
          <button onClick={exportExcel}>Exportar Excel</button>
        </div>
      </header>

      {/* Filtros */}
      <section className={styles.filters}>
        <div>
          <label>Data início</label>
          <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
        </div>

        <div>
          <label>Data fim</label>
          <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
        </div>

        <div>
          <label>Setor</label>
          <select className={styles.filterSelect} value={setor} onChange={e => setSetor(e.target.value)}>
            <option value="">Todos</option>
            <option>TI</option>
            <option>RH</option>
            <option>Financeiro</option>
          </select>
        </div>

        <div>
          <label>Responsável</label>
          <select className={styles.filterSelect} value={responsavel} onChange={e => setResponsavel(e.target.value)}>
            <option value="">Todos</option>
            <option>João</option>
            <option>Maria</option>
            <option>Carlos</option>
          </select>
        </div>
      </section>

      {/* Gráficos */}
      <section className={styles.graficos}>
        <div className={styles.card}>
          <h3>Chamados por Setor</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porSetor}>
              <XAxis dataKey="setor" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#c62828" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.card}>
          <h3>Status dos Chamados</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={porStatus} dataKey="total" nameKey="status" label>
                {porStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  )
}

export default Relatorios
