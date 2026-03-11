import { useState, useEffect } from "react"
import Modal from "../../../../components/Modal/modal"
import { ticketsAPI, commentsAPI, attachmentsAPI } from "../../../../utils/api"
import toast from 'react-hot-toast'
import styles from "./detalhesChamadoModal.module.css"
import SlaBadge from "../../../../components/SlaBadge/slaBadge"

function DetalhesChamadoModal({ isOpen, onClose, chamado, onUpdated, permissoes }) {
  const translateStatus = (status) => {
    const map = {
      open: 'Aberto',
      'in-progress': 'Em andamento',
      closed: 'Fechado',
    }
    return map[status] || status
  }

  const [detalhes, setDetalhes] = useState(null)
  const [comentarios, setComentarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [novoComentario, setNovoComentario] = useState('')
  const [postingComment, setPostingComment] = useState(false)
  const [historico, setHistorico] = useState([])
  const [uploadingTicketFile, setUploadingTicketFile] = useState(false)
  const [uploadingCommentFile, setUploadingCommentFile] = useState(false)

  useEffect(() => {
    if (isOpen && chamado?.id) {
      loadDetalhes()
      loadComentarios()
      loadHistorico()
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
      // Erro silencioso - usuário verá lista vazia
    }
  }

  async function loadHistorico() {
    if (!chamado?.id) return
    try {
      const response = await ticketsAPI.getHistory(chamado.id)
      setHistorico(response.data)
    } catch {
      setHistorico([])
    }
  }

  async function handleAddComment(e) {
    e.preventDefault()
    if (!novoComentario.trim() || !detalhes?.id) return

    setPostingComment(true)
    try {
      const response = await commentsAPI.create({
        ticketId: detalhes.id,
        content: novoComentario.trim()
      })

      // Upload de anexo opcional no comentário recém-criado
      const fileInput = document.getElementById("commentFileInput")
      const file = fileInput?.files?.[0]
      if (file && response?.data?.id) {
        setUploadingCommentFile(true)
        await attachmentsAPI.uploadToComment(response.data.id, file)
        fileInput.value = ""
      }

      setNovoComentario('')
      loadComentarios() // Recarregar comentários
      loadDetalhes()
      toast.success('Comentário adicionado')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao adicionar comentário')
    } finally {
      setPostingComment(false)
      setUploadingCommentFile(false)
    }
  }

  async function handleTicketAttachmentUpload(event) {
    const file = event.target.files?.[0]
    if (!file || !ticket?.id) return

    try {
      setUploadingTicketFile(true)
      await attachmentsAPI.uploadToTicket(ticket.id, file)
      event.target.value = ""
      await loadDetalhes()
      toast.success("Anexo enviado")
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao enviar anexo")
    } finally {
      setUploadingTicketFile(false)
    }
  }

  async function handleDeleteAttachment(attachmentId) {
    try {
      await attachmentsAPI.delete(attachmentId)
      await loadDetalhes()
      toast.success("Anexo removido")
    } catch (err) {
      toast.error(err.response?.data?.error || "Erro ao remover anexo")
    }
  }

  async function handleStatusChange(newStatus) {
    if (!detalhes?.id) return

    const isOwner = detalhes.createdBy?.id === permissoes?.user?.id
    const podeAlterarStatus = permissoes?.isAdmin || permissoes?.isTechnician || (isOwner && permissoes?.canCloseOwnTickets)

    if (!podeAlterarStatus) {
      toast.error('Você não tem permissão para alterar o status deste chamado')
      return
    }

    if (permissoes?.isUser && newStatus !== 'closed') {
      toast.error('Usuários podem apenas encerrar chamados próprios')
      return
    }

    try {
      await ticketsAPI.update(detalhes.id, { status: newStatus })
      loadDetalhes() // Recarregar detalhes
      if (onUpdated) onUpdated()
      toast.success('Status atualizado')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao atualizar status')
    }
  }

  const ticket = detalhes || chamado
  const isOwner = ticket?.createdBy?.id === permissoes?.user?.id
  const podeAlterarStatus = permissoes?.isAdmin || permissoes?.isTechnician || (isOwner && permissoes?.canCloseOwnTickets)

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

        <div className={styles.slaContainer}>
          <strong>SLA:</strong>
          <SlaBadge
            slaDeadline={ticket.slaDeadline}
            slaStatus={ticket.slaStatus}
            slaViolated={ticket.slaViolated}
            ticketStatus={ticket.status}
          />
          {ticket.slaDeadline && (
            <small className={styles.slaDeadline}>
              Prazo: {new Date(ticket.slaDeadline).toLocaleString('pt-BR')}
            </small>
          )}
        </div>

        <div className={styles.meta}>
          <span className={styles.selectDiv}>
            <span>Status:</span>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={styles.statusSelect}
              disabled={!podeAlterarStatus}
            >
              <option value="open">Aberto</option>
              {(permissoes?.isAdmin || permissoes?.isTechnician) && (
                <option value="in-progress">Em andamento</option>
              )}
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

        <div className={styles.attachmentsBox}>
          <div className={styles.attachmentsHeader}>
            <h4>Anexos do chamado</h4>
            <label className={styles.uploadLabel}>
              {uploadingTicketFile ? 'Enviando...' : 'Adicionar anexo'}
              <input
                type="file"
                onChange={handleTicketAttachmentUpload}
                disabled={uploadingTicketFile}
                hidden
              />
            </label>
          </div>

          {ticket.attachments?.length ? (
            <ul className={styles.attachmentsList}>
              {ticket.attachments.map((file) => (
                <li key={file.id}>
                  <a
                    href={attachmentsAPI.getDownloadUrl(file.id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {file.originalName}
                  </a>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => handleDeleteAttachment(file.id)}>Excluir</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.noComments}>Nenhum anexo.</p>
          )}
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
        <input id="commentFileInput" type="file" />
        <button type="submit" disabled={postingComment}>
          {postingComment || uploadingCommentFile ? 'Enviando...' : 'Comentar'}
        </button>
      </form>

      <hr className={styles.linha} />

      <h4>Histórico de status</h4>
      <div className={styles.historyList}>
        {historico.length === 0 ? (
          <p className={styles.noComments}>Nenhuma mudança registrada.</p>
        ) : (
          historico.map((item) => (
            <div key={item.id} className={styles.historyItem}>
              <div>
                <strong>{item.user?.name || 'Usuário'}</strong>
                <span> alterou de </span>
                <strong>{item.fromStatus ? translateStatus(item.fromStatus) : 'Criação'}</strong>
                <span> para </span>
                <strong>{translateStatus(item.toStatus)}</strong>
              </div>
              {item.note && <p>{item.note}</p>}
              <small>{new Date(item.createdAt).toLocaleString('pt-BR')}</small>
            </div>
          ))
        )}
      </div>
    </Modal>
  )
}

export default DetalhesChamadoModal
