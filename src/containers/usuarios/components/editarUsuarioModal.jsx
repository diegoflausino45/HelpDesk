import styles from "./usuarioModal.module.css"

function EditarUsuarioModal({ isOpen, onClose, usuario, onUpdate }) {
  if (!isOpen || !usuario) return null

  function handleSubmit(e) {
    e.preventDefault()

    const form = e.target
    const atualizado = {
      ...usuario,
      nome: form.nome.value,
      perfil: form.perfil.value,
      setor: form.setor.value,
      status: form.status.value,
    }

    onUpdate(atualizado)
    onClose()
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Editar Usuário</h2>

        <form onSubmit={handleSubmit}>
          <input name="nome" defaultValue={usuario.nome} required />

          <select name="perfil" defaultValue={usuario.perfil}>
            <option>Admin</option>
            <option>Técnico</option>
            <option>Usuário</option>
          </select>

          <input name="setor" defaultValue={usuario.setor} required />

          <select name="status" defaultValue={usuario.status}>
            <option>Ativo</option>
            <option>Inativo</option>
          </select>

          <div className={styles.actions}>
            <button type="button" onClick={onClose}>Cancelar</button>
            <button type="submit">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditarUsuarioModal
