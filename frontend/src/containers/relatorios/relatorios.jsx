import styles from "./relatorios.module.css"
import { useMemo, useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from "recharts"
import { FaCalendarAlt, FaBuilding, FaUser, FaFilter } from "react-icons/fa"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { ticketsAPI, sectorsAPI, usersAPI } from "../../utils/api"

const STATUS_COLORS = {
  Aberto: "var(--color-status-open)",
  "Em atendimento": "var(--color-status-progress)",
  Resolvido: "var(--color-status-resolved)",
}

const STATUS_MAP = {
  open: "Aberto",
  "in-progress": "Em atendimento",
  closed: "Resolvido"
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className={styles.tooltip}>
      {label && <p className={styles.tooltipTitle}>{label}</p>}
      {payload.map((entry, index) => (
        <p key={`${entry.name}-${index}`} className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ backgroundColor: entry.color }} />
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  )
}

const getStatusColor = (status) => STATUS_COLORS[status] || "var(--color-info)"

function Relatorios() {
  const [dataInicio, setDataInicio] = useState("")
  const [dataFim, setDataFim] = useState("")
  const [setor, setSetor] = useState("")
  const [responsavel, setResponsavel] = useState("")

  const [chamados, setChamados] = useState([])
  const [setores, setSetores] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setLoading(true)
      setError("")

      const [ticketsRes, sectorsRes, usersRes] = await Promise.all([
        ticketsAPI.getAll(),
        sectorsAPI.getAll(),
        usersAPI.getAll()
      ])

      setChamados(ticketsRes.data)
      setSetores(sectorsRes.data)
      setUsuarios(usersRes.data)
    } catch (err) {
      console.error(err)
      setError("Erro ao carregar dados. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  /* 🔎 Filtros */
  const dadosFiltrados = useMemo(() => {
    return chamados.filter(c => {
      const dataChamado = new Date(c.createdAt).toISOString().split('T')[0]
      
      const periodo =
        (!dataInicio || dataChamado >= dataInicio) &&
        (!dataFim || dataChamado <= dataFim)

      const setorOk = !setor || (c.createdBy?.sector && c.createdBy.sector.id === parseInt(setor))
      const responsavelOk = !responsavel || (c.assignedTo && c.assignedTo.id === parseInt(responsavel))

      return periodo && setorOk && responsavelOk
    })
  }, [chamados, dataInicio, dataFim, setor, responsavel])

  /* 📊 Gráficos */
  const porSetor = useMemo(() => {
    const map = {}
    dadosFiltrados.forEach(c => {
      const nomeSetor = c.createdBy?.sector?.name || "Sem setor"
      map[nomeSetor] = (map[nomeSetor] || 0) + 1
    })
    return Object.keys(map).map(k => ({ setor: k, total: map[k] }))
  }, [dadosFiltrados])

  const porStatus = useMemo(() => {
    const map = {}
    dadosFiltrados.forEach(c => {
      const status = STATUS_MAP[c.status] || c.status
      map[status] = (map[status] || 0) + 1
    })
    return Object.keys(map).map(k => ({ status: k, total: map[k] }))
  }, [dadosFiltrados])

  const totalChamados = dadosFiltrados.length
  
  const tempoMedio = useMemo(() => {
    if (totalChamados === 0) return "0.0"
    
    let totalHoras = 0
    dadosFiltrados.forEach(c => {
      if (c.updatedAt && c.createdAt) {
        const diff = new Date(c.updatedAt) - new Date(c.createdAt)
        const horas = diff / (1000 * 60 * 60)
        totalHoras += horas
      }
    })
    
    return (totalHoras / totalChamados).toFixed(1)
  }, [dadosFiltrados, totalChamados])
  
  const totalResolvidos = dadosFiltrados.filter(item => item.status === "closed").length
  const taxaResolucao = totalChamados > 0 ? Math.round((totalResolvidos / totalChamados) * 100) : 0
  const emAtendimento = dadosFiltrados.filter(item => item.status === "in-progress").length
  const hasActiveFilters = Boolean(dataInicio || dataFim || setor || responsavel)

  function limparFiltros() {
    setDataInicio("")
    setDataFim("")
    setSetor("")
    setResponsavel("")
  }

  /* 📄 PDF sem gráficos */
  function exportPDF() {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Relatório de Chamados", 14, 18)

    autoTable(doc, {
      startY: 28,
      head: [["ID", "Título", "Setor", "Status", "Responsável", "Data"]],
      body: dadosFiltrados.map(c => [
        c.id,
        c.title || "Sem título",
        c.createdBy?.sector?.name || "Sem setor",
        STATUS_MAP[c.status] || c.status,
        c.assignedTo ? c.assignedTo.name : "Não atribuído",
        new Date(c.createdAt).toLocaleDateString('pt-BR'),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [198, 40, 40] },
    })

    doc.save("relatorio_chamados.pdf")
  }

  /* 📊 Excel */
  function exportExcel() {
    const dados = dadosFiltrados.map(c => ({
      ID: c.id,
      Título: c.title || "Sem título",
      Setor: c.createdBy?.sector?.name || "Sem setor",
      Status: STATUS_MAP[c.status] || c.status,
      Responsável: c.assignedTo ? c.assignedTo.name : "Não atribuído",
      Data: new Date(c.createdAt).toLocaleDateString('pt-BR'),
      Prioridade: c.priority || "N/A"
    }))

    const ws = XLSX.utils.json_to_sheet(dados)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Chamados")
    XLSX.writeFile(wb, "relatorio_chamados.xlsx")
  }

  if (loading) {
    return (
      <main className={styles.container}>
        <div className={styles.loadingState}>
          <p>Carregando relatórios...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className={styles.container}>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button onClick={carregarDados}>Tentar novamente</button>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Relatórios</h1>
          <p>Visão consolidada dos chamados por período, setor e responsável.</p>
        </div>
        <div className={styles.actions}>
          <button className={styles.pdfButton} onClick={exportPDF}>Exportar PDF</button>
          <button className={styles.excelButton} onClick={exportExcel}>Exportar Excel</button>
        </div>
      </header>

      <section className={styles.kpis}>
        <article className={styles.kpiCard}>
          <span>Total de chamados</span>
          <strong>{totalChamados}</strong>
        </article>
        <article className={styles.kpiCard}>
          <span>Em atendimento</span>
          <strong>{emAtendimento}</strong>
        </article>
        <article className={styles.kpiCard}>
          <span>Tempo médio</span>
          <strong>{tempoMedio}h</strong>
        </article>
        <article className={styles.kpiCard}>
          <span>Taxa de resolução</span>
          <strong>{taxaResolucao}%</strong>
        </article>
      </section>

      {/* Filtros */}
      <section className={styles.filters}>
        <div className={styles.filtersHeader}>
          <h2>Filtros do relatório</h2>
          {hasActiveFilters && (
            <button className={styles.clearFilters} onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </div>

        <div className={styles.filterGrid}>
        <div className={styles.field}>
          <label>Data início</label>
          <div className={styles.inputWithIcon}>
            <span className={styles.fieldIcon}><FaCalendarAlt /></span>
            <input type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
          </div>
        </div>

        <div className={styles.field}>
          <label>Data fim</label>
          <div className={styles.inputWithIcon}>
            <span className={styles.fieldIcon}><FaCalendarAlt /></span>
            <input type="date" value={dataFim} onChange={e => setDataFim(e.target.value)} />
          </div>
        </div>

        <div className={styles.field}>
          <label>Setor</label>
          <div className={styles.inputWithIcon}>
            <span className={styles.fieldIcon}><FaBuilding /></span>
            <select className={styles.filterSelect} value={setor} onChange={e => setSetor(e.target.value)}>
              <option value="">Todos os setores</option>
              {setores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label>Responsável</label>
          <div className={styles.inputWithIcon}>
            <span className={styles.fieldIcon}><FaUser /></span>
            <select className={styles.filterSelect} value={responsavel} onChange={e => setResponsavel(e.target.value)}>
              <option value="">Todos os responsáveis</option>
              {usuarios.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        </div>
        </div>

        <div className={styles.filtersSummary}>
          <span><FaFilter /> {dadosFiltrados.length} chamado(s) após filtros</span>
          {hasActiveFilters && <span>Filtros ativos aplicados</span>}
        </div>
      </section>

      {/* Gráficos */}
      <section className={styles.graficos}>
        {dadosFiltrados.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Nenhum chamado encontrado com os filtros aplicados.</p>
            <button onClick={limparFiltros}>Limpar filtros</button>
          </div>
        ) : (
          <>
        <div className={styles.card}>
          <h3>Chamados por setor</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={porSetor}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="setor" tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={{ stroke: "var(--color-border)" }} />
              <YAxis tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }} axisLine={{ stroke: "var(--color-border)" }} tickLine={{ stroke: "var(--color-border)" }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-bg-secondary)" }} />
              <Bar dataKey="total" name="Chamados" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {porSetor.map(item => (
              <span key={item.setor} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: "var(--color-primary)" }} />
                {item.setor}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h3>Status dos chamados</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={porStatus} dataKey="total" nameKey="status" label outerRadius={92} innerRadius={48} paddingAngle={3}>
                {porStatus.map((item) => (
                  <Cell key={item.status} fill={getStatusColor(item.status)} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {porStatus.map((item) => (
              <span key={item.status} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ backgroundColor: getStatusColor(item.status) }} />
                {item.status}
              </span>
            ))}
          </div>
        </div>
          </>
        )}
      </section>
    </main>
  )
}

export default Relatorios
