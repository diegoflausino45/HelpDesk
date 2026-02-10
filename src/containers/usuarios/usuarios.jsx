import styles from "./usuarios.module.css"
import { useState } from "react"
import { FaEye, FaEdit } from "react-icons/fa"
import Modal from "../../components/Modal/modal"

function Usuarios() {
  const [busca, setBusca] = useState("")
  const [perfil, setPerfil] = useState("")
  const [status, setStatus] = useState("")

  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null)

  const usuarioLogado = {
    perfil: "Admin",
  }

  const usuarios = [
    {
      id: 1,
      nome: "João Silva",
      email: "joao@empresa.com",
      perfil: "Admin",
      setor: "TI",
      status: "Ativo",
      ultimoAcesso: "Hoje 09:12",
    },
    {
      id: 2,
      nome: "Maria Santos",
      email: "maria@empresa.com",
      perfil: "Técnico",
      setor: "RH",
      status: "Ativo",
      ultimoAcesso: "Ontem 18:30",
    },
    {
      id: 3,
      nome: "Carlos Lima",
      email: "carlos@empresa.com",
      perfil: "Usuário",
      setor: "Financeiro",
      status: "Inativo",
      ultimoAcesso: "05/02/2024",
    },
  ]

  const usuariosFiltrados = usuarios.filter(u => {
    const texto =
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())

    const perfilOk = !perfil || u.perfil === perfil
    const statusOk = !status || u.status === status

    return texto && perfilOk && statusOk
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
          onChange={e => setBusca(e.target.value)}
        />

        <select value={perfil} onChange={e => setPerfil(e.target.value)}>
          <option value="">Perfil</option>
          <option>Admin</option>
          <option>Técnico</option>
          <option>Usuário</option>
        </select>

        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">Status</option>
          <option>Ativo</option>
          <option>Inativo</option>
        </select>
      </section>

      {/* Tabela */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Perfil</th>
            <th>Setor</th>
            <th>Status</th>
            <th>Último acesso</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {usuariosFiltrados.map(user => (
            <tr key={user.id}>
              <td>{user.nome}</td>
              <td>{user.email}</td>
              <td>{user.perfil}</td>
              <td>{user.setor}</td>
              <td>{user.status}</td>
              <td>{user.ultimoAcesso}</td>
              <td className={styles.actions}>
                <button><FaEye /></button>

                {(usuarioLogado.perfil === "Admin" ||
                  (usuarioLogado.perfil === "Técnico" &&
                    user.perfil === "Usuário")) && (
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

      {/* Modal Criar */}
      {openCreate && (
        <Modal
          title="Criar Usuário"
          onClose={() => setOpenCreate(false)}
          usuarioLogado={usuarioLogado}
        />
      )}

      {/* Modal Editar */}
      {openEdit && (
        <Modal
          title="Editar Usuário"
          usuario={usuarioSelecionado}
          onClose={() => setOpenEdit(false)}
          usuarioLogado={usuarioLogado}
        />
      )}
    </main>
  )
}

export default Usuarios
