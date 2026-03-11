/**
 * criarChamadoModal.jsx — Modal de abertura de novo chamado.
 *
 * Fluxo:
 *   1) valida campos obrigatórios
 *   2) envia payload para API
 *   3) limpa formulário e notifica componente pai via `onCreated`
 */
import { useState } from "react"
import Modal from "../../../../components/Modal/modal"
import {
  validateTituloChamado,
  validateDescricao,
  validateRequired,
} from "../../../../utils/validations"
import { ticketsAPI } from "../../../../utils/api"
import toast from 'react-hot-toast'
import styles from "./criarChamadoModal.module.css"

function CriarChamadoModal({ isOpen, onClose, onCreated }) {
  // Estados controlados do formulário
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState("")
  const [prioridade, setPrioridade] = useState("medium")
  const [erros, setErros] = useState({})
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()

    // Validação local de todos os campos antes de enviar
    const errosValidacao = {}

    const validacaoTitulo = validateTituloChamado(titulo)
    if (!validacaoTitulo.isValid) {
      errosValidacao.titulo = validacaoTitulo.error
    }

    const validacaoDescricao = validateDescricao(descricao)
    if (!validacaoDescricao.isValid) {
      errosValidacao.descricao = validacaoDescricao.error
    }

    const validacaoCategoria = validateRequired(categoria, "Categoria")
    if (!validacaoCategoria.isValid) {
      errosValidacao.categoria = validacaoCategoria.error
    }

    setErros(errosValidacao)

    // Se há erros, não prosseguir
    if (Object.keys(errosValidacao).length > 0) {
      return
    }

    // Sem erros: segue para criação na API
    createTicket()
  }

  async function createTicket() {
    setLoading(true)
    try {
      await ticketsAPI.create({
        title: titulo,
        description: descricao,
        priority: prioridade,
      })

      toast.success('Chamado criado com sucesso')

      // Limpa formulário para próximo uso
      setTitulo("")
      setDescricao("")
      setCategoria("")
      setPrioridade("medium")
      setErros({})

      // Fecha modal e sinaliza recarga da listagem no componente pai
      onClose()
      if (onCreated) onCreated()
    } catch (err) {
      const message = err.response?.data?.error || 'Erro ao criar chamado'
      setErros({ geral: message })
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Chamado">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <input
            placeholder="Título do chamado *"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={erros.titulo ? styles.inputError : ""}
          />
          {erros.titulo && <span className={styles.error}>{erros.titulo}</span>}
        </div>

        <div className={styles.formGroup}>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={erros.categoria ? styles.inputError : ""}
          >
            <option value="">Categoria *</option>
            <option>Software - (Sistema)</option>
            <option>Hardware - (Máquina)</option>
            <option>Rede - (Internet)</option>
            <option>Acesso - (Login)</option>
          </select>
          {erros.categoria && (
            <span className={styles.error}>{erros.categoria}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value)}
          >
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <textarea
            placeholder="Descrição do problema *"
            rows="4"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className={erros.descricao ? styles.inputError : ""}
          />
          <small className={styles.charCount}>
            {descricao.length}/5000
          </small>
          {erros.descricao && (
            <span className={styles.error}>{erros.descricao}</span>
          )}
        </div>

        {erros.geral && (
          <div className={styles.error}>
            {erros.geral}
          </div>
        )}

        <div className={styles.actions}>
          <button type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar'}
          </button>
          <button type="button" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CriarChamadoModal
