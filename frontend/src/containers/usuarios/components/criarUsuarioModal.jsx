import { useState, useEffect } from "react"
import {
  validateEmail,
  validateNomeUsuario,
  validateSetor,
} from "../../../utils/validations"
import { sectorsAPI } from "../../../utils/api"
import styles from "./usuarioModal.module.css"

function CreateUser({ onClose, onCreate }) {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "Usuário",
    setor: "",
    status: "Ativo",
  })
  const [erros, setErros] = useState({})
  const [setoresDisponiveis, setSetoresDisponiveis] = useState([])

  // Carregar setores da API
  useEffect(() => {
    const fetchSetores = async () => {
      try {
        const response = await sectorsAPI.getAll()
        setSetoresDisponiveis(response.data)
      } catch (error) {
        console.error("Erro ao carregar setores:", error)
      }
    }
    fetchSetores()
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    // Limpar erro do campo ao usuário começar a digitar
    if (erros[name]) {
      setErros({ ...erros, [name]: "" })
    }
  }

  function handleSubmit(e) {
    e.preventDefault()

    const errosValidacao = {}

    const validacaoNome = validateNomeUsuario(form.nome)
    if (!validacaoNome.isValid) {
      errosValidacao.nome = validacaoNome.error
    }

    const validacaoEmail = validateEmail(form.email)
    if (!validacaoEmail.isValid) {
      errosValidacao.email = validacaoEmail.error
    }

    if (!form.senha || form.senha.length < 6) {
      errosValidacao.senha = "Senha deve ter no mínimo 6 caracteres"
    }

    const validacaoSetor = validateSetor(form.setor)
    if (!validacaoSetor.isValid) {
      errosValidacao.setor = validacaoSetor.error
    }

    setErros(errosValidacao)

    if (Object.keys(errosValidacao).length > 0) {
      return
    }

    console.log("Criar usuário:", form)
    onCreate(form)
    onClose()
  }


  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.formGroup}>
        <input
          name="nome"
          placeholder="Nome *"
          value={form.nome}
          onChange={handleChange}
          className={erros.nome ? styles.inputError : ""}
        />
        {erros.nome && <span className={styles.error}>{erros.nome}</span>}
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

      <div className={styles.formGroup}>
        <input
          name="senha"
          type="password"
          placeholder="Senha *"
          value={form.senha}
          onChange={handleChange}
          autoComplete="current-password"
          className={erros.senha ? styles.inputError : ""}
        />
        {erros.senha && <span className={styles.error}>{erros.senha}</span>}
      </div>

      <div className={styles.formGroup}>
        <select name="perfil" value={form.perfil} onChange={handleChange}>
          <option value="Admin">Admin</option>
          <option value="Técnico">Técnico</option>
          <option value="Usuário">Usuário</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <select 
          name="setor" 
          value={form.setor} 
          onChange={handleChange}
          className={erros.setor ? styles.inputError : ""}
        >
          <option value="">Selecione um setor *</option>
          {setoresDisponiveis.map((setor) => (
            <option key={setor.id} value={setor.id}>{setor.name}</option>
          ))}
        </select>
        {erros.setor && <span className={styles.error}>{erros.setor}</span>}
      </div>

      <footer className={styles.actions}>
        <button type="button" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit">Salvar</button>
      </footer>
    </form>
  )
}

export default CreateUser
