/**
 * modal.jsx — Componente base de modal reutilizável.
 *
 * Recursos:
 *   - fecha ao clicar no overlay
 *   - fecha ao pressionar ESC
 *   - bloqueia scroll do body enquanto aberto
 *   - suporta `variant` e `size` para estilos contextuais
 */
import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from "./modal.module.css"

function Modal({ isOpen, onClose, title, children, footer, variant = 'default', size = 'medium' }) {
  useEffect(() => {
    // Evita scroll da página por trás do modal
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    // Atalho de acessibilidade para fechamento
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${styles[`modal${size.charAt(0).toUpperCase() + size.slice(1)}`]} ${styles[`modal${variant.charAt(0).toUpperCase() + variant.slice(1)}`]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Fechar modal">
            <FaTimes />
          </button>
        </header>

        <div className={styles.content}>
          {children}
        </div>

        {footer && (
          <footer className={styles.footer}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  )
}

export default Modal
