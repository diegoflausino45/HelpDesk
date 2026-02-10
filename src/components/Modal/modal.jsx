import styles from "./modal.module.css"

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onClose}>✕</button>
        </header>

        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
