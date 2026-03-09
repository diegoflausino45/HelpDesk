import styles from "./usuarios.module.css"
import { useState, useEffect } from "react"
import { FaEye, FaEdit } from "react-icons/fa"
import Modal from "../../components/Modal/modal"
import CreateUser from "./components/criarUsuarioModal"
import EditUser from "./components/editarUsuarioModal"
import { usersAPI, sectorsAPI } from "../../utils/api"
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

  const usuarioLogado = {
    perfil: "Admin",
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
    fetchUsuarios()
    fetchSetores()
  }, [])

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

  const usuariosFiltrados = usuarios.filter(u => {
    const texto =
      u.name.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())

    const setorOk = !setorFilter || u.sector?.name === setorFilter
    const perfilOk = !perfil || u.role === perfil
    // const statusOk = !status || u.status === status  // Remover pois não há status no banco

    return texto && perfilOk && setorOk// && statusOk
  })

  return (
    <main className={styles.container}>
      {/* Header */}
      <section className={styles.pageHeader}>
        <h1>Usuários</h1>

        {usuarioLogado.perfil === "Admin" && (
          <button
            className={styles.newUser}
            onClick={() => setOpenCreate(true)}
          >
            + Novo Usuário
          </button>
        )}
      </section>

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
          {usuariosFiltrados.map(user => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{translateRole(user.role)}</td>
              <td>{user.sector?.name || 'N/A'}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className={styles.actions}>

                {(usuarioLogado.perfil === "Admin" ||
                  (usuarioLogado.perfil === "Técnico" &&
                    user.role === "user")) && (
                  <button
                    onClick={() => {
                      setUsuarioSelecionado(user)
                      setOpenEdit(true)
                    }}
                  >
                    <FaEdit />
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    </main>
  )
}

export default Usuarios
