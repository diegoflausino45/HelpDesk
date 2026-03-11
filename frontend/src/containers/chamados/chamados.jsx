import { useState, useEffect } from "react"
import styles from "./chamados.module.css"
import { Link } from "react-router-dom"
import CriarChamadoModal from "./components/criarChamado/criarChamadoModal"
import DetalhesChamadoModal from "./components/detalhesChamado/detalhesChamadoModal"
import { FaEye, FaList, FaThLarge, FaSearch, FaFilter, FaFlag, FaBuilding } from "react-icons/fa"
import Pagination from "../../components/paginacao/paginacao"
import { ticketsAPI } from "../../utils/api"
import { getUserPermissions } from "../../utils/settings"


function Chamados() {
    const [openCreate, setOpenCreate] = useState(false)
    const [openDetails, setOpenDetails] = useState(false)
    const [selectedChamado, setSelectedChamado] = useState(null)
    const [viewMode, setViewMode] = useState("list")
    const [statusFilter, setStatusFilter] = useState("")
    const [priorityFilter, setPriorityFilter] = useState("")
    const [setorFilter, setSetorFilter] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [setoresDisponiveis, setSetoresDisponiveis] = useState([])
    const [chamados, setChamados] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [permissoes, setPermissoes] = useState(() => getUserPermissions())

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage

    // Carregar chamados da API
    useEffect(() => {
      loadChamados()
    }, [])

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

    // Recarregar chamados após criar um novo
    function handleChamadoCreated() {
      loadChamados()
      setOpenCreate(false)
    }

    // Carregar setores do localStorage
    useEffect(() => {
      const setoresSalvos = localStorage.getItem("setores")
      if (setoresSalvos) {
        setSetoresDisponiveis(JSON.parse(setoresSalvos))
      } else {
        // Setores padrão se não houver no localStorage
        const setoresPadrao = ["TI", "Administrativo", "RH", "Financeiro", "Manutenção", "Produção", "Engenharia", "Qualidade", "Direção"]
        setSetoresDisponiveis(setoresPadrao)
      }
    }, [])

  // Filtrar chamados
  const filteredChamados = chamados.filter(chamado => {
    const matchesStatus = !statusFilter || chamado.status === statusFilter
    const matchesPriority = !priorityFilter || chamado.priority === priorityFilter
    const matchesSetor = !setorFilter || chamado.createdBy?.sector?.name === setorFilter
    const matchesSearch = !searchTerm ||
      chamado.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chamado.id == Number(searchTerm)

    return matchesStatus && matchesPriority && matchesSearch && matchesSetor
  })

  const ultimosChamados = [...filteredChamados]
.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  const paginatedChamados = ultimosChamados.slice(startIndex, endIndex)
  const totalPages = Math.ceil(filteredChamados.length / itemsPerPage)
  const hasActiveFilters = Boolean(statusFilter || priorityFilter || setorFilter || searchTerm)

  function limparFiltros() {
    setStatusFilter("")
    setPriorityFilter("")
    setSetorFilter("")
    setSearchTerm("")
    setCurrentPage(1)
  }

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
