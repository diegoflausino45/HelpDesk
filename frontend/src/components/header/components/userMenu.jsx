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
    avatar: "https://avatars.githubusercontent.com/u/70244105?v=4"
  })

  const roleLabel = useMemo(() => {
    const roles = {
      admin: "Administrador",
      technician: "Técnico",
      user: "Usuário"
    }
    return roles[userData.role] || "Usuário"
  }, [userData.role])

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
        avatar: avatar || "https://avatars.githubusercontent.com/u/70244105?v=4"
      })
    } catch {
      navigate("/auth")
    }
  }, [navigate])

  useEffect(() => {
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
        </div>

        <FaChevronDown 
          className={`${styles.chevron} ${open ? styles.rotate : ""}`}
        />
      </div>

      {open && (
        <div className={styles.dropdown}>
          <Link to="/perfil" onClick={() => setOpen(false)}>Meu Perfil</Link>
          <Link to="/configuracoes" onClick={() => setOpen(false)}>Configurações</Link>
          <button onClick={handleLogout}>Sair</button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
