/**
 * chamados.jsx — Página principal de gerenciamento de chamados.
 *
 * Funcionalidades:
 *   - Listagem com dois modos de visualização: tabela (list) e grade (grid)
 *   - Filtros combinados: status, prioridade, SLA, setor e busca textual/por ID
 *   - Paginação client-side (5 itens por página)
 *   - Abertura de modal de criação e de detalhes de chamado
 *   - Suporte a deep-link via location.state.openTicketId (navegação vinda de notificações)
 */
import { useState, useEffect } from "react"
import styles from "./chamados.module.css"
import { Link, useLocation, useNavigate } from "react-router-dom"
import CriarChamadoModal from "./components/criarChamado/criarChamadoModal"
import DetalhesChamadoModal from "./components/detalhesChamado/detalhesChamadoModal"
import { FaEye, FaList, FaThLarge, FaSearch, FaFilter, FaFlag, FaBuilding } from "react-icons/fa"
import Pagination from "../../components/paginacao/paginacao"
import { ticketsAPI } from "../../utils/api"
import { getUserPermissions } from "../../utils/settings"
import SlaBadge from "../../components/SlaBadge/slaBadge"


function Chamados() {
    // ─── Estados de controle de modais ───────────────────────────────────────
    const [openCreate, setOpenCreate] = useState(false)     // exibe modal de criar chamado
    const [openDetails, setOpenDetails] = useState(false)   // exibe modal de detalhes
    const [selectedChamado, setSelectedChamado] = useState(null) // chamado selecionado para detalhes

    // ─── Modo de visualização da listagem ────────────────────────────────────
    const [viewMode, setViewMode] = useState("list")         // 'list' | 'grid'

    // ─── Filtros ativos ──────────────────────────────────────────────────────
    const [statusFilter, setStatusFilter] = useState("")
    const [priorityFilter, setPriorityFilter] = useState("")
    const [slaFilter, setSlaFilter] = useState("")
    const [setorFilter, setSetorFilter] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [setoresDisponiveis, setSetoresDisponiveis] = useState([])

    // ─── Dados e estado de carregamento ──────────────────────────────────────
    const [chamados, setChamados] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Permissões do usuário — usadas para controlar ações disponíveis no modal
    const [permissoes, setPermissoes] = useState(() => getUserPermissions())
    const location = useLocation()
    const navigate = useNavigate()

    // ─── Paginação client-side ───────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    // Carrega a lista completa de chamados ao montar
    useEffect(() => {
      loadChamados()
    }, [])

    // Deep-link: abre automaticamente o modal de detalhes se vier openTicketId no state
    // Exemplo: navegação a partir do clique em uma notificação
    useEffect(() => {
      const openTicketId = location.state?.openTicketId
      if (!openTicketId || chamados.length === 0) return

      const ticket = chamados.find((item) => item.id === Number(openTicketId))
      if (ticket) {
        setSelectedChamado(ticket)
        setOpenDetails(true)
      }

      // Limpa o state da rota para evitar reabrir no próximo render
      navigate(location.pathname, { replace: true, state: {} })
    }, [location.state, location.pathname, chamados, navigate])

    // Atualiza permissões quando as configurações mudam (outra aba ou evento interno)
    useEffect(() => {
      const refreshPermissoes = () => setPermissoes(getUserPermissions())
      window.addEventListener("storage", refreshPermissoes)
      window.addEventListener("config-updated", refreshPermissoes)
      return () => {
        window.removeEventListener("storage", refreshPermissoes)
        window.removeEventListener("config-updated", refreshPermissoes)
      }
    }, [])

    async function loadChamados() {
      try {
        const response = await ticketsAPI.getAll()
        setChamados(response.data)
      } catch (err) {
        setError('Erro ao carregar chamados')
      } finally {
        setLoading(false)
      }
    }

    // Recarrega a lista e fecha o modal após criar um chamado com sucesso
    function handleChamadoCreated() {
      loadChamados()
      setOpenCreate(false)
    }

    // Carrega setores para o filtro — prioriza localStorage, cai em lista padrão
    useEffect(() => {
      const setoresSalvos = localStorage.getItem("setores")
      if (setoresSalvos) {
        setSetoresDisponiveis(JSON.parse(setoresSalvos))
      } else {
        // Fallback com setores fixos quando não há dado no localStorage
        const setoresPadrao = ["TI", "Administrativo", "RH", "Financeiro", "Manutenção", "Produção", "Engenharia", "Qualidade", "Direção"]
        setSetoresDisponiveis(setoresPadrao)
      }
    }, [])

  // ─── Filtragem combinada — todos os critérios devem ser satisfeitos (AND) ──
  const filteredChamados = chamados.filter(chamado => {
    const matchesStatus = !statusFilter || chamado.status === statusFilter
    const matchesPriority = !priorityFilter || chamado.priority === priorityFilter
    const matchesSla = !slaFilter || chamado.slaStatus === slaFilter
    const matchesSetor = !setorFilter || chamado.createdBy?.sector?.name === setorFilter
    // Busca por título (substring case-insensitive) OU por ID exato
    const matchesSearch = !searchTerm ||
      chamado.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chamado.id == Number(searchTerm)

    return matchesStatus && matchesPriority && matchesSla && matchesSearch && matchesSetor
  })

  // Ordena por data de criação (mais antigo primeiro) e fatia para a página atual
  const ultimosChamados = [...filteredChamados]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const paginatedChamados = ultimosChamados.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredChamados.length / itemsPerPage)

  // Indica se algum filtro está ativo (para exibir botão "Limpar filtros")
  const hasActiveFilters = Boolean(statusFilter || priorityFilter || slaFilter || setorFilter || searchTerm)

  /** Reseta todos os filtros e volta para a primeira página. */
  function limparFiltros() {
    setStatusFilter("")
    setPriorityFilter("")
    setSlaFilter("")
    setSetorFilter("")
    setSearchTerm("")
    setCurrentPage(1)
  }

  // Estados de carregamento antes de renderizar o layout
  if (loading) {
    return <div className={styles.loading}>Carregando chamados...</div>
  }

  if (error) {
    return <div className={styles.error}>{error}</div>
  }
  
  return (
    <main className={styles.container}>
      {/* Header da página */}
    <section className={styles.pageHeader}>
        <h1>Chamados</h1>

        <div className={styles.headerActions}>

            <Link
              onClick={() => setOpenCreate(true)}
              className={styles.newTicket}
            >
              + Novo Chamado
            </Link>
        </div>
    </section>

      {/* Filtros */}
      <section className={styles.filters}>



        <div className={styles.filtersGrid}>
          <div className={styles.filterField}>
            <label htmlFor="statusFilter">Status</label>
            <div className={styles.inputWithIcon}>
              <span className={styles.fieldIcon}><FaFilter /></span>
              <select
                id="statusFilter"
                className={styles.filterSelect}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="open">Aberto</option>
                <option value="in-progress">Em atendimento</option>
                <option value="closed">Resolvido</option>
              </select>
            </div>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="priorityFilter">Prioridade</label>
            <div className={styles.inputWithIcon}>
              <span className={styles.fieldIcon}><FaFlag /></span>
              <select
                id="priorityFilter"
                className={styles.filterSelect}
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">Todas</option>
                <option value="high">Alta</option>
                <option value="medium">Média</option>
                <option value="low">Baixa</option>
              </select>
            </div>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="setorFilter">Setor</label>
            <div className={styles.inputWithIcon}>
              <span className={styles.fieldIcon}><FaBuilding /></span>
              <select
                id="setorFilter"
                className={styles.filterSelect}
                value={setorFilter}
                onChange={(e) => setSetorFilter(e.target.value)}
              >
                <option value="">Todos</option>
                {setoresDisponiveis.map((setor) => (
                  <option key={setor} value={setor}>{setor}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="slaFilter">SLA</label>
            <div className={styles.inputWithIcon}>
              <span className={styles.fieldIcon}><FaFilter /></span>
              <select
                id="slaFilter"
                className={styles.filterSelect}
                value={slaFilter}
                onChange={(e) => setSlaFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="ok">No prazo</option>
                <option value="warning">Em risco</option>
                <option value="violated">Violado</option>
              </select>
            </div>
          </div>

          <div className={`${styles.filterField} ${styles.searchField}`}>
            <label htmlFor="searchTerm">Busca rápida</label>
            <div className={styles.inputWithIcon}>
              <span className={styles.fieldIcon}><FaSearch /></span>
              <input
                id="searchTerm"
                type="text"
                placeholder="Buscar por título ou ID"
                value={searchTerm}
                maxLength="100"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>


                <div className={styles.filtersTop}>
                  <div className={styles.filtersSummary}>
          <span>{filteredChamados.length} chamado(s) encontrado(s)</span>
          {hasActiveFilters && <span>Filtros ativos aplicados</span>}
        </div>
          <div className={styles.headerActions}>
            {hasActiveFilters && (
              <button className={styles.clearFilters} onClick={limparFiltros}>
                Limpar filtros
              </button>
            )}

            <button
              className={`${styles.viewToggle} ${viewMode === "list" ? styles.active : ""}`}
              onClick={() => setViewMode("list")}
              title="Visualização em lista"
            >
              <FaList />
            </button>

            <button
              className={`${styles.viewToggle} ${viewMode === "grid" ? styles.active : ""}`}
              onClick={() => setViewMode("grid")}
              title="Visualização em grade"
            >
              <FaThLarge />
            </button>
          </div>
        
        </div>

      </section>


    {/* Tabela */}
    {viewMode === "list" && (
        <table className={styles.table}>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                    <th>Setor</th>
                    <th>Responsável</th>
                    <th>SLA</th>
                    <th>Atualizado</th>
                    <th>Ações</th>
                </tr>
            </thead>

            <tbody>
                {paginatedChamados.map((chamado) => (
                    <tr key={chamado.id}>
                        <td>#{chamado.id}</td>
                        <td>{chamado.title}</td>
                        <td>
                            <span
                                className={`${styles.badge} ${styles[chamado.status.replace("-", "").toLowerCase()]}`}
                            >
                                {chamado.status === 'open' ? 'Aberto' :
                                 chamado.status === 'in-progress' ? 'Em andamento' :
                                 chamado.status === 'closed' ? 'Fechado' : chamado.status}
                            </span>
                        </td>
                        <td>
                            <span
                                className={`${styles.badge} ${styles[chamado.priority]}`}
                            >
                                {chamado.priority === 'low' ? 'Baixa' :
                                 chamado.priority === 'medium' ? 'Média' :
                                 chamado.priority === 'high' ? 'Alta' : chamado.priority}
                            </span>
                        </td>
                        <td>{chamado.createdBy?.sector?.name ?? 'Error'}</td>
                        <td>{chamado.createdBy?.name || 'N/A'}</td>
                        <td>
                          <SlaBadge
                            slaDeadline={chamado.slaDeadline}
                            slaStatus={chamado.slaStatus}
                            slaViolated={chamado.slaViolated}
                            ticketStatus={chamado.status}
                          />
                        </td>
                        <td>{new Date(chamado.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td>
                            <Link onClick={() => {
                                setSelectedChamado(chamado)
                                setOpenDetails(true)
                            }} className={styles.viewBtn}><FaEye/></Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )}

    {viewMode === "list" && (
           <Pagination
            totalItems={filteredChamados.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
    )}

          {viewMode === "grid" && (
              <section className={styles.grid}>
                  <div className={styles.cardsGrid}>
                        {ultimosChamados.map((chamado) => (
                                    <div
                                    key={chamado.id}
                                    className={styles.card}
                                    onClick={() => {
                                        setSelectedChamado(chamado)
                                        setOpenDetails(true)
                                    }}
                                    >
                                    {/* Header */}
                                    <div className={styles.cardHeader}>
                                        <span className={styles.ticketId}>#{chamado.id}</span>

                                        <span
                                        className={`${styles.badge} ${styles[chamado.status
                                            .replace("-", "")
                                            .toLowerCase()]}`}
                                        >
                                        {chamado.status === 'open' ? 'Aberto' :
                                         chamado.status === 'in-progress' ? 'Em andamento' :
                                         chamado.status === 'closed' ? 'Fechado' : chamado.status}
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h3 className={styles.cardTitle}>{chamado.title}</h3>

                                    {/* Infos */}
                                    <div className={styles.cardInfo}>
                                        <div>
                                        <strong>Prioridade</strong>
                                        <span
                                            className={`${styles.priority} ${styles[chamado.priority]}`}
                                        >
                                            {chamado.priority === 'low' ? 'Baixa' :
                                             chamado.priority === 'medium' ? 'Média' :
                                             chamado.priority === 'high' ? 'Alta' : chamado.priority}
                                        </span>
                                        </div>

                                        <div>
                                        <strong>Criado por</strong>
                                        <span>{chamado.createdBy?.name || 'N/A'}</span>
                                        </div>

                                        <div>
                                        <strong>SLA</strong>
                                        <SlaBadge
                                          slaDeadline={chamado.slaDeadline}
                                          slaStatus={chamado.slaStatus}
                                          slaViolated={chamado.slaViolated}
                                          ticketStatus={chamado.status}
                                        />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className={styles.cardFooter}>
                                        <span className={styles.update}>
                                        Criado: {new Date(chamado.createdAt).toLocaleDateString('pt-BR')}
                                        </span>

                                        <button
                                          className={styles.viewBtn}
                                          onClick={() => {
                                            setSelectedChamado(chamado)
                                            setOpenDetails(true)
                                          }}
                                        >
                                          Ver detalhes
                                        </button>
                                    </div>
                                    </div>
                                ))}
                            </div>
                          </section>
                      )}


        <CriarChamadoModal
            isOpen={openCreate}
            onClose={() => setOpenCreate(false)}
            onCreated={handleChamadoCreated}
        />

        <DetalhesChamadoModal
            isOpen={openDetails}
            onClose={() => setOpenDetails(false)}
            chamado={selectedChamado}
            onUpdated={loadChamados}
          permissoes={permissoes}
        />

       

    </main>
  )
}

export default Chamados
