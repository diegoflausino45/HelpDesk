import Modal from "../../../../components/Modal/modal"
import styles from "./detalhesChamadoModal.module.css"

function DetalhesChamadoModal({ isOpen, onClose, chamado }) {
  if (!chamado) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chamado #${chamado.id}`}
    >
      <div className={styles.info}>
        <h3>{chamado.titulo}</h3>
        <p>{chamado.descricao}</p>

        <div className={styles.meta}>
          <span>Status: <strong>{chamado.status}</strong></span>
          <span>Prioridade: <strong>{chamado.prioridade}</strong></span>
          <span>Categoria: <strong>{chamado.categoria}</strong></span>
        </div>
      </div>

      <hr />

      <h4>Histórico</h4>

      <div className={styles.comentario}>
        <strong>{chamado.responsavel}</strong>
        <p>Analisando o problema.</p>
      </div>
    </Modal>
  )
}

export default DetalhesChamadoModal
