import styles from '../configuracoes.module.css';

const SecaoUsuarios = ({ dados, onAtualizar, carregando }) => {
  const handleMudanca = (campo) => {
    onAtualizar('usuarios', {
      ...dados,
      [campo]: !dados[campo],
    });
  };

  return (
    <>
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
    </>
  );
};

export default SecaoUsuarios;
