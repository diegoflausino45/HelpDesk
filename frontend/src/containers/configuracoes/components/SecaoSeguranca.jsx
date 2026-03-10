import styles from '../configuracoes.module.css';

const SecaoSeguranca = ({ dados, onAtualizar, carregando, errosValidacao = {} }) => {
  const handleMudanca = (campo, valor) => {
    onAtualizar('seguranca', {
      ...dados,
      [campo]: parseInt(valor, 10),
    });
  };

  const erroTentativas = errosValidacao.tentativasLogin;
  const erroValidade = errosValidacao.validadeSenha;

  return (
    <>
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
          title="Número de tentativas permitidas antes de bloquear a conta (1-10)"
          style={{
            borderColor: erroTentativas ? 'var(--color-error)' : 'rgba(102, 126, 234, 0.2)',
            boxShadow: erroTentativas ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none',
          }}
        />
        {erroTentativas ? (
          <small style={{ color: 'var(--color-error)', marginTop: '4px' }}>
            ⚠️ {erroTentativas}
          </small>
        ) : (
          <small style={{ color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
            Número de tentativas permitidas antes de bloquear a conta
          </small>
        )}
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
          title="Dias até a senha expirar (0 = sem expiração, 1-365)"
          style={{
            borderColor: erroValidade ? 'var(--color-error)' : 'rgba(102, 126, 234, 0.2)',
            boxShadow: erroValidade ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none',
          }}
        />
        {erroValidade ? (
          <small style={{ color: 'var(--color-error)', marginTop: '4px' }}>
            ⚠️ {erroValidade}
          </small>
        ) : (
          <small style={{ color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
            Dias até a senha expirar (0 = sem expiração)
          </small>
        )}
      </div>
    </>
  );
};

export default SecaoSeguranca;
