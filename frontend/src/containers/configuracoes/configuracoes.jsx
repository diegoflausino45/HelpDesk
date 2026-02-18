import { useState, useEffect } from "react"
import styles from "./configuracoes.module.css"
import { 
  FaCogs, 
  FaUsers, 
  FaBell, 
  FaShieldAlt,
  FaBuilding,
  FaPlus,
  FaEdit,
  FaTrash
} from "react-icons/fa"

function Configuracoes() {
  const [abaAtiva, setAbaAtiva] = useState("geral")
  const [setores, setSetores] = useState([])
  const [novoSetor, setNovoSetor] = useState("")
  const [editandoSetor, setEditandoSetor] = useState(null)
  const [setorEditado, setSetorEditado] = useState("")

  // Carregar setores do localStorage
  useEffect(() => {
    const setoresSalvos = localStorage.getItem("setores")
    if (setoresSalvos) {
      setSetores(JSON.parse(setoresSalvos))
    } else {
      // Se não houver setores salvos, usar os padrões
      const setoresPadrao = ["TI", "Administrativo", "RH", "Financeiro", "Manutenção", "Produção", "Engenharia", "Qualidade", "Direção"]
      setSetores(setoresPadrao)
      localStorage.setItem("setores", JSON.stringify(setoresPadrao))
    }
  }, [])

  // Salvar setores no localStorage sempre que mudar
  useEffect(() => {
    if (setores.length > 0) {
      localStorage.setItem("setores", JSON.stringify(setores))
    }
  }, [setores])

  const adicionarSetor = () => {
    if (novoSetor.trim() && !setores.includes(novoSetor.trim())) {
      setSetores([...setores, novoSetor.trim()])
      setNovoSetor("")
    }
  }

  const removerSetor = (setor) => {
    if (setores.length > 1) { // Manter pelo menos um setor
      setSetores(setores.filter(s => s !== setor))
    }
  }

  const iniciarEdicao = (setor) => {
    setEditandoSetor(setor)
    setSetorEditado(setor)
  }

  const salvarEdicao = () => {
    if (setorEditado.trim() && !setores.includes(setorEditado.trim())) {
      setSetores(setores.map(s => s === editandoSetor ? setorEditado.trim() : s))
      setEditandoSetor(null)
      setSetorEditado("")
    }
  }

  const cancelarEdicao = () => {
    setEditandoSetor(null)
    setSetorEditado("")
  }

  const menu = [
    { id: "geral", label: "Geral", desc: "Preferências do sistema", icon: <FaCogs /> },
    { id: "setores", label: "Setores", desc: "Departamentos da empresa", icon: <FaBuilding /> },
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

            {abaAtiva === "setores" && (
              <div className={styles.setoresContainer}>
                <div className={styles.adicionarSetor}>
                  <input
                    type="text"
                    placeholder="Nome do novo setor"
                    value={novoSetor}
                    onChange={(e) => setNovoSetor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarSetor()}
                  />
                  <button 
                    onClick={adicionarSetor}
                    className={styles.addBtn}
                    disabled={!novoSetor.trim()}
                  >
                    <FaPlus /> Adicionar
                  </button>
                </div>

                <div className={styles.setoresList}>
                  <h3>Setores Cadastrados ({setores.length})</h3>
                  {setores.map((setor) => (
                    <div key={setor} className={styles.setorItem}>
                      {editandoSetor === setor ? (
                        <div className={styles.editContainer}>
                          <input
                            type="text"
                            value={setorEditado}
                            onChange={(e) => setSetorEditado(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && salvarEdicao()}
                            autoFocus
                          />
                          <button onClick={salvarEdicao} className={styles.saveBtn}>
                            Salvar
                          </button>
                          <button onClick={cancelarEdicao} className={styles.cancelBtn}>
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className={styles.setorDisplay}>
                          <span>{setor}</span>
                          <div className={styles.setorActions}>
                            <button 
                              onClick={() => iniciarEdicao(setor)}
                              className={styles.editBtn}
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => removerSetor(setor)}
                              className={styles.deleteBtn}
                              disabled={setores.length <= 1}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
