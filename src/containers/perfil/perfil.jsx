import { useState } from "react"
import styles from "./perfil.module.css"

export default function Perfil() {
  const [activeTab, setActiveTab] = useState("dados")

  const [user, setUser] = useState({
    nome: "Diego Flausino",
    email: "diego@email.com",
    cargo: "Administrador",
    telefone: "(14) 99999-9999",
    setor: "TI",
  })

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Salvar perfil:", user)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>DF</div>
          <div>
            <h2>{user.nome}</h2>
            <p>{user.cargo} • {user.setor}</p>
          </div>
        </div>


      <div className={styles.tabs}>
        <button
          className={activeTab === "dados" ? styles.activeTab : ""}
          onClick={() => setActiveTab("dados")}
        >
          Dados Pessoais
        </button>
        <button
          className={activeTab === "senha" ? styles.activeTab : ""}
          onClick={() => setActiveTab("senha")}
        >
          Alterar Senha
        </button>
        <button
          className={activeTab === "preferencias" ? styles.activeTab : ""}
          onClick={() => setActiveTab("preferencias")}
        >
          Preferências
        </button>
      </div>
      </div>


      <div className={styles.content}>
        {activeTab === "dados" && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Nome</label>
              <input
                type="text"
                name="nome"
                value={user.nome}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Telefone</label>
              <input
                type="text"
                name="telefone"
                value={user.telefone}
                onChange={handleChange}
              />
            </div>

            <button className={styles.primaryBtn}>
              Salvar Alterações
            </button>
          </form>
        )}

        {activeTab === "senha" && (
          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Senha Atual</label>
              <input type="password" />
            </div>

            <div className={styles.inputGroup}>
              <label>Nova Senha</label>
              <input type="password" />
            </div>

            <div className={styles.inputGroup}>
              <label>Confirmar Nova Senha</label>
              <input type="password" />
            </div>

            <button className={styles.primaryBtn}>
              Atualizar Senha
            </button>
          </form>
        )}

        {activeTab === "preferencias" && (
          <div className={styles.preferences}>
            <div className={styles.preferenceItem}>
              <div>
                <h4>Notificações por Email</h4>
                <p>Receber avisos de novos chamados e atualizações</p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>

            <div className={styles.preferenceItem}>
              <div>
                <h4>Modo Escuro</h4>
                <p>Ativar tema escuro do sistema</p>
              </div>
              <input type="checkbox" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
