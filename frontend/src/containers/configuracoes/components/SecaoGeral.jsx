/**
 * SecaoGeral.jsx — Configurações gerais da aplicação.
 *
 * Campos:
 *   - Nome da organização (com feedback de validação)
 *   - Idioma padrão
 */
import styles from '../configuracoes.module.css';

const SecaoGeral = ({ dados, onAtualizar, carregando, errosValidacao = {} }) => {
  // Atualiza campo específico da seção "geral"
  const handleMudanca = (campo, valor) => {
    onAtualizar('geral', {
      ...dados,
      [campo]: valor,
    });
  };

  const erroOrganizacao = errosValidacao.organizacao;

  return (
    <>
      <div className={styles.formRow}>
        <label htmlFor="organizacao">Nome da organização</label>
        <input
          id="organizacao"
          type="text"
          value={dados?.organizacao || ''}
          onChange={(e) => handleMudanca('organizacao', e.target.value)}
          disabled={carregando}
          placeholder="Digite o nome da organização"
          maxLength="100"
          title="Nome da organização (máx. 100 caracteres)"
          style={{
            borderColor: erroOrganizacao ? 'var(--color-error)' : 'rgba(102, 126, 234, 0.2)',
            boxShadow: erroOrganizacao ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none',
          }}
        />
        {erroOrganizacao && (
          <small style={{ color: 'var(--color-error)', marginTop: '4px' }}>
            ⚠️ {erroOrganizacao}
          </small>
        )}
        <small style={{ color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
          {dados?.organizacao?.length || 0}/100 caracteres
        </small>
      </div>

      <div className={styles.formRow}>
        <label htmlFor="idioma">Idioma padrão</label>
        <select
          id="idioma"
          value={dados?.idioma || 'pt-BR'}
          onChange={(e) => handleMudanca('idioma', e.target.value)}
          disabled={carregando}
        >
          <option value="pt-BR">Português (Brasil)</option>
          <option value="en-US">English (US)</option>
          <option value="es-ES">Español (España)</option>
        </select>
        <small style={{ color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
          Idioma padrão para a aplicação
        </small>
      </div>
    </>
  );
};

export default SecaoGeral;
