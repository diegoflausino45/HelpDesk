/**
 * auth.jsx — Página de autenticação (login e registro).
 *
 * Alterna entre dois modos pelo flag `isLogin`:
 *   - Login: envia email + senha, armazena token e redireciona para '/'
 *   - Registro: cria conta e em seguida faz login automático
 *
 * O layout divide a tela em duas colunas: branding (esquerda) + formulário (direita).
 */
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./auth.module.css"
import ThemeToggle from "../../components/themeToggle/themeToggle"
import { authAPI } from "../../utils/api"
import toast from "react-hot-toast"

function Auth() {
  // Alterna entre os modos login (true) e registro (false)
  const [isLogin, setIsLogin] = useState(true)

  // Campos do formulário unificado (campos extras só aparecem no modo registro)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleInputChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // ─── Fluxo de login ────────────────────────────────────────────────────
        const response = await authAPI.login({
          email: formData.email,
          password: formData.password
        })

        // Persiste sessão no localStorage para leitura pelos guards de rota
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        toast.success('Login realizado')

        navigate('/')
      } else {
        // ─── Fluxo de registro ─────────────────────────────────────────────────
        // Validação client-side antes de enviar — evita requisição desnecessária
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem')
          return
        }

        const response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })

        // Após criar conta, autentica automaticamente para melhorar a UX
        const loginResponse = await authAPI.login({
          email: formData.email,
          password: formData.password
        })

        localStorage.setItem('token', loginResponse.data.token)
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user))

        toast.success('Conta criada e logado')

        navigate('/')
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Erro ao processar solicitação'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.themeToggleWrapper}>
        <ThemeToggle />
      </div>
      
      {/* LADO ESQUERDO - Branding */}
      <div className={styles.left}>
        <div className={styles.brandContent}>
          <h1>HelpDesk Pro</h1>
          <p>
            Plataforma corporativa para gestão de chamados,
            usuários e processos internos.
          </p>
        </div>
      </div>

      {/* LADO DIREITO - Formulário */}
      <div className={styles.right}>
        <div className={styles.card}>
          <h2>{isLogin ? "Entrar na conta" : "Criar conta"}</h2>

          <form onSubmit={handleSubmit} className={styles.form}>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label>Nome completo</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Digite seu nome"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>Email corporativo</label>
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Senha</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label>Confirmar senha</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required={!isLogin}
                />
              </div>
            )}

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {isLogin && (
              <div className={styles.options}>
                <label>
                  <input type="checkbox" />
                  Lembrar de mim
                </label>
                <span className={styles.link}>
                  Esqueceu a senha?
                </span>
              </div>
            )}

            <button className={styles.primaryBtn} disabled={loading}>
              {loading ? 'Processando...' : (isLogin ? "Entrar" : "Criar Conta")}
            </button>

            <div className={styles.switch}>
              {isLogin ? "Não tem conta?" : "Já possui conta?"}
              <span onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? " Criar agora" : " Fazer login"}
              </span>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
export default Auth