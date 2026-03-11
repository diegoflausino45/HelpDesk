/**
 * toast.jsx — Componente visual de toast customizado.
 *
 * Observação: o projeto também usa `react-hot-toast`; este componente
 * permanece como alternativa/customização local.
 */
import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import styles from './toast.module.css';

const Toast = ({ mensagem, tipo = 'sucesso', onClose }) => {
  useEffect(() => {
    // Auto-dismiss após 3s
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Ícones por tipo de mensagem
  const icones = {
    sucesso: <FaCheckCircle />,
    erro: <FaTimesCircle />,
    aviso: <FaExclamationCircle />,
    info: <FaInfoCircle />,
  };

  return (
    <div className={`${styles.toast} ${styles[tipo]}`}>
      <div className={styles.icone}>{icones[tipo]}</div>
      <span className={styles.mensagem}>{mensagem}</span>
      <button className={styles.botaoFechar} onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default Toast;
