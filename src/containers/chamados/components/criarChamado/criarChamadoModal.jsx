import { useState } from "react"
import Modal from "../../../../components/Modal/modal"
import styles from "./criarChamadoModal.module.css"

function CriarChamadoModal({ isOpen, onClose }) {
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [categoria, setCategoria] = useState("")
  const [prioridade, setPrioridade] = useState("Média")

  function handleSubmit(e) {
    e.preventDefault()

    if (!titulo.trim() || !descricao.trim()) {
      alert("Preencha os campos obrigatórios")
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
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Chamado">
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          placeholder="Título do chamado *"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Categoria</option>
          <option>Software</option>
          <option>Hardware</option>
          <option>Rede</option>
          <option>Acesso</option>
        </select>

        <select
          value={prioridade}
          onChange={(e) => setPrioridade(e.target.value)}
        >
          <option>Alta</option>
          <option>Média</option>
          <option>Baixa</option>
        </select>

        <textarea
          placeholder="Descrição do problema *"
          rows="4"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

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
