import { Link } from "react-router-dom"
import { FaChevronDown } from "react-icons/fa"
import { useState } from "react"
import styles from "../header.module.css"

function UserMenu() {
  const [open, setOpen] = useState(false)
function handleToggle() {
    setOpen(isOpen => !isOpen)
  }
  return (
    <div className={styles.userWrapper}>
      <div 
        className={styles.user}
        onClick={handleToggle}
      >
        <img
          src="https://avatars.githubusercontent.com/u/70244105?v=4"
          alt="avatar"
          className={styles.avatar}
        />

        <div className={styles.userInfo}>
          <span className={styles.userName}>Diego Flausino</span>
          <span className={styles.userRole}>Administrador</span>
        </div>

        <FaChevronDown 
          className={`${styles.chevron} ${open ? styles.rotate : ""}`} 
        />
      </div>

      {open && (
        <div className={styles.dropdown}>
          <Link to="/perfil">Meu Perfil</Link>
          <Link to="/configuracoes">Configurações</Link>
          <button>Sair</button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
