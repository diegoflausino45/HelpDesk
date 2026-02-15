import { useState } from "react"
import styles from "./auth.module.css"
import ThemeToggle from "../../components/themeToggle/themeToggle"

 function Auth() {
  const [isLogin, setIsLogin] = useState(true)

  function handleSubmit(e) {
    e.preventDefault()
    console.log(isLogin ? "Login..." : "Cadastro...")
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
                <input type="text" placeholder="Digite seu nome" />
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>Email corporativo</label>
              <input type="email" placeholder="seu@email.com" />
            </div>

            <div className={styles.inputGroup}>
              <label>Senha</label>
              <input type="password" placeholder="••••••••" />
            </div>

            {!isLogin && (
              <div className={styles.inputGroup}>
                <label>Confirmar senha</label>
                <input type="password" placeholder="••••••••" />
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

            <button className={styles.primaryBtn}>
              {isLogin ? "Entrar" : "Criar Conta"}
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