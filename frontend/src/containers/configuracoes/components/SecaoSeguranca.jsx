/**
 * SecaoSeguranca.jsx — Políticas de senha e proteção de conta.
 *
 * Organiza controles de:
 *   - robustez/validade de senha
 *   - tentativas de login, bloqueio e 2FA
 */
import styles from '../configuracoes.module.css';

const SecaoSeguranca = ({ dados, onAtualizar, carregando, errosValidacao = {} }) => {
  // Atualiza campos numéricos convertendo para inteiro
  const handleMudanca = (campo, valor) => {
    onAtualizar('seguranca', {
      ...dados,
      [campo]: parseInt(valor, 10),
    });
  };

  // Alterna toggles booleanos da seção
  const handleToggle = (campo) => {
    onAtualizar('seguranca', {
      ...dados,
      [campo]: !dados[campo],
    });
  };

  const erroTentativas = errosValidacao.tentativasLogin;
  const erroValidade = errosValidacao.validadeSenha;
  const erroTamanhoMinimo = errosValidacao.tamanhoMinimoSenha;
  const erroTempoBloqueio = errosValidacao.tempoBloqueioMinutos;

  return (
    <div className={styles.sectionGrid}>
      <div className={styles.sectionBlock}>
        <h4>Política de senha</h4>
        <p>Defina a robustez mínima e validade das senhas corporativas.</p>

        <div className={styles.formRow}>
          <label htmlFor="tamanhoMinimoSenha">Tamanho mínimo da senha</label>
          <input
            id="tamanhoMinimoSenha"
            type="number"
            min="6"
            max="32"
            value={dados?.tamanhoMinimoSenha || 8}
            onChange={(e) => handleMudanca('tamanhoMinimoSenha', e.target.value)}
            disabled={carregando}
          />
          {erroTamanhoMinimo && <small className={styles.validationMessage}>{erroTamanhoMinimo}</small>}
        </div>

        <div className={styles.formRow}>
          <label htmlFor="validadeSenha">Validade da senha (dias)</label>
          <input
            id="validadeSenha"
            type="number"
            min="0"
            max="365"
            value={dados?.validadeSenha || 90}
            onChange={(e) => handleMudanca('validadeSenha', e.target.value)}
            disabled={carregando}
          />
          {erroValidade && <small className={styles.validationMessage}>{erroValidade}</small>}
        </div>

        <div className={styles.toggleRow}>
          <span>Exigir senha forte</span>
          <input
            type="checkbox"
            checked={dados?.exigirSenhaForte || false}
            onChange={() => handleToggle('exigirSenhaForte')}
            disabled={carregando}
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Exigir letra maiúscula</span>
          <input
            type="checkbox"
            checked={dados?.exigirMaiuscula || false}
            onChange={() => handleToggle('exigirMaiuscula')}
            disabled={carregando || !dados?.exigirSenhaForte}
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Exigir número</span>
          <input
            type="checkbox"
            checked={dados?.exigirNumero || false}
            onChange={() => handleToggle('exigirNumero')}
            disabled={carregando || !dados?.exigirSenhaForte}
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Exigir símbolo</span>
          <input
            type="checkbox"
            checked={dados?.exigirSimbolo || false}
            onChange={() => handleToggle('exigirSimbolo')}
            disabled={carregando || !dados?.exigirSenhaForte}
          />
        </div>
      </div>

      <div className={styles.sectionBlock}>
        <h4>Acesso e proteção de conta</h4>
        <p>Controle tentativas de login, bloqueio e autenticação adicional.</p>

        <div className={styles.formRow}>
          <label htmlFor="tentativasLogin">Tentativas máximas de login</label>
          <input
            id="tentativasLogin"
            type="number"
            min="1"
            max="10"
            value={dados?.tentativasLogin || 5}
            onChange={(e) => handleMudanca('tentativasLogin', e.target.value)}
            disabled={carregando}
          />
          {erroTentativas && <small className={styles.validationMessage}>{erroTentativas}</small>}
        </div>

        <div className={styles.toggleRow}>
          <span>Bloquear conta após falhas consecutivas</span>
          <input
            type="checkbox"
            checked={dados?.bloquearAposFalhas || false}
            onChange={() => handleToggle('bloquearAposFalhas')}
            disabled={carregando}
          />
        </div>

        <div className={styles.formRow}>
          <label htmlFor="tempoBloqueioMinutos">Tempo de bloqueio (minutos)</label>
          <input
            id="tempoBloqueioMinutos"
            type="number"
            min="5"
            max="1440"
            value={dados?.tempoBloqueioMinutos || 30}
            onChange={(e) => handleMudanca('tempoBloqueioMinutos', e.target.value)}
            disabled={carregando || !dados?.bloquearAposFalhas}
          />
          {erroTempoBloqueio && <small className={styles.validationMessage}>{erroTempoBloqueio}</small>}
        </div>

        <div className={styles.toggleRow}>
          <span>Forçar 2FA para administradores</span>
          <input
            type="checkbox"
            checked={dados?.forcar2FAAdmins || false}
            onChange={() => handleToggle('forcar2FAAdmins')}
            disabled={carregando}
          />
        </div>

        <div className={styles.toggleRow}>
          <span>Alertar login em novo dispositivo</span>
          <input
            type="checkbox"
            checked={dados?.alertaNovoDispositivo || false}
            onChange={() => handleToggle('alertaNovoDispositivo')}
            disabled={carregando}
          />
        </div>
      </div>
    </div>
  );
};

export default SecaoSeguranca;
