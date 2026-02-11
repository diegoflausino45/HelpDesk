import { useState } from "react"
import styles from "./perfil.module.css"

export default function Perfil() {
  const [activeTab, setActiveTab] = useState("dados")

  const user = {
    nome: "Diego Flausino",
    email: "diego@email.com",
    cargo: "Administrador",
    setor: "Tecnologia da Informação",
    telefone: "(14) 99999-9999",
    ultimoAcesso: "09/02/2026 - 22:14",
    status: "Ativo"
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.profileHeader}>
        <div className={styles.left}>
            <div className={styles.avauser}>
                <div className={styles.avatar}>
            DF
            <span className={styles.status}></span>
          </div>

          <div>
            <h2>{user.nome}</h2>
            <p>{user.cargo} • {user.setor}</p>
            <span className={styles.email}>{user.email}</span>
          </div>
            </div>
          
          <div className={styles.actions}>
          <button className={styles.outlineBtn}>Editar Perfil</button>
          <button className={styles.primaryBtn}>Salvar</button>
        </div>
        </div>

        
      {/* TABS */}
      <div className={styles.tabs}>
        <button
          className={activeTab === "dados" ? styles.activeTab : ""}
          onClick={() => setActiveTab("dados")}
        >
          Informações
        </button>

        <button
          className={activeTab === "seguranca" ? styles.activeTab : ""}
          onClick={() => setActiveTab("seguranca")}
        >
          Segurança
        </button>

        <button
          className={activeTab === "atividade" ? styles.activeTab : ""}
          onClick={() => setActiveTab("atividade")}
        >
          Atividades
        </button>
      </div>
      </div>


      {/* CONTEÚDO */}
      <div className={styles.card}>
        {activeTab === "dados" && (
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Nome Completo</label>
              <input defaultValue={user.nome} />
            </div>

            <div className={styles.field}>
              <label>Email</label>
              <input defaultValue={user.email} />
            </div>

            <div className={styles.field}>
              <label>Telefone</label>
              <input defaultValue={user.telefone} />
            </div>

            <div className={styles.field}>
              <label>Cargo</label>
              <input defaultValue={user.cargo} disabled />
            </div>

            <div className={styles.field}>
              <label>Setor</label>
              <input defaultValue={user.setor} disabled />
            </div>

            <div className={styles.field}>
              <label>Status</label>
              <input defaultValue={user.status} disabled />
            </div>
          </div>
        )}

        {activeTab === "seguranca" && (
          <div className={styles.securitySection}>
            <div className={styles.securityCard}>
              <h4>Alterar Senha</h4>
              <input type="password" placeholder="Senha Atual" />
              <input type="password" placeholder="Nova Senha" />
              <input type="password" placeholder="Confirmar Nova Senha" />
              <button className={styles.primaryBtn}>
                Atualizar Senha
              </button>
            </div>

            <div className={styles.securityCard}>
              <h4>Informações de Acesso</h4>
              <p><strong>Último acesso:</strong> {user.ultimoAcesso}</p>
              <p><strong>Dispositivo:</strong> Windows • Chrome</p>
              <p><strong>IP:</strong> 192.168.0.15</p>
            </div>
          </div>
        )}

        {activeTab === "atividade" && (
          <div className={styles.activity}>
            <div className={styles.activityItem}>
              <span>✔ Atualizou perfil</span>
              <small>09/02/2026 - 21:55</small>
            </div>

            <div className={styles.activityItem}>
              <span>✔ Criou chamado #2045</span>
              <small>08/02/2026 - 18:22</small>
            </div>

            <div className={styles.activityItem}>
              <span>✔ Alterou senha</span>
              <small>05/02/2026 - 10:11</small>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
