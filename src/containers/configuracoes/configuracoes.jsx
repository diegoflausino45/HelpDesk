import { useState } from "react"
import styles from "./configuracoes.module.css"
import { 
  FaCogs, 
  FaUsers, 
  FaBell, 
  FaShieldAlt 
} from "react-icons/fa"

function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState("geral")

  const menu = [
    { id: "geral", label: "Geral", desc: "Preferências do sistema", icon: <FaCogs /> },
    { id: "usuarios", label: "Usuários & Permissões", desc: "Perfis e acessos", icon: <FaUsers /> },
    { id: "notificacoes", label: "Notificações", desc: "Emails e alertas", icon: <FaBell /> },
    { id: "seguranca", label: "Segurança", desc: "Políticas e autenticação", icon: <FaShieldAlt /> },
  ]

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* Sidebar Enterprise */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Configurações</h3>
            <span>Painel administrativo</span>
          </div>

          <nav className={styles.menu}>
            {menu.map(item => (
              <button
                key={item.id}
                onClick={() => setAbaAtiva(item.id)}
                className={`${styles.menuItem} ${
                  abaAtiva === item.id ? styles.active : ""
                }`}
              >
                <div className={styles.icon}>{item.icon}</div>
                <div className={styles.textItem}>
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Conteúdo */}
        <section className={styles.content}>

          <header className={styles.contentHeader}>
            <h2>
              {menu.find(m => m.id === abaAtiva)?.label}
            </h2>
            <p>
              {menu.find(m => m.id === abaAtiva)?.desc}
            </p>
          </header>

          <div className={styles.card}>

            {abaAtiva === "geral" && (
              <>
                <div className={styles.formRow}>
                  <label>Nome da organização</label>
                  <input type="text" defaultValue="HelpDesk Enterprise" />
                </div>

                <div className={styles.formRow}>
                  <label>Idioma padrão</label>
                  <select>
                    <option>Português</option>
                    <option>Inglês</option>
                  </select>
                </div>
              </>
            )}

            {abaAtiva === "usuarios" && (
              <>
                <div className={styles.toggleRow}>
                  <span>Técnicos podem gerenciar usuários</span>
                  <input type="checkbox" />
                </div>

                <div className={styles.toggleRow}>
                  <span>Usuários podem encerrar chamados</span>
                  <input type="checkbox" />
                </div>
              </>
            )}

            {abaAtiva === "notificacoes" && (
              <>
                <div className={styles.toggleRow}>
                  <span>Notificar por email ao criar chamado</span>
                  <input type="checkbox" defaultChecked />
                </div>

                <div className={styles.toggleRow}>
                  <span>Notificar técnico ao atribuir chamado</span>
                  <input type="checkbox" />
                </div>
              </>
            )}

            {abaAtiva === "seguranca" && (
              <>
                <div className={styles.formRow}>
                  <label>Tentativas máximas de login</label>
                  <input type="number" defaultValue={5} />
                </div>

                <div className={styles.formRow}>
                  <label>Validade da senha (dias)</label>
                  <input type="number" defaultValue={90} />
                </div>
              </>
            )}

          </div>

          <div className={styles.actions}>
            <button className={styles.cancel}>Cancelar</button>
            <button className={styles.save}>Salvar alterações</button>
          </div>

        </section>
      </div>
    </main>
  )
}

export default Configuracoes
