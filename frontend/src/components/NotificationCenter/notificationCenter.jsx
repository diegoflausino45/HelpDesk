import { useState, useEffect, useRef, useCallback } from "react"
import { FaBell, FaCheck, FaCheckDouble, FaTimes, FaTrash } from "react-icons/fa"
import { notificationsAPI } from "../../utils/api"
import { useNavigate } from "react-router-dom"
import styles from "./notificationCenter.module.css"

const TYPE_ICON = {
  ticket_created: "🎫",
  ticket_updated: "✏️",
  status_changed: "🔄",
  comment_added: "💬",
  sla_warning: "⚡",
  sla_violated: "🚨",
  assigned: "👤",
}

function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)
  const navigate = useNavigate()

  const fetchCount = useCallback(async () => {
    try {
      const res = await notificationsAPI.getUnreadCount()
      setUnread(res.data.count)
    } catch { /* silencioso */ }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const res = await notificationsAPI.getAll()
      setNotifications(res.data)
    } catch { /* silencioso */ }
    setLoading(false)
  }, [])

  // Polling a cada 30s
  useEffect(() => {
    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [fetchCount])

  // Fechar ao clicar fora do painel
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  function handleOpen() {
    setOpen(prev => !prev)
    if (!open) fetchAll()
  }

  async function handleMarkRead(id) {
    try {
      await notificationsAPI.markRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      setUnread(prev => Math.max(0, prev - 1))
    } catch { /* silencioso */ }
  }

  async function handleMarkAllRead() {
    try {
      await notificationsAPI.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)
    } catch { /* silencioso */ }
  }

  async function handleDelete(id) {
    try {
      await notificationsAPI.delete(id)
      const notif = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (notif && !notif.read) setUnread(prev => Math.max(0, prev - 1))
    } catch { /* silencioso */ }
  }

  async function handleDeleteAll() {
    try {
      await notificationsAPI.deleteAll()
      setNotifications([])
      setUnread(0)
    } catch { /* silencioso */ }
  }

  function handleNavigate(notif) {
    if (!notif.read) handleMarkRead(notif.id)
    setOpen(false)
    if (notif.ticketId) {
      navigate("/chamados", { state: { openTicketId: notif.ticketId } })
      return
    }

    navigate("/chamados")
  }

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr)
    const m = Math.floor(diff / 60000)
    if (m < 1) return "agora"
    if (m < 60) return `${m}min`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h`
    return `${Math.floor(h / 24)}d`
  }

  return (
    <div className={styles.wrapper} ref={panelRef}>
      {/* Ícone do sino */}
      <button
        className={styles.bellBtn}
        onClick={handleOpen}
        title="Notificações"
        aria-label={`Notificações${unread > 0 ? ` (${unread} não lidas)` : ""}`}
      >
        <FaBell />
        {unread > 0 && (
          <span className={styles.badge}>{unread > 99 ? "99+" : unread}</span>
        )}
      </button>

      {/* Painel */}
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>Notificações</span>
            <div className={styles.headerActions}>
              {unread > 0 && (
                <button
                  className={styles.actionBtn}
                  onClick={handleMarkAllRead}
                  title="Marcar todas como lidas"
                >
                  <FaCheckDouble />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className={`${styles.actionBtn} ${styles.danger}`}
                  onClick={handleDeleteAll}
                  title="Limpar todas"
                >
                  <FaTrash />
                </button>
              )}
              <button className={styles.actionBtn} onClick={() => setOpen(false)}>
                <FaTimes />
              </button>
            </div>
          </div>

          <div className={styles.list}>
            {loading && <p className={styles.empty}>Carregando…</p>}
            {!loading && notifications.length === 0 && (
              <p className={styles.empty}>Nenhuma notificação</p>
            )}
            {!loading && notifications.map(notif => (
              <div
                key={notif.id}
                className={`${styles.item} ${notif.read ? styles.read : styles.unread}`}
                onClick={() => handleNavigate(notif)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === "Enter" && handleNavigate(notif)}
              >
                <span className={styles.typeIcon}>
                  {TYPE_ICON[notif.type] ?? "🔔"}
                </span>
                <div className={styles.content}>
                  <span className={styles.title}>{notif.title}</span>
                  <span className={styles.message}>{notif.message}</span>
                  <span className={styles.time}>{timeAgo(notif.createdAt)}</span>
                </div>
                <div className={styles.itemActions}>
                  {!notif.read && (
                    <button
                      className={styles.readBtn}
                      title="Marcar como lida"
                      onClick={e => { e.stopPropagation(); handleMarkRead(notif.id) }}
                    >
                      <FaCheck />
                    </button>
                  )}
                  <button
                    className={`${styles.readBtn} ${styles.deleteBtn}`}
                    title="Remover"
                    onClick={e => { e.stopPropagation(); handleDelete(notif.id) }}
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationCenter
