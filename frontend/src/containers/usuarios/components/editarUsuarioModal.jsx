import { useState, useEffect } from "react"
import { usersAPI, sectorsAPI } from "../../../utils/api"
import {
  validateEmail,
  validateNomeUsuario,
  validateSetor,
} from "../../../utils/validations"
import toast from "react-hot-toast"
import styles from "./usuarioModal.module.css"

function EditUser({ usuario, usuarioLogado, onClose, onUpdated }) {

  const [form, setForm] = useState({
    name: usuario?.name || "",
    email: usuario?.email || "",
    role: usuario?.role || "user",
    sectorId: usuario?.sectorId ? String(usuario.sectorId) : "",
    status: usuario?.status || "Ativo"
  })

  const [erros, setErros] = useState({})
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([])

  useEffect(() => {
    loadSectors()
  }, [])

  // Atualizar form quando o usuário mudar
  useEffect(() => {
    if (usuario) {
      setForm({
        name: usuario.name || "",
        email: usuario.email || "",
        role: usuario.role || "user",
        sectorId: usuario.sectorId ? String(usuario.sectorId) : "",
        status: usuario.status || "Ativo"
      })
    }
  }, [usuario])

  async function loadSectors() {
    try {
      const response = await sectorsAPI.getAll()
      setSetoresDisponiveis(response.data)
    } catch (error) {
      // Erro silencioso - adicionar toast se necessário
    }
  }

  function handleChange(e) {
    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))

    if (erros[name]) {
      setErros(prev => ({ ...prev, [name]: "" }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const errosValidacao = {}

    const validacaoNome = validateNomeUsuario(form.name)
    if (!validacaoNome.isValid) {
      errosValidacao.name = validacaoNome.error
    }

    const validacaoEmail = validateEmail(form.email)
    if (!validacaoEmail.isValid) {
      errosValidacao.email = validacaoEmail.error
    }

    const validacaoSetor = validateSetor(form.sectorId)
    if (!validacaoSetor.isValid) {
      errosValidacao.sectorId = validacaoSetor.error
    }

    setErros(errosValidacao)

    if (Object.keys(errosValidacao).length > 0) return

    try {

      await usersAPI.update(usuario.id, {
        name: form.name,
        email: form.email,
        role: form.role,
        sectorId: parseInt(form.sectorId)
      })

      toast.success("Usuário atualizado com sucesso!")
      
      if (onUpdated) onUpdated()

      onClose()

    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao atualizar usuário")
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>

      <div className={styles.formGroup}>
        <input
          name="name"
          placeholder="Nome *"
          value={form.name}
          onChange={handleChange}
          className={erros.name ? styles.inputError : ""}
        />
        {erros.name && <span className={styles.error}>{erros.name}</span>}
      </div>

      <div className={styles.formGroup}>
        <input
          name="email"
          type="email"
          placeholder="Email *"
          value={form.email}
          onChange={handleChange}
          className={erros.email ? styles.inputError : ""}
        />
        {erros.email && <span className={styles.error}>{erros.email}</span>}
      </div>

      {usuarioLogado.perfil === "Admin" && (
        <div className={styles.formGroup}>
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="technician">Técnico</option>
            <option value="user">Usuário</option>
          </select>
        </div>
      )}

      <div className={styles.formGroup}>
        <select
          name="sectorId"
          value={form.sectorId}
          onChange={handleChange}
          className={erros.sectorId ? styles.inputError : ""}
        >
          <option value="">Selecione um setor *</option>
          {setoresDisponiveis.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>
        {erros.sectorId && (
          <span className={styles.error}>{erros.sectorId}</span>
        )}
      </div>

      <footer className={styles.actions}>
        <button type="button" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit">
          Salvar
        </button>
      </footer>

    </form>
  )
}

export default EditUser