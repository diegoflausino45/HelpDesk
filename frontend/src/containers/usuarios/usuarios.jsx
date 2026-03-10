import styles from "./usuarios.module.css"
import { useState, useEffect } from "react"
import { FaEye, FaEdit, FaTrash } from "react-icons/fa"
import Modal from "../../components/Modal/modal"
import ConfirmDialog from "../../components/Modal/confirmDialog"
import CreateUser from "./components/criarUsuarioModal"
import EditUser from "./components/editarUsuarioModal"
import Pagination from "../../components/paginacao/paginacao"
import { usersAPI, sectorsAPI } from "../../utils/api"
import { getUserPermissions } from "../../utils/settings"
import toast from "react-hot-toast"

function Usuarios() {
  const [busca, setBusca] = useState("")
  const [perfil, setPerfil] = useState("")
  const [status, setStatus] = useState("")
  const [setorFilter, setSetorFilter] = useState("")
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([])


  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false)
  const [usuarioParaExcluir, setUsuarioParaExcluir] = useState(null)
  const [excluindoUsuario, setExcluindoUsuario] = useState(false)
  const [permissoes, setPermissoes] = useState(() => getUserPermissions())

  // Paginação
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const usuarioLogado = {
    perfil: permissoes.isAdmin ? "Admin" : (permissoes.isTechnician ? "Técnico" : "Usuário"),
  }

  // Função helper para traduzir roles
  const translateRole = (role) => {
    const roles = {
      'admin': 'Admin',
      'technician': 'Técnico',
      'user': 'Usuário'
    }
    return roles[role] || role
  }

  useEffect(() => {
    const refreshPermissoes = () => setPermissoes(getUserPermissions())
    window.addEventListener("storage", refreshPermissoes)
    window.addEventListener("config-updated", refreshPermissoes)
    return () => {
      window.removeEventListener("storage", refreshPermissoes)
      window.removeEventListener("config-updated", refreshPermissoes)
    }
  }, [])

  useEffect(() => {
    if (!permissoes.canManageUsers) {
      setLoading(false)
      return
    }

    fetchUsuarios()
    fetchSetores()
  }, [permissoes.canManageUsers])

  const fetchSetores = async () => {
    try {
      const response = await sectorsAPI.getAll()
      setSetoresDisponiveis(response.data)
    } catch (error) {
      toast.error("Erro ao carregar setores")
    }
  }

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

  const handleDeleteUser = async (user) => {
    if (!permissoes.canManageUsers) {
      toast.error("Você não tem permissão para excluir usuários")
      return
    }

    // Abrir modal de confirmação
    setUsuarioParaExcluir(user)
    setMostrarModalExcluir(true)
  }

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

  const handleEditUser = (user) => {
    if (!permissoes.canManageUsers) {
      toast.error("Você não tem permissão para editar usuários")
      return
    }

    setUsuarioSelecionado(user)
    setOpenEdit(true)
  }

  const usuariosFiltrados = usuarios.filter(u => {
    const texto =
      u.name.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())

    const setorOk = !setorFilter || u.sector?.name === setorFilter
    const perfilOk = !perfil || u.role === perfil
    // const statusOk = !status || u.status === status  // Remover pois não há status no banco

    return texto && perfilOk && setorOk// && statusOk
  })

  // Aplicar paginação
  const paginatedUsuarios = usuariosFiltrados.slice(startIndex, endIndex)

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
        <section className={styles.filters}>
          <p>Limite de usuários ativos atingido ({usuarios.length}/{permissoes.config.usuarios.maxUsuariosAtivos}).</p>
        </section>
      )}

      {/* Filtros */}
      <section className={styles.filters}>
        <input
          type="text"
          placeholder="Buscar por nome ou email"
          value={busca}
          maxLength="100"
          onChange={e => setBusca(e.target.value)}
        />

        <select className={styles.filterSelect} value={perfil} onChange={e => setPerfil(e.target.value)}>
          <option value="">Perfil</option>
          <option value="admin">Admin</option>
          <option value="technician">Técnico</option>
          <option value="user">Usuário</option>
        </select>

        <select className={styles.filterSelect} value={setorFilter} onChange={(e) => setSetorFilter(e.target.value)}>
          <option value="">Setor</option>
          {setoresDisponiveis.map((setor) => (
            <option key={setor.id} value={setor.name}>{setor.name}</option>
          ))}
        </select>
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
