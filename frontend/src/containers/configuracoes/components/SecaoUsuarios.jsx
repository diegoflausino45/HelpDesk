/**
 * SecaoUsuarios.jsx — Preferências de usuários e permissões operacionais.
 *
 * Divide os controles em:
 *   - permissões/toggles de operação
 *   - políticas de acesso (papel padrão e limites numéricos)
 */
import styles from '../configuracoes.module.css';

const SecaoUsuarios = ({ dados, onAtualizar, carregando, errosValidacao = {} }) => {
  // Alterna campos booleanos da seção "usuarios"
  const handleMudanca = (campo) => {
    onAtualizar('usuarios', {
      ...dados,
      [campo]: !dados[campo],
    });
  };

  // Atualiza campos de valor (select/number)
  const handleMudancaValor = (campo, valor) => {
    onAtualizar('usuarios', {
      ...dados,
      [campo]: valor,
    });
  };

  return (
    <div className={styles.sectionGrid}>
      <div className={styles.sectionBlock}>
        <h4>Permissões operacionais</h4>
        <p>Defina quais ações equipes técnicas e usuários podem executar.</p>

        <div className={styles.toggleRow}>
          <span>Técnicos podem gerenciar usuários</span>
          <input
            type="checkbox"
            checked={dados?.tecnicosGerenciam || false}
            onChange={() => handleMudanca('tecnicosGerenciam')}
            disabled={carregando}
            title="Permitir que técnicos gerenciem usuários"
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Usuários podem encerrar chamados</span>
          <input
            type="checkbox"
            checked={dados?.usuariosEncerram || false}
            onChange={() => handleMudanca('usuariosEncerram')}
            disabled={carregando}
            title="Permitir que usuários encerrem seus próprios chamados"
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Permitir convite de novos usuários</span>
          <input
            type="checkbox"
            checked={dados?.permitirConviteUsuarios || false}
            onChange={() => handleMudanca('permitirConviteUsuarios')}
            disabled={carregando}
            title="Permitir convites para novas contas"
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Aprovação automática de novos usuários</span>
          <input
            type="checkbox"
            checked={dados?.autoAprovarNovosUsuarios || false}
            onChange={() => handleMudanca('autoAprovarNovosUsuarios')}
            disabled={carregando}
            title="Aprovar automaticamente novos usuários"
          />
        </div>
      </div>

      <div className={styles.sectionBlock}>
        <h4>Políticas de acesso</h4>
        <p>Padronize perfil inicial e limites de sessão/usuários ativos.</p>

        <div className={styles.formRow}>
          <label>Papel padrão para novos usuários</label>
          <select
            value={dados?.papelPadraoNovoUsuario || 'user'}
            onChange={(e) => handleMudancaValor('papelPadraoNovoUsuario', e.target.value)}
            disabled={carregando}
          >
            <option value="user">Usuário</option>
            <option value="technician">Técnico</option>
          </select>
        </div>

        <div className={styles.formRow}>
          <label>Tempo máximo de sessão (minutos)</label>
          <input
            type="number"
            min="15"
            max="1440"
            value={dados?.limiteSessaoMinutos ?? 120}
            onChange={(e) => handleMudancaValor('limiteSessaoMinutos', Number(e.target.value))}
            disabled={carregando}
          />
          {errosValidacao.limiteSessaoMinutos && (
            <small className={styles.validationMessage}>{errosValidacao.limiteSessaoMinutos}</small>
          )}
        </div>

        <div className={styles.formRow}>
          <label>Limite de usuários ativos</label>
          <input
            type="number"
            min="1"
            max="5000"
            value={dados?.maxUsuariosAtivos ?? 500}
            onChange={(e) => handleMudancaValor('maxUsuariosAtivos', Number(e.target.value))}
            disabled={carregando}
          />
          {errosValidacao.maxUsuariosAtivos && (
            <small className={styles.validationMessage}>{errosValidacao.maxUsuariosAtivos}</small>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecaoUsuarios;
