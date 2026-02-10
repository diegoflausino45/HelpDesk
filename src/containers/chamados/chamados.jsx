import styles from "./chamados.module.css"
import { Link } from "react-router-dom"
import CriarChamadoModal from "./components/criarChamado/criarChamadoModal"
import DetalhesChamadoModal from "./components/detalhesChamado/detalhesChamadoModal"
import { useState } from "react"
import { FaEye, FaList, FaThLarge } from "react-icons/fa"
import Pagination from "../../components/paginacao/paginacao"


function Chamados() {
    const [openCreate, setOpenCreate] = useState(false)
    const [openDetails, setOpenDetails] = useState(false)
    const [selectedChamado, setSelectedChamado] = useState(null)
    const [viewMode, setViewMode] = useState("list")
    const [statusFilter, setStatusFilter] = useState("")
const [priorityFilter, setPriorityFilter] = useState("")
const [searchTerm, setSearchTerm] = useState("")

const [currentPage, setCurrentPage] = useState(1)
const itemsPerPage = 5
const startIndex = (currentPage - 1) * itemsPerPage
const endIndex = startIndex + itemsPerPage


  const chamados = [
  {
    id: 1024,
    titulo: "Erro ao acessar o sistema",
    status: "Aberto",
    prioridade: "Alta",
    responsavel: "João",
    atualizado: "Hoje 14:22",
    setor: "TI",
  },
  {
    id: 1025,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Administrativo",
  },
   {
    id: 1026,
    titulo: "Erro ao acessar o sistema",
    status: "Aberto",
    prioridade: "Alta",
    responsavel: "João",
    atualizado: "Hoje 14:22",
    setor: "TI",
  },
  {
    id: 1027,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Administrativo",
  },
   {
    id: 1028,
    titulo: "Erro ao acessar o sistema",
    status: "Aberto",
    prioridade: "Alta",
    responsavel: "João",
    atualizado: "Hoje 14:22",
    setor: "TI",
  },
  {
    id: 1029,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Administrativo",
  },
   {
    id: 1030,
    titulo: "Erro ao acessar o sistema",
    status: "Aberto",
    prioridade: "Alta",
    responsavel: "João",
    atualizado: "Hoje 14:22",
    setor: "TI",
  },
  {
    id: 1031,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Manutenção",
  },
   {
    id: 1032,
    titulo: "Erro ao acessar o sistema",
    status: "Aberto",
    prioridade: "Alta",
    responsavel: "João",
    atualizado: "Hoje 14:22",
    setor: "Manutenção",
  },
  {
    id: 1033,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Manutenção",
  },
    {
    id: 1034,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Direção",
  },
   {
    id: 1035,
    titulo: "Erro ao acessar o sistema",
    status: "Aberto",
    prioridade: "Alta",
    responsavel: "João",
    atualizado: "Hoje 14:22",
    setor: "Manutenção",
  },
  {
    id: 1036,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Manutenção",
  },
    {
    id: 1037,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Produção",
  },
   {
    id: 1038,
    titulo: "Erro ao acessar o sistema",
    status: "Aberto",
    prioridade: "Alta",
    responsavel: "João",
    atualizado: "Hoje 14:22",
    setor: "Produção",
  },
  {
    id: 1039,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Produção",
  },
    {
    id: 1040,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Engenharia",
  },
   {
    id: 1041,
    titulo: "Erro ao acessar o sistema",
    status: "Aberto",
    prioridade: "Alta",
    responsavel: "João",
    atualizado: "Hoje 14:22",
    setor: "Engenharia",
  },
  {
    id: 1042,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Engenharia",
  },
      {
    id: 1043,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Qualidade",
  },
   {
    id: 1044,
    titulo: "Erro ao acessar o sistema",
    status: "Aberto",
    prioridade: "Alta",
    responsavel: "João",
    atualizado: "Hoje 14:22",
    setor: "Qualidade",
  },
  {
    id: 1045,
    titulo: "Email não sincroniza",
    status: "Em atendimento",
    prioridade: "Média",
    responsavel: "Maria",
    atualizado: "Ontem 16:10",
    setor: "Qualidade",
  },
]




const chamadosPorSetor = chamados.reduce((acc, chamado) => {
  if (!acc[chamado.setor]) {
    acc[chamado.setor] = []
  }
  acc[chamado.setor].push(chamado)
  return acc
}, {})

const chamadosFiltrados = chamados.filter((chamado) => {
  const matchStatus =
    !statusFilter || chamado.status === statusFilter

  const matchPriority =
    !priorityFilter || chamado.prioridade === priorityFilter

  const matchSearch =
    !searchTerm ||
    chamado.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chamado.id.toString().includes(searchTerm)

  return matchStatus && matchPriority && matchSearch
})

const chamadosPaginados = chamadosFiltrados.slice(startIndex, endIndex)
const totalItems = chamadosFiltrados.length

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
              <div className={styles.filters}>
                  <select onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">Status</option>
                    <option value="Aberto">Aberto</option>
                    <option value="Em atendimento">Em atendimento</option>
                    <option value="Resolvido">Resolvido</option>
                  </select>


                  <select onChange={(e) => setPriorityFilter(e.target.value)}>
                    <option value="">Prioridade</option>
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>



                  <input
                    type="text"
                    placeholder="Buscar por título ou ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

              </div>

              <div className={styles.headerActions}>
                  <button
                      className={`${styles.viewToggle} ${viewMode === "list" ? styles.active : ""}`}
                      onClick={() => setViewMode("list")}
                  >
                      <FaList />
                  </button>

                  <button
                      className={`${styles.viewToggle} ${viewMode === "grid" ? styles.active : ""}`}
                      onClick={() => setViewMode("grid")}
                  >
                      <FaThLarge />
                  </button>

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
                    <th>Responsável</th>
                    <th>Atualizado</th>
                    <th>Ações</th>
                </tr>
            </thead>

            <tbody>
                {chamadosPaginados.map((chamado) => (
                    <tr key={chamado.id}>
                        <td>#{chamado.id}</td>
                        <td>{chamado.titulo}</td>
                        <td>
                            <span
                                className={`${styles.badge} ${styles[chamado.status.replace(" ", "").toLowerCase()]}`}
                            >
                                {chamado.status}
                            </span>
                        </td>
                        <td>
                            <span
                                className={`${styles.badge} ${styles[chamado.prioridade.toLowerCase()]}`}
                            >
                                {chamado.prioridade}
                            </span>
                        </td>
                        <td>{chamado.responsavel}</td>
                        <td>{chamado.atualizado}</td>
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
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
    )}

          {viewMode === "grid" && (
              <section className={styles.grid}>
                  {Object.entries(chamadosPorSetor).map(([setor, lista]) => (
                      <div key={setor} className={styles.setor}>
                          <h2>{setor}</h2>

                          <div className={styles.cardsGrid}>
                                {chamadosPaginados.map((chamado) => (
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
                                            .replace(" ", "")
                                            .toLowerCase()]}`}
                                        >
                                        {chamado.status}
                                        </span>
                                    </div>

                                    {/* Título */}
                                    <h3 className={styles.cardTitle}>{chamado.titulo}</h3>

                                    {/* Infos */}
                                    <div className={styles.cardInfo}>
                                        <div>
                                        <strong>Prioridade</strong>
                                        <span
                                            className={`${styles.priority} ${styles[chamado.prioridade.toLowerCase()]}`}
                                        >
                                            {chamado.prioridade}
                                        </span>
                                        </div>

                                        <div>
                                        <strong>Responsável</strong>
                                        <span>{chamado.responsavel}</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className={styles.cardFooter}>
                                        <span className={styles.update}>
                                        Atualizado: {chamado.atualizado}
                                        </span>

                                        <button className={styles.viewBtn}>Ver detalhes</button>
                                    </div>
                                    </div>
                                ))}
                                </div>

                      </div>
                  ))}
              </section>
          )}


        <CriarChamadoModal
            isOpen={openCreate}
            onClose={() => setOpenCreate(false)}
        />

        <DetalhesChamadoModal
            isOpen={openDetails}
            onClose={() => setOpenDetails(false)}
            chamado={selectedChamado}
        />

       

    </main>
  )
}

export default Chamados
