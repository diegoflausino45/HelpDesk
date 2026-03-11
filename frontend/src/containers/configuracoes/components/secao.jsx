/**
 * secao.jsx — Wrapper visual simples para blocos de configuração.
 */
import styles from "./sectog.module.css"

function Secao({ title, children }) {
  return (
    <section className={styles.section}>
      <h2>{title}</h2>
      <div className={styles.content}>
        {children}
      </div>
    </section>
  )
}

export default Secao
