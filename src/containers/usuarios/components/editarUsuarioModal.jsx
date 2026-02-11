import { useEffect, useState } from "react"
import styles from "./usuarioModal.module.css"

function EditUser({ usuario, usuarioLogado, onClose }) {
  const [form, setForm] = useState({})

  useEffect(() => {
    if (usuario) setForm(usuario)
  }, [usuario])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    console.log("Editar usuário:", form)
    onClose()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input name="nome" value={form.nome || ""} onChange={handleChange} />
      <input name="email" value={form.email || ""} onChange={handleChange} />

      {usuarioLogado.perfil === "Admin" && (
        <select name="perfil" value={form.perfil} onChange={handleChange}>
          <option>Admin</option>
          <option>Técnico</option>
          <option>Usuário</option>
        </select>
      )}

      <input name="setor" value={form.setor || ""} onChange={handleChange} />

      <select name="status" value={form.status} onChange={handleChange}>
        <option>Ativo</option>
        <option>Inativo</option>
      </select>

      <footer className={styles.actions}>
        <button type="button" onClick={onClose}>Cancelar</button>
        <button type="submit">Salvar</button>
      </footer>
    </form>
  )
}

export default EditUser
