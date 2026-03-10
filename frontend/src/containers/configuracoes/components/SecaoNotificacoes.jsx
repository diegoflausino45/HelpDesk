import { FaEnvelope, FaBell } from 'react-icons/fa';
import styles from '../configuracoes.module.css';
import Toggle from './toggle';

const NOTIFICACOES_EMAIL = [
  {
    campo: 'emailCriarChamado',
    label: 'Novo chamado aberto',
    description: 'Envia um e-mail para o responsável quando um chamado for criado',
  },
  {
    campo: 'emailAtribuirChamado',
    label: 'Chamado atribuído ao técnico',
    description: 'Notifica o técnico por e-mail quando um chamado for atribuído a ele',
  },
  {
    campo: 'emailEncerrarChamado',
    label: 'Chamado encerrado',
    description: 'Envia um e-mail ao solicitante quando seu chamado for finalizado',
  },
  {
    campo: 'emailComentarChamado',
    label: 'Novo comentário no chamado',
    description: 'Notifica os envolvidos por e-mail quando um comentário for adicionado',
  },
];

const NOTIFICACOES_SISTEMA = [
  {
    campo: 'alertaPrioridadeAlta',
    label: 'Alerta para chamados de alta prioridade',
    description: 'Exibe uma notificação no sistema para chamados criados com prioridade alta ou crítica',
  },
  {
    campo: 'alertaChamadoSemTecnico',
    label: 'Alerta para chamados sem técnico atribuído',
    description: 'Notifica administradores quando um chamado permanecer sem técnico atribuído por um período prolongado',
  },
];

const SecaoNotificacoes = ({ dados, onAtualizar, carregando }) => {
  const handleMudanca = (campo) => {
    onAtualizar('notificacoes', {
      ...dados,
      [campo]: !dados[campo],
    });
  };

  return (
    <div className={styles.permissoesContainer}>
      <div className={styles.permissoesGrupo}>
        <div className={styles.grupoHeader}>
          <div className={styles.grupoIconWrap}>
            <FaEnvelope />
          </div>
          <div className={styles.grupoHeaderText}>
            <h4>Notificações por E-mail</h4>
            <span>Configure os eventos que disparam envio automático de e-mail</span>
          </div>
        </div>
        <div className={styles.grupoToggles}>
          {NOTIFICACOES_EMAIL.map(({ campo, label, description }) => (
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
            <FaBell />
          </div>
          <div className={styles.grupoHeaderText}>
            <h4>Alertas do Sistema</h4>
            <span>Notificações internas exibidas dentro da plataforma</span>
          </div>
        </div>
        <div className={styles.grupoToggles}>
          {NOTIFICACOES_SISTEMA.map(({ campo, label, description }) => (
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

export default SecaoNotificacoes;
