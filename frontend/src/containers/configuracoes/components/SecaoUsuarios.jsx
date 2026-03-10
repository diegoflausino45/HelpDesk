import { FaUserCog, FaUsers } from 'react-icons/fa';
import styles from '../configuracoes.module.css';
import Toggle from './toggle';

const PERMISSOES_TECNICOS = [
  {
    campo: 'tecnicosGerenciam',
    label: 'Técnicos podem gerenciar usuários',
    description: 'Permite que técnicos criem, editem e removam contas de usuários no sistema',
  },
  {
    campo: 'tecnicosCriam',
    label: 'Técnicos podem criar chamados para usuários',
    description: 'Permite que técnicos abram chamados em nome de outros usuários',
  },
  {
    campo: 'tecnicosAlteramPrioridade',
    label: 'Técnicos podem alterar a prioridade dos chamados',
    description: 'Permite que técnicos modifiquem o nível de prioridade de qualquer chamado',
  },
];

const PERMISSOES_USUARIOS = [
  {
    campo: 'usuariosEncerram',
    label: 'Usuários podem encerrar seus próprios chamados',
    description: 'Permite que usuários finalizem chamados abertos por eles mesmos',
  },
  {
    campo: 'usuariosVeemTodos',
    label: 'Usuários podem visualizar todos os chamados',
    description: 'Usuários podem ver chamados de outros usuários da organização, não apenas os seus',
  },
];

const SecaoUsuarios = ({ dados, onAtualizar, carregando }) => {
  const handleMudanca = (campo) => {
    onAtualizar('usuarios', {
      ...dados,
      [campo]: !dados[campo],
    });
  };

  return (
    <div className={styles.permissoesContainer}>
      <div className={styles.permissoesGrupo}>
        <div className={styles.grupoHeader}>
          <div className={styles.grupoIconWrap}>
            <FaUserCog />
          </div>
          <div className={styles.grupoHeaderText}>
            <h4>Permissões de Técnicos</h4>
            <span>Controle o que técnicos podem fazer no sistema</span>
          </div>
        </div>
        <div className={styles.grupoToggles}>
          {PERMISSOES_TECNICOS.map(({ campo, label, description }) => (
            <Toggle
              key={campo}
              label={label}
              description={description}
              checked={dados?.[campo] || false}
              onChange={() => handleMudanca(campo)}
              disabled={carregando}
            />
          ))}
        </div>
      </div>

      <div className={styles.permissoesGrupo}>
        <div className={styles.grupoHeader}>
          <div className={styles.grupoIconWrap}>
            <FaUsers />
          </div>
          <div className={styles.grupoHeaderText}>
            <h4>Permissões de Usuários</h4>
            <span>Defina o que os usuários finais podem fazer no sistema</span>
          </div>
        </div>
        <div className={styles.grupoToggles}>
          {PERMISSOES_USUARIOS.map(({ campo, label, description }) => (
            <Toggle
              key={campo}
              label={label}
              description={description}
              checked={dados?.[campo] || false}
              onChange={() => handleMudanca(campo)}
              disabled={carregando}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecaoUsuarios;
