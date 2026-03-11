/**
 * toggle.jsx — Componente visual de toggle reutilizável (checkbox estilizado).
 */
import styles from "./sectog.module.css"

function Toggle({ label }) {
  return (
    <label className={styles.toggle}>
      <span>{label}</span>
      <input type="checkbox" />
      <span className={styles.slider}></span>
    </label>
  )
}

export default Toggle
