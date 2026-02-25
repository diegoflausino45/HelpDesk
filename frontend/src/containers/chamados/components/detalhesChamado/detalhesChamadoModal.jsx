import { useState, useEffect } from "react"
import Modal from "../../../../components/Modal/modal"
import { ticketsAPI, commentsAPI } from "../../../../utils/api"
import toast from 'react-hot-toast'
import styles from "./detalhesChamadoModal.module.css"

function DetalhesChamadoModal({ isOpen, onClose, chamado, onUpdated }) {
  const [detalhes, setDetalhes] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [novoComentario, setNovoComentario] = useState('')
  const [postingComment, setPostingComment] = useState(false)

  useEffect(() => {
    if (isOpen && chamado?.id) {
      loadDetalhes()
      loadComentarios()
    }
  }, [isOpen, chamado?.id])

  async function loadDetalhes() {
    if (!chamado?.id) return

    setLoading(true)
    try {
      const response = await ticketsAPI.getById(chamado.id)
      setDetalhes(response.data)
    } catch (err) {
      setError('Erro ao carregar detalhes')
    } finally {
      setLoading(false)
    }
  }

  async function loadComentarios() {
    if (!chamado?.id) return

    try {
      const response = await commentsAPI.getByTicket(chamado.id)
      setComentarios(response.data)
    } catch (err) {
      console.error('Erro ao carregar comentários:', err)
    }
  }

  async function handleAddComment(e) {
    e.preventDefault()
    if (!novoComentario.trim() || !detalhes?.id) return

    setPostingComment(true)
    try {
      await commentsAPI.create({
        ticketId: detalhes.id,
        content: novoComentario.trim()
      })
      setNovoComentario('')
      loadComentarios() // Recarregar comentários
      toast.success('Comentário adicionado')
    } catch (err) {
      console.error('Erro ao adicionar comentário:', err)
      toast.error(err.response?.data?.error || 'Erro ao adicionar comentário')
    } finally {
      setPostingComment(false)
    }
  }

  async function handleStatusChange(newStatus) {
    if (!detalhes?.id) return

    try {
      await ticketsAPI.update(detalhes.id, { status: newStatus })
      loadDetalhes() // Recarregar detalhes
      if (onUpdated) onUpdated()
      toast.success('Status atualizado')
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      toast.error(err.response?.data?.error || 'Erro ao atualizar status')
    }
  }

  const ticket = detalhes || chamado

  if (!ticket) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chamado #${ticket.id}`}
    >
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.info}>
        <h3>{ticket.title}</h3>
        <p>{ticket.description}</p>

        <div className={styles.meta}>
          <span className={styles.selectDiv}>
            <span>Status:</span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={styles.statusSelect}
            >
              <option value="open">Aberto</option>
              <option value="in-progress">Em andamento</option>
              <option value="closed">Fechado</option>
            </select>
          </span>
          <span>Prioridade:
            <strong>
              {ticket.priority === 'low' ? 'Baixa' :
               ticket.priority === 'medium' ? 'Média' :
               ticket.priority === 'high' ? 'Alta' : ticket.priority}
            </strong>
          </span>
          <span>Criado por: <strong>{ticket.createdBy?.name || 'N/A'}</strong></span>
          <span>Atribuído a: <strong>{ticket.assignedTo?.name || 'N/A'}</strong></span>
          <span>Criado em: <strong>{new Date(ticket.createdAt).toLocaleString('pt-BR')}</strong></span>
          <span>Setor: <strong>{ticket.createdBy?.sector?.name ?? 'Error'}</strong></span>
        </div>
      </div>

      <hr className={styles.linha} />

      <h4>Comentários</h4>

      <div className={styles.comentarios}>
        {comentarios.length === 0 ? (
          <p className={styles.noComments}>Nenhum comentário ainda.</p>
        ) : (
          comentarios.map(comentario => (
            <div key={comentario.id} className={styles.comentario}>
              <div className={styles.commentHeader}>
                <strong>{comentario.user?.name || 'Usuário'}</strong>
                <span>{new Date(comentario.createdAt).toLocaleString('pt-BR')}</span>
              </div>
              <p>{comentario.content}</p>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleAddComment} className={styles.addComment}>
        <textarea
          placeholder="Adicionar comentário..."
          value={novoComentario}
          onChange={(e) => setNovoComentario(e.target.value)}
          rows="3"
          required
        />
        <button type="submit" disabled={postingComment}>
          {postingComment ? 'Enviando...' : 'Comentar'}
        </button>
      </form>
    </Modal>
  )
}

export default DetalhesChamadoModal
