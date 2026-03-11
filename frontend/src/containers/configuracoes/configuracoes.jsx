/**
 * configuracoes.jsx — Painel administrativo de configurações da aplicação.
 *
 * Estrutura:
 *   - Sidebar com abas de configuração
 *   - Área de conteúdo com seção ativa
 *   - Ações globais de salvar/cancelar
 *   - Modal de confirmação para descarte de alterações
 */
import { useState, useEffect } from "react"
import styles from "./configuracoes.module.css"
import { 
  FaCogs, 
  FaUsers, 
  FaBell, 
  FaShieldAlt,
  FaBuilding,
  FaSpinner
} from "react-icons/fa"
import useConfiguracoes from "./hooks/useConfiguracoes"
import { useToast } from "../../contexts/ToastContext"
import ConfirmDialog from "../../components/Modal/confirmDialog"
import SetoresManager from "./components/SetoresManager"
import SecaoGeral from "./components/SecaoGeral"
import SecaoNotificacoes from "./components/SecaoNotificacoes"
import SecaoUsuarios from "./components/SecaoUsuarios"
import SecaoSeguranca from "./components/SecaoSeguranca"

function Configuracoes() {
  // Aba atualmente selecionada na sidebar
  const [abaAtiva, setAbaAtiva] = useState("geral")
  // Controla modal de confirmação para descartar alterações pendentes
  const [mostrarModalDescartar, setMostrarModalDescartar] = useState(false)
  const { 
    configuracoes, 
    carregando, 
    erro,
    errosValidacao,
    alteracoesPendentes,
    atualizar,
    adicionarSetor,
    removerSetor,
    editarSetor,
    salvar,
    cancelar 
  } = useConfiguracoes()
  const { addToast } = useToast()

  // Metadados do menu lateral (id da aba, rótulo, descrição e ícone)
  const menu = [
    { id: "geral", label: "Geral", desc: "Preferências do sistema", icon: <FaCogs /> },
    { id: "setores", label: "Setores", desc: "Departamentos da empresa", icon: <FaBuilding /> },
    { id: "usuarios", label: "Usuários & Permissões", desc: "Perfis e acessos", icon: <FaUsers /> },
    { id: "notificacoes", label: "Notificações", desc: "Emails e alertas", icon: <FaBell /> },
    { id: "seguranca", label: "Segurança", desc: "Políticas e autenticação", icon: <FaShieldAlt /> },
  ]

  const handleSalvar = async () => {
    try {
      await salvar()
      addToast("Configurações salvas com sucesso!", "sucesso")
    } catch (err) {
      addToast("Erro ao salvar configurações", "erro")
    }
  }

  const handleCancelar = () => {
    // Só abre confirmação quando houver mudanças não salvas
    if (alteracoesPendentes) {
      setMostrarModalDescartar(true)
    }
  }

  const confirmarDescartar = () => {
    cancelar()
    setMostrarModalDescartar(false)
  }

  if (erro && !carregando) {
    return (
      <main className={styles.container}>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "var(--color-error)" }}>⚠️ {erro}</p>
          <button onClick={() => window.location.reload()}>Tentar novamente</button>
        </div>
      </main>
    )
  }

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
            {carregando && (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <FaSpinner style={{ animation: "spin 1s linear infinite" }} size={32} />
                <p>Carregando configurações...</p>
              </div>
            )}

            {!carregando && (
              <>
                {abaAtiva === "geral" && (
                  <SecaoGeral 
                    dados={configuracoes.geral} 
                    onAtualizar={atualizar}
                    carregando={carregando}
                    errosValidacao={errosValidacao.geral || {}}
                  />
                )}

                {abaAtiva === "usuarios" && (
                  <SecaoUsuarios 
                    dados={configuracoes.usuarios} 
                    onAtualizar={atualizar}
                    carregando={carregando}
                    errosValidacao={errosValidacao.usuarios || {}}
                  />
                )}

                {abaAtiva === "notificacoes" && (
                  <SecaoNotificacoes 
                    dados={configuracoes.notificacoes} 
                    onAtualizar={atualizar}
                    carregando={carregando}
                    errosValidacao={errosValidacao.notificacoes || {}}
                  />
                )}

                {abaAtiva === "seguranca" && (
                  <SecaoSeguranca 
                    dados={configuracoes.seguranca} 
                    onAtualizar={atualizar}
                    carregando={carregando}
                    errosValidacao={errosValidacao.seguranca || {}}
                  />
                )}

                {abaAtiva === "setores" && (
                  <SetoresManager 
                    setores={configuracoes.setores}
                    onAdicionarSetor={adicionarSetor}
                    onRemoverSetor={removerSetor}
                    onEditarSetor={editarSetor}
                    carregando={carregando}
                  />
                )}
              </>
            )}

          </div>

          <div className={styles.actions}>
            <button 
              className={styles.cancel}
              onClick={handleCancelar}
              disabled={!alteracoesPendentes || carregando}
            >
              Cancelar
            </button>
            <button 
              className={styles.save}
              onClick={handleSalvar}
              disabled={!alteracoesPendentes || carregando}
            >
              {carregando ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>

        </section>
      </div>

      {/* Modal de confirmação para descartar alterações */}
      <ConfirmDialog
        isOpen={mostrarModalDescartar}
        onClose={() => setMostrarModalDescartar(false)}
        onConfirm={confirmarDescartar}
        title="Descartar Alterações"
        message="Tem certeza que deseja descartar todas as alterações não salvas? Esta ação não pode ser desfeita."
        confirmText="Sim, descartar"
        cancelText="Continuar editando"
        variant="warning"
      />
    </main>
  )
}

export default Configuracoes
