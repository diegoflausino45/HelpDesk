import { useState } from "react"
import styles from "./usuarioModal.module.css"

function CreateUser({ onClose }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    perfil: "Usuário",
    setor: "",
    status: "Ativo",
  })

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    console.log("Criar usuário:", form)
    onClose()
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input name="nome" placeholder="Nome" onChange={handleChange} required />
      <input name="email" placeholder="Email" onChange={handleChange} required />

      <select name="perfil" onChange={handleChange}>
        <option>Admin</option>
        <option>Técnico</option>
        <option>Usuário</option>
      </select>

      <input name="setor" placeholder="Setor" onChange={handleChange} />

      <select name="status" onChange={handleChange}>
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

export default CreateUser
