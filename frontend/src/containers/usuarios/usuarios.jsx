import styles from "./usuarios.module.css"
import { useState, useEffect } from "react"
import { FaEdit, FaTrash, FaSearch, FaUser, FaBuilding } from "react-icons/fa"
import Modal from "../../components/Modal/modal"
import ConfirmDialog from "../../components/Modal/confirmDialog"
import CreateUser from "./components/criarUsuarioModal"
import EditUser from "./components/editarUsuarioModal"
import Pagination from "../../components/paginacao/paginacao"
import { usersAPI, sectorsAPI } from "../../utils/api"
import { getUserPermissions } from "../../utils/settings"
import toast from "react-hot-toast"

function Usuarios() {
  // Estados de filtros da listagem
  const [busca, setBusca] = useState("")
  const [perfil, setPerfil] = useState("")
  const [setorFilter, setSetorFilter] = useState("")
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([])

  // Estados de dados e carregamento
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  // Estados de modais e fluxo de edição/exclusão
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false)
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null)
  const [excluindoUsuario, setExcluindoUsuario] = useState(false)

  // Permissões do usuário logado (sincronizadas com storage/configuração)
  const [permissoes, setPermissoes] = useState(() => getUserPermissions())

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  // Perfil simplificado para regras de UI no modal de edição
  const usuarioLogado = {
    perfil: permissoes.isAdmin ? "Admin" : (permissoes.isTechnician ? "Técnico" : "Usuário"),
  }

  // Traduz a role vinda da API para um texto amigável na tabela
  const translateRole = (role) => {
    const roles = {
      'admin': 'Admin',
      'technician': 'Técnico',
      'user': 'Usuário'
    }
    return roles[role] || role
  }

  useEffect(() => {
    // Mantém permissões atualizadas quando houver mudança local
    // (outra aba alterando storage / tela de configurações alterando regras)
    const refreshPermissoes = () => setPermissoes(getUserPermissions())
    window.addEventListener("storage", refreshPermissoes)
    window.addEventListener("config-updated", refreshPermissoes)
    return () => {
      window.removeEventListener("storage", refreshPermissoes)
      window.removeEventListener("config-updated", refreshPermissoes)
    }
  }, [])

  useEffect(() => {
    // Evita chamadas de API desnecessárias quando o usuário não tem acesso
    if (!permissoes.canManageUsers) {
      setLoading(false)
      return
    }

    // Carrega lista de usuários e setores no primeiro acesso permitido
    fetchUsuarios()
    fetchSetores()
  }, [permissoes.canManageUsers])

  // Busca setores para popular o filtro e formulários
  const fetchSetores = async () => {
    try {
      const response = await sectorsAPI.getAll()
      setSetoresDisponiveis(response.data)
    } catch (error) {
      toast.error("Erro ao carregar setores")
    }
  }

  // Busca usuários para listagem principal
  const fetchUsuarios = async () => {
    try {
      const response = await usersAPI.getAll()
      setUsuarios(response.data)
    } catch (error) {
      toast.error("Erro ao carregar usuários")
    } finally {
      setLoading(false)
    }
  }

  // Cria usuário no backend e atualiza a tabela após sucesso
  const handleCreateUser = async (userData) => {
    try {
      const data = {
        name: userData.nome,
        email: userData.email,
        password: userData.senha,
        role: userData.perfil.toLowerCase(),
        sectorId: userData.setor ? parseInt(userData.setor) : null,
      }
      await usersAPI.create(data)
      toast.success("Usuário criado com sucesso!")
      setOpenCreate(false)
      fetchUsuarios() // Recarregar lista
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao criar usuário")
    }
  }

  // Inicia fluxo de exclusão (com confirmação)
  const handleDeleteUser = async (user) => {
    if (!permissoes.canManageUsers) {
      toast.error("Você não tem permissão para excluir usuários")
      return
    }

    // Abre modal para confirmação explícita antes de excluir
    setUsuarioParaExcluir(user)
    setMostrarModalExcluir(true)
  }

  // Confirma a exclusão, executa na API e recarrega a lista
  const confirmarExclusao = async () => {
    try {
      setExcluindoUsuario(true)
      await usersAPI.delete(usuarioParaExcluir.id)
      toast.success("Usuário excluído com sucesso!")
      setMostrarModalExcluir(false)
      setUsuarioParaExcluir(null)
      fetchUsuarios() // Recarregar lista
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao excluir usuário")
    } finally {
      setExcluindoUsuario(false)
    }
  }

  // Inicia fluxo de edição do usuário selecionado
  const handleEditUser = (user) => {
    if (!permissoes.canManageUsers) {
      toast.error("Você não tem permissão para editar usuários")
      return
    }

    setUsuarioSelecionado(user)
    setOpenEdit(true)
  }

  // Filtragem combinada por texto, perfil e setor
  // Regras:
  // - Texto procura em nome OU email
  // - Perfil e setor só filtram quando possuem valor selecionado
  const usuariosFiltrados = usuarios.filter(u => {
    const texto =
      u.name.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())

    const setorOk = !setorFilter || u.sector?.name === setorFilter
    const perfilOk = !perfil || u.role === perfil

    return texto && perfilOk && setorOk
  })

  // Paginação aplicada sobre o resultado já filtrado
  const paginatedUsuarios = usuariosFiltrados.slice(startIndex, endIndex)

  // Controla UI de "Limpar filtros" e indicador de filtros ativos
  const hasActiveFilters = Boolean(busca || perfil || setorFilter)

  // Reseta filtros e volta para a primeira página
  const limparFiltros = () => {
    setBusca("")
    setPerfil("")
    setSetorFilter("")
    setCurrentPage(1)
  }

  // Guarda de acesso: bloqueia conteúdo para perfis sem permissão
  if (!permissoes.canManageUsers) {
    return (
      <main className={styles.container}>
        <section className={styles.pageHeader}>
          <h1>Usuários</h1>
        </section>
        <p>Seu perfil não possui permissão para gerenciar usuários.</p>
      </main>
    )
  }

  // Regra de limite de usuários ativos (configurável; fallback 500)
  const limiteUsuariosAtingido = usuarios.length >= (permissoes.config.usuarios.maxUsuariosAtivos || 500)

  return (
    <main className={styles.container}>
      {/* Header */}
      <section className={styles.pageHeader}>
        <h1>Usuários</h1>

        {permissoes.canInviteUsers && (
          <button
            className={styles.newUser}
            onClick={() => setOpenCreate(true)}
            disabled={limiteUsuariosAtingido}
            title={limiteUsuariosAtingido ? "Limite de usuários ativos atingido" : "Criar novo usuário"}
          >
            + Novo Usuário
          </button>
        )}
      </section>

      {limiteUsuariosAtingido && (
        <section className={styles.warningBanner}>
          <p>Limite de usuários ativos atingido ({usuarios.length}/{permissoes.config.usuarios.maxUsuariosAtivos}).</p>
        </section>
      )}

      {/* Filtros */}
      <section className={styles.filters}>
        <div className={styles.filtersHeader}>
          <h3 className={styles.filtersTitle}>Filtros inteligentes</h3>
          {hasActiveFilters && (
            <button className={styles.clearFilters} onClick={limparFiltros}>
              Limpar filtros
            </button>
          )}
        </div>

        <div className={styles.filtersGrid}>
          <div className={`${styles.filterField} ${styles.searchField}`}>
            <label htmlFor="buscaUsuario">Busca rápida</label>
            <div className={styles.inputWithIcon}>
              <span className={styles.fieldIcon}><FaSearch /></span>
              <input
                id="buscaUsuario"
                type="text"
                placeholder="Buscar por nome ou email"
                value={busca}
                maxLength="100"
                onChange={e => setBusca(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="perfilUsuario">Perfil</label>
            <div className={styles.inputWithIcon}>
              <span className={styles.fieldIcon}><FaUser /></span>
              <select id="perfilUsuario" className={styles.filterSelect} value={perfil} onChange={e => setPerfil(e.target.value)}>
                <option value="">Todos</option>
                <option value="admin">Admin</option>
                <option value="technician">Técnico</option>
                <option value="user">Usuário</option>
              </select>
            </div>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="setorUsuario">Setor</label>
            <div className={styles.inputWithIcon}>
              <span className={styles.fieldIcon}><FaBuilding /></span>
              <select id="setorUsuario" className={styles.filterSelect} value={setorFilter} onChange={(e) => setSetorFilter(e.target.value)}>
                <option value="">Todos</option>
                {setoresDisponiveis.map((setor) => (
                  <option key={setor.id} value={setor.name}>{setor.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.filtersSummary}>
          <span>{usuariosFiltrados.length} usuário(s) encontrado(s)</span>
          {hasActiveFilters && <span>Filtros ativos aplicados</span>}
        </div>
      </section>

      {/* Tabela */}
      {loading ? (
        <p>Carregando usuários...</p>
      ) : (
        <>
          <table className={styles.table}>
            <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Setor</th>
              <th>Último acesso</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsuarios.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{translateRole(user.role)}</td>
                <td>{user.sector?.name || 'N/A'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className={styles.actions}>

                  {permissoes.canManageUsers && (
                    <button
                      className={styles.editBtn}
                      onClick={() => handleEditUser(user)}
                      title="Editar usuário"
                    >
                      <FaEdit />
                    </button>
                  )}

                  {permissoes.canManageUsers && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteUser(user)}
                      title="Excluir usuário"
                    >
                      <FaTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          totalItems={usuariosFiltrados.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        </>
      )}

      {/* Modal Criar */}
      <Modal
        isOpen={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Criar Usuário"
      >
        <CreateUser onClose={() => setOpenCreate(false)} onCreate={handleCreateUser} />
      </Modal>

      {/* Modal Editar */}
      <Modal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        title="Editar Usuário"
      >
        <EditUser
          usuario={usuarioSelecionado}
          usuarioLogado={usuarioLogado}
          onClose={() => setOpenEdit(false)}
          onUpdated={fetchUsuarios}
        />
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={mostrarModalExcluir}
        onClose={() => {
          setMostrarModalExcluir(false)
          setUsuarioParaExcluir(null)
        }}
        onConfirm={confirmarExclusao}
        title="Confirmar Exclusão de Usuário"
        message={`Tem certeza que deseja excluir o usuário "${usuarioParaExcluir?.name}"? Esta ação não pode ser desfeita e todos os dados associados a este usuário serão perdidos.`}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
        variant="delete"
        isLoading={excluindoUsuario}
      />
    </main>
  )
}

export default Usuarios
