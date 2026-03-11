/**
 * validatedInput.jsx — Componentes de formulário com validação visual integrada.
 *
 * Exporta:
 *   - ValidatedInput
 *   - ValidatedSelect
 *   - ValidatedTextarea
 */

import styles from "./validatedInput.module.css"

export function ValidatedInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  placeholder,
  maxLength,
  required = false,
  pattern,
  disabled = false,
  className = "",
}) {
  // Input textual com feedback de erro e contador de caracteres
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        pattern={pattern}
        disabled={disabled}
        className={`${styles.input} ${error ? styles.inputError : ""} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />

      {error && (
        <span id={`${name}-error`} className={styles.error}>
          {error}
        </span>
      )}

      {maxLength && !error && (
        <span className={styles.charCount}>
          {value?.length || 0}/{maxLength}
        </span>
      )}
    </div>
  )
}

export function ValidatedSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  className = "",
}) {
  // Select com semântica de acessibilidade e mensagem de erro opcional
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${styles.select} ${error ? styles.inputError : ""} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <span id={`${name}-error`} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  )
}

export function ValidatedTextarea({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  maxLength,
  required = false,
  rows = 4,
  disabled = false,
  className = "",
}) {
  // Textarea com suporte a contador de caracteres e validação visual
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        className={`${styles.textarea} ${error ? styles.inputError : ""} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />

      {error && (
        <span id={`${name}-error`} className={styles.error}>
          {error}
        </span>
      )}

      {maxLength && !error && (
        <span className={styles.charCount}>
          {value?.length || 0}/{maxLength}
        </span>
      )}
    </div>
  )
}
