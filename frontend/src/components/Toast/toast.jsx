import { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import styles from './toast.module.css';

const Toast = ({ mensagem, tipo = 'sucesso', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

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
