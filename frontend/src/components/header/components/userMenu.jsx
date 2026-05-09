/**
 * userMenu.jsx — Dropdown do usuário no header.
 *
 * Exibe avatar/nome/perfil e ações de navegação:
 *   - Meu Perfil
 *   - Configurações
 *   - Sair (logout)
 */
import { Link, useNavigate } from "react-router-dom"
import { FaChevronDown } from "react-icons/fa"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import toast from "react-hot-toast"
import styles from "../header.module.css"

function UserMenu() {
  const navigate = useNavigate()
  const wrapperRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [userData, setUserData] = useState({
    id: null,
    name: "Usuário",
    role: "user",
    sector: null,
    avatar: "https://avatars.githubusercontent.com/u/70244105?v=4"
  })

  // Converte role técnica para rótulo amigável
  const roleLabel = useMemo(() => {
    const roles = {
      admin: "Administrador",
      technician: "Técnico",
      user: "Usuário"
    }
    return roles[userData.role] || "Usuário"
  }, [userData.role])

  // Lê usuário do localStorage e sincroniza avatar persistido do perfil
  const loadUserData = useCallback(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null")
      if (!user) {
        navigate("/auth")
        return
      }

      const avatar = localStorage.getItem(`profile_avatar_${user.id}`)

      setUserData({
        id: user.id,
        name: user.name || "Usuário",
        role: user.role || "user",
        sector: user.sector?.name || null,
        avatar: avatar || "https://avatars.githubusercontent.com/u/70244105?v=4"
      })
    } catch {
      navigate("/auth")
    }
  }, [navigate])

  useEffect(() => {
    // Sincroniza mudanças de usuário entre componentes/abas
    loadUserData()

    const handleStorage = () => loadUserData()
    const handleUserUpdated = () => loadUserData()
    window.addEventListener("storage", handleStorage)
    window.addEventListener("user-updated", handleUserUpdated)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("user-updated", handleUserUpdated)
    }
  }, [loadUserData])

  useEffect(() => {
    // Fecha dropdown ao clicar fora
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  function handleToggle() {
    loadUserData()
    setOpen((isOpen) => !isOpen)
  }

  function handleLogout() {
    // Limpa sessão local e redireciona para autenticação
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Sessão encerrada")
    navigate("/auth")
  }

  return (
    <div className={styles.userWrapper} ref={wrapperRef}>
      <div 
        className={styles.user}
        onClick={handleToggle}
      >
        <img
          src={userData.avatar}
          alt="avatar"
          className={styles.avatar}
        />

        <div className={styles.userInfo}>
          <span className={styles.userName}>{userData.name}</span>
          <span className={styles.userRole}>{roleLabel}</span>
          <span className={styles.userSector}>{userData.sector || "Sem setor"}</span>
        </div>

        <FaChevronDown 
          className={`${styles.chevron} ${open ? styles.rotate : ""}`}
        />
      </div>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownProfile}>
            <strong>{userData.name}</strong>
            <span>{roleLabel}</span>
            <span>{userData.sector || "Sem setor"}</span>
          </div>
          <Link to="/perfil" onClick={() => setOpen(false)}>Meu Perfil</Link>
          <Link to="/configuracoes" onClick={() => setOpen(false)}>Configurações</Link>
          <button onClick={handleLogout}>Sair</button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
