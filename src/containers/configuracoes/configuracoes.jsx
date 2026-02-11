import { useState } from "react"
import styles from "./configuracoes.module.css"
import { FaCogs, FaUsers, FaBell, FaShieldAlt } from "react-icons/fa"

function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState("geral")

  return (
    <main className={styles.container}>
      <h1>Configurações</h1>

      <div className={styles.layout}>
        
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <button
            className={abaAtiva === "geral" ? styles.active : ""}
            onClick={() => setAbaAtiva("geral")}
          >
            <FaCogs /> Geral
          </button>

          <button
            className={abaAtiva === "usuarios" ? styles.active : ""}
            onClick={() => setAbaAtiva("usuarios")}
          >
            <FaUsers /> Usuários
          </button>

          <button
            className={abaAtiva === "notificacoes" ? styles.active : ""}
            onClick={() => setAbaAtiva("notificacoes")}
          >
            <FaBell /> Notificações
          </button>

          <button
            className={abaAtiva === "seguranca" ? styles.active : ""}
            onClick={() => setAbaAtiva("seguranca")}
          >
            <FaShieldAlt /> Segurança
          </button>
        </aside>

        {/* Conteúdo */}
        <section className={styles.content}>

          {abaAtiva === "geral" && (
            <div className={styles.card}>
              <h2>Configurações Gerais</h2>

              <div className={styles.field}>
                <label>Nome do sistema</label>
                <input type="text" defaultValue="HelpDesk Pro" />
              </div>

              <div className={styles.field}>
                <label>Idioma padrão</label>
                <select>
                  <option>Português</option>
                  <option>Inglês</option>
                </select>
              </div>
            </div>
          )}

          {abaAtiva === "usuarios" && (
            <div className={styles.card}>
              <h2>Permissões de Usuários</h2>

              <div className={styles.toggleRow}>
                <span>Técnicos podem editar usuários</span>
                <input type="checkbox" />
              </div>

              <div className={styles.toggleRow}>
                <span>Usuários podem encerrar chamados</span>
                <input type="checkbox" />
              </div>
            </div>
          )}

          {abaAtiva === "notificacoes" && (
            <div className={styles.card}>
              <h2>Notificações</h2>

              <div className={styles.toggleRow}>
                <span>Enviar email ao criar chamado</span>
                <input type="checkbox" defaultChecked />
              </div>

              <div className={styles.toggleRow}>
                <span>Notificar técnico ao atribuir chamado</span>
                <input type="checkbox" />
              </div>
            </div>
          )}

          {abaAtiva === "seguranca" && (
            <div className={styles.card}>
              <h2>Segurança</h2>

              <div className={styles.field}>
                <label>Bloquear conta após (tentativas)</label>
                <input type="number" defaultValue={5} />
              </div>

              <div className={styles.field}>
                <label>Validade de senha (dias)</label>
                <input type="number" defaultValue={90} />
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button className={styles.cancel}>Cancelar</button>
            <button className={styles.save}>Salvar Alterações</button>
          </div>

        </section>
      </div>
    </main>
  )
}

export default Configuracoes
