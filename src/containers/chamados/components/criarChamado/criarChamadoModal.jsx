import { useState } from "react"
import Modal from "../../../../components/Modal/modal"
import {
  validateTituloChamado,
  validateDescricao,
  validateRequired,
} from "../../../../utils/validations"
import styles from "./criarChamadoModal.module.css"

function CriarChamadoModal({ isOpen, onClose }) {
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState("")
  const [prioridade, setPrioridade] = useState("Média")
  const [erros, setErros] = useState({})

  function handleSubmit(e) {
    e.preventDefault()

    // Validar todos os campos
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

    console.log({
      titulo,
      descricao,
      categoria,
      prioridade,
      status: "Aberto",
    })

    onClose()
    setTitulo("")
    setDescricao("")
    setCategoria("")
    setPrioridade("Média")
    setErros({})
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
            <option>Software</option>
            <option>Hardware</option>
            <option>Rede</option>
            <option>Acesso</option>
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
            <option>Alta</option>
            <option>Média</option>
            <option>Baixa</option>
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

        <div className={styles.actions}>
          <button type="submit">Criar</button>
          <button type="button" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CriarChamadoModal
