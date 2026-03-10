import styles from '../configuracoes.module.css';

const SecaoNotificacoes = ({ dados, onAtualizar, carregando }) => {
  const handleMudanca = (campo) => {
    onAtualizar('notificacoes', {
      ...dados,
      [campo]: !dados[campo],
    });
  };

  return (
    <>
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
    </>
  );
};

export default SecaoNotificacoes;
