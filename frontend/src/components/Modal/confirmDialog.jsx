import { FaExclamationTriangle, FaTrash, FaEdit, FaInfoCircle } from 'react-icons/fa';
import Modal from './modal';
import styles from './confirmDialog.module.css';

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
