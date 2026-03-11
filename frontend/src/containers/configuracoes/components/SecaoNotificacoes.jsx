/**
 * SecaoNotificacoes.jsx — Configuração de eventos, canais e horários de envio.
 *
 * Inclui:
 *   - toggles de notificação por evento
 *   - canal padrão, frequência e remetente
 *   - janela de horário silencioso com validação cruzada
 */
import styles from '../configuracoes.module.css';

const SecaoNotificacoes = ({ dados, onAtualizar, carregando, errosValidacao = {} }) => {
  // Alterna valores booleanos da seção "notificacoes"
  const handleMudanca = (campo) => {
    onAtualizar('notificacoes', {
      ...dados,
      [campo]: !dados[campo],
    });
  };

  // Atualiza valores textuais/seleções da seção
  const handleMudancaValor = (campo, valor) => {
    onAtualizar('notificacoes', {
      ...dados,
      [campo]: valor,
    });
  };

  return (
    <div className={styles.sectionGrid}>
      <div className={styles.sectionBlock}>
        <h4>Eventos e alertas</h4>
        <p>Escolha em quais eventos o sistema deve gerar notificações.</p>

        <div className={styles.toggleRow}>
          <span>Notificar por email ao criar chamado</span>
          <input
            type="checkbox"
            checked={dados?.emailCriarChamado || false}
            onChange={() => handleMudanca('emailCriarChamado')}
            disabled={carregando}
            title="Notificações por email ao criar chamado"
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Notificar técnico ao atribuir chamado</span>
          <input
            type="checkbox"
            checked={dados?.emailAtribuirChamado || false}
            onChange={() => handleMudanca('emailAtribuirChamado')}
            disabled={carregando}
            title="Notificações por email ao atribuir chamado"
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Notificar mudança de status</span>
          <input
            type="checkbox"
            checked={dados?.emailAlteracaoStatus || false}
            onChange={() => handleMudanca('emailAlteracaoStatus')}
            disabled={carregando}
            title="Notificar sempre que o status do chamado mudar"
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Notificar novos comentários</span>
          <input
            type="checkbox"
            checked={dados?.notificarComentario || false}
            onChange={() => handleMudanca('notificarComentario')}
            disabled={carregando}
            title="Notificar quando houver comentário em chamado"
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Notificar risco de SLA</span>
          <input
            type="checkbox"
            checked={dados?.notificarSLA || false}
            onChange={() => handleMudanca('notificarSLA')}
            disabled={carregando}
            title="Notificar quando um chamado estiver próximo do vencimento de SLA"
          />
        </div>
      </div>

      <div className={styles.sectionBlock}>
        <h4>Canais e janelas de envio</h4>
        <p>Defina canal padrão, frequência de resumo e horário silencioso.</p>

        <div className={styles.formRow}>
          <label>Canal padrão</label>
          <select
            value={dados?.canalPadrao || 'email'}
            onChange={(e) => handleMudancaValor('canalPadrao', e.target.value)}
            disabled={carregando}
          >
            <option value="email">Email</option>
            <option value="sistema">Somente no sistema</option>
            <option value="ambos">Email e sistema</option>
          </select>
        </div>

        <div className={styles.formRow}>
          <label>Email remetente</label>
          <input
            type="email"
            value={dados?.remetenteEmail || ''}
            onChange={(e) => handleMudancaValor('remetenteEmail', e.target.value)}
            disabled={carregando}
            placeholder="helpdesk@empresa.com"
          />
          {errosValidacao.remetenteEmail && (
            <small className={styles.validationMessage}>{errosValidacao.remetenteEmail}</small>
          )}
        </div>

        <div className={styles.formRow}>
          <label>Frequência do resumo</label>
          <select
            value={dados?.frequenciaResumo || 'diario'}
            onChange={(e) => handleMudancaValor('frequenciaResumo', e.target.value)}
            disabled={carregando}
          >
            <option value="imediato">Imediato</option>
            <option value="diario">Diário</option>
            <option value="semanal">Semanal</option>
          </select>
        </div>

        <div className={styles.toggleRow}>
          <span>Receber resumo diário</span>
          <input
            type="checkbox"
            checked={dados?.receberResumoDiario || false}
            onChange={() => handleMudanca('receberResumoDiario')}
            disabled={carregando}
            title="Enviar resumo de chamados por email"
          />
        </div>

        <div className={styles.inlineRow}>
          <div className={styles.formRow}>
            <label>Silencioso: início</label>
            <input
              type="time"
              value={dados?.horarioSilenciosoInicio || '22:00'}
              onChange={(e) => handleMudancaValor('horarioSilenciosoInicio', e.target.value)}
              disabled={carregando}
            />
          </div>
          <div className={styles.formRow}>
            <label>Silencioso: fim</label>
            <input
              type="time"
              value={dados?.horarioSilenciosoFim || '07:00'}
              onChange={(e) => handleMudancaValor('horarioSilenciosoFim', e.target.value)}
              disabled={carregando}
            />
          </div>
        </div>

        {errosValidacao.horarioSilencioso && (
          <small className={styles.validationMessage}>{errosValidacao.horarioSilencioso}</small>
        )}
      </div>
    </div>
  );
};

export default SecaoNotificacoes;
