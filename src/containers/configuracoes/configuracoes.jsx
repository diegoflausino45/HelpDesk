import styles from "./configuracoes.module.css"
import Secao from "./components/secao"
import Toggle from "./components/toggle"

function Configuracoes() {
  return (
    <main className={styles.container}>
      <h1>Configurações</h1>

     <div className={styles.secoes}>
      {/* Geral */}
      <Secao title="Geral">
        <label>
          Nome do sistema
          <input type="text" defaultValue="HelpDesk" />
        </label>

        <label>
          Idioma
          <select>
            <option>Português</option>
            <option>Inglês</option>
          </select>
        </label>
      </Secao>

      {/* Chamados */}
      <Secao title="Chamados">
        <label>
          SLA padrão (horas)
          <input type="number" defaultValue={24} />
        </label>

        <Toggle label="Permitir reabertura de chamados" />
        <Toggle label="Exigir prioridade ao criar chamado" />
      </Secao>

      {/* Usuários */}
      <Secao title="Usuários & Permissões">
        <Toggle label="Técnicos podem editar usuários" />
        <Toggle label="Usuários comuns podem encerrar chamados" />
      </Secao>

      {/* Notificações */}
      <Secao title="Notificações">
        <Toggle label="Enviar email ao criar chamado" />
        <Toggle label="Notificar técnico ao atribuir chamado" />
      </Secao>

      {/* Segurança */}
      <Secao title="Segurança">
        <Toggle label="Exigir troca de senha a cada 90 dias" />
        <Toggle label="Bloquear conta após 5 tentativas" />
      </Secao>
</div>
      <div className={styles.actions}>
        <button className={styles.cancel}>Cancelar</button>
        <button className={styles.save}>Salvar alterações</button>
      </div>
    </main>
  )
}

export default Configuracoes
