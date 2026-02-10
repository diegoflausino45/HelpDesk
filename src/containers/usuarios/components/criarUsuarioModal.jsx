import styles from "./usuarioModal.module.css"

function CriarUsuarioModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null

  function handleSubmit(e) {
    e.preventDefault()

    const form = e.target
    const novoUsuario = {
      nome: form.nome.value,
      email: form.email.value,
      perfil: form.perfil.value,
      setor: form.setor.value,
      status: "Ativo",
      ultimoAcesso: "Nunca",
    }

    onSave(novoUsuario)
    onClose()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Novo Usuário</h2>

        <form onSubmit={handleSubmit}>
          <input name="nome" placeholder="Nome completo" required />
          <input name="email" type="email" placeholder="Email" required />

          <select name="perfil" required>
            <option value="">Perfil</option>
            <option>Admin</option>
            <option>Técnico</option>
            <option>Usuário</option>
          </select>

          <input name="setor" placeholder="Setor" required />

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CriarUsuarioModal
