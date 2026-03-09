import styles from "./usuarios.module.css"
import { useState, useEffect } from "react"
import { FaEye, FaEdit } from "react-icons/fa"
import Modal from "../../components/Modal/modal"
import CreateUser from "./components/criarUsuarioModal"
import EditUser from "./components/editarUsuarioModal"
import { usersAPI } from "../../utils/api"

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

  useEffect(() => {
    fetchUsuarios()
  }, [])

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

  const fetchUsuarios = async () => {
    try {
      const response = await usersAPI.getAll()
      setUsuarios(response.data)
    } catch (error) {
      // Erro silencioso - adicionar toast se necessário
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
      setOpenCreate(false)
      fetchUsuarios() // Recarregar lista
    } catch (error) {
      // Erro silencioso - adicionar toast se necessário
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
          <option value="técnico">Técnico</option>
          <option value="usuário">Usuário</option>
        </select>

        <select className={styles.filterSelect} onChange={(e) => setSetorFilter(e.target.value)}>
          <option value="">Setor</option>
          {setoresDisponiveis.map((setor) => (
            <option key={setor} value={setor}>{setor}</option>
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
              <td>{user.role}</td>
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
        />
      </Modal>
    </main>
  )
}

export default Usuarios
