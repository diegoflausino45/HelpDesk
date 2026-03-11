/**
 * confirmDialog.jsx — Modal padronizado de confirmação.
 *
 * Encapsula o `Modal` base com:
 *   - ícone por tipo de ação (delete/edit/warning/info)
 *   - botões de confirmar/cancelar
 *   - estado de carregamento para operações assíncronas
 */
import { FaExclamationTriangle, FaTrash, FaEdit, FaInfoCircle } from 'react-icons/fa';
import Modal from './modal';
import styles from './confirmDialog.module.css';

// Ícone semântico por variante de confirmação
const icons = {
  danger: FaExclamationTriangle,
  warning: FaExclamationTriangle,
  info: FaInfoCircle,
  delete: FaTrash,
  edit: FaEdit,
};

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'warning',
  isLoading = false,
}) {
  const Icon = icons[variant] || FaInfoCircle;

  const handleConfirm = () => {
    // Mantido separado para facilitar instrumentação futura (analytics/telemetria)
    onConfirm();
  };

  const footer = (
    <div className={styles.actions}>
      <button
        onClick={onClose}
        className={styles.cancelBtn}
        disabled={isLoading}
      >
        {cancelText}
      </button>
      <button
        onClick={handleConfirm}
        className={`${styles.confirmBtn} ${styles[`confirmBtn${variant.charAt(0).toUpperCase() + variant.slice(1)}`]}`}
        disabled={isLoading}
      >
        {isLoading ? 'Processando...' : confirmText}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
      variant={variant}
      size="small"
    >
      <div className={styles.dialogContent}>
        <div className={`${styles.iconWrapper} ${styles[`iconWrapper${variant.charAt(0).toUpperCase() + variant.slice(1)}`]}`}>
          <Icon />
        </div>
        <p className={styles.message}>{message}</p>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
