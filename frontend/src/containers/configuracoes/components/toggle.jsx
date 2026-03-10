import styles from "./sectog.module.css"

function Toggle({ label, description, checked, onChange, disabled }) {
  return (
    <label className={`${styles.toggle} ${disabled ? styles.toggleDisabled : ""}`}>
      <div className={styles.toggleText}>
        <span>{label}</span>
        {description && <small>{description}</small>}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className={styles.slider}></span>
    </label>
  )
}

export default Toggle
