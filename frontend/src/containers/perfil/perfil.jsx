/**
 * perfil.jsx — Página de perfil do usuário autenticado.
 *
 * Estrutura em abas:
 *   - Informações: editar nome, email, telefone (cargo/setor somente leitura)
 *   - Segurança: troca de senha (valida senha atual via login API antes de salvar)
 *   - Atividades: histórico de ações do usuário (persistido no localStorage)
 *
 * Persistência local por userId:
 *   profile_phone_{id}, profile_avatar_{id}, profile_activity_{id}, profile_last_access_{id}
 *
 * Detecta mudanças não salvas e pede confirmação antes de trocar de aba ou cancelar edição.
 */
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import ConfirmDialog from "../../components/Modal/confirmDialog"
import useConfirmModal from "../../hooks/useConfirmModal"
import { authAPI, usersAPI } from "../../utils/api"
import { validateEmail, validateNomeUsuario } from "../../utils/validations"
import toast from "react-hot-toast"
import styles from "./perfil.module.css"

export default function Perfil() {
  const navigate = useNavigate()

  // ─── Controle de abas e estados da UI ──────────────────────────────────────
  const [activeTab, setActiveTab] = useState("dados")        // aba visível no momento
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [editMode, setEditMode] = useState(false)             // habilita inputs do formulário
  const [savingProfile, setSavingProfile] = useState(false)  // spinner no botão salvar
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [errors, setErrors] = useState({})                   // erros de validação por campo
  const [pendingTab, setPendingTab] = useState(null)          // aba alvo quando há mudanças não salvas
  const [activity, setActivity] = useState([])               // log de atividades do usuário

  // Hook de modal de confirmação reutilizável (salvar / descartar mudanças)
  const { isOpen, data, isLoading, openModal, closeModal, startLoading, stopLoading } = useConfirmModal()

  // ─── Dados do perfil (exibidos e editáveis) ─────────────────────────────────
  const [profileData, setProfileData] = useState({
    id: null,
    nome: "",
    email: "",
    cargo: "",
    setor: "Não informado",
    telefone: "",
    ultimoAcesso: "",
    status: "Ativo",
    avatar: "https://avatars.githubusercontent.com/u/70244105?v=4"
  })

  // Snapshot do último estado salvo — usado para detectar mudanças não salvas (deep compare)
  const [savedProfileData, setSavedProfileData] = useState(profileData)

  // ─── Campos do formulário de senha ──────────────────────────────────────────
  const [passwordData, setPasswordData] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarNovaSenha: ""
  })

  // Mapa de role da API para rótulo exibido ao usuário
  const roleLabels = {
    admin: "Administrador",
    technician: "Técnico",
    user: "Usuário"
  }

  // Detecta se o formulário tem mudanças em relação ao último save
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(profileData) !== JSON.stringify(savedProfileData)
  }, [profileData, savedProfileData])

  // Usuário logado do localStorage — memoizado pois não muda durante a sessão
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null")
    } catch {
      return null
    }
  }, [])

  /** Gera as chaves do localStorage com namespace por userId para evitar conflitos. */
  const getStorageKeys = (userId) => ({
    phone: `profile_phone_${userId}`,
    avatar: `profile_avatar_${userId}`,
    activity: `profile_activity_${userId}`,
    lastAccess: `profile_last_access_${userId}`
  })

  /** Formata qualquer valor de data/ISO para string localizada pt-BR. */
  const formatDateTime = (value) => {
    if (!value) return "-"
    const date = typeof value === "string" ? new Date(value) : value
    return date.toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    })
  }

  /** Detecta o navegador pelo user agent para exibir na seção de acesso. */
  const detectDevice = () => {
    const agent = navigator.userAgent
    const platform = navigator.platform || "Desktop"

    if (agent.includes("Edg")) return `${platform} • Edge`
    if (agent.includes("Chrome")) return `${platform} • Chrome`
    if (agent.includes("Firefox")) return `${platform} • Firefox`
    if (agent.includes("Safari")) return `${platform} • Safari`
    return `${platform} • Navegador`
  }

  /** Adiciona um evento no histórico local e persiste (máx. 15 entradas). */
  const addActivity = (description) => {
    if (!currentUser?.id) return

    const keys = getStorageKeys(currentUser.id)
    const newEvent = {
      id: Date.now(),
      description,
      at: new Date().toISOString()
    }

    setActivity((prev) => {
      const updated = [newEvent, ...prev].slice(0, 15)
      localStorage.setItem(keys.activity, JSON.stringify(updated))
      return updated
    })
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token || !currentUser?.id) {
      navigate("/auth")
      return
    }

    const keys = getStorageKeys(currentUser.id)
    const lastAccessNow = new Date().toISOString()
    localStorage.setItem(keys.lastAccess, lastAccessNow)

    const loadProfile = async () => {
      try {
        const response = await usersAPI.getById(currentUser.id)
        const apiUser = response.data

        // Mescla dados da API com dados persistidos localmente
        const persistedPhone = localStorage.getItem(keys.phone) || ""
        const persistedAvatar = localStorage.getItem(keys.avatar)
        const persistedActivity = JSON.parse(localStorage.getItem(keys.activity) || "[]")
        const persistedLastAccess = localStorage.getItem(keys.lastAccess)

        const nextData = {
          id: apiUser.id,
          nome: apiUser.name || "",
          email: apiUser.email || "",
          cargo: roleLabels[apiUser.role] || "Usuário",
          setor: apiUser.sector?.name || "Não informado",
          telefone: persistedPhone,
          ultimoAcesso: formatDateTime(persistedLastAccess),
          status: "Ativo",
          avatar: persistedAvatar || "https://avatars.githubusercontent.com/u/70244105?v=4"
        }

        const initialActivity = persistedActivity.length
          ? persistedActivity
          : [{ id: 1, description: "Perfil carregado", at: new Date().toISOString() }]

        setActivity(initialActivity)
        localStorage.setItem(keys.activity, JSON.stringify(initialActivity))
        setProfileData(nextData)
        setSavedProfileData(nextData)
      } catch (error) {
        toast.error("Não foi possível carregar o perfil")
      } finally {
        setLoadingProfile(false)
      }
    }

    loadProfile()
  }, [currentUser?.id, navigate])

  const handleFieldChange = (event) => {
    const { name, value } = event.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
    // Limpa o erro do campo ao digitar para feedback imediato
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateProfile = () => {
    const nextErrors = {}
    const nameValidation = validateNomeUsuario(profileData.nome)
    if (!nameValidation.isValid) nextErrors.nome = nameValidation.error

    const emailValidation = validateEmail(profileData.email)
    if (!emailValidation.isValid) nextErrors.email = emailValidation.error

    if (profileData.telefone.trim() && !/^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(profileData.telefone.trim())) {
      nextErrors.telefone = "Telefone inválido"
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  /** Valida, chama a API e sincroniza o estado local após salvar com sucesso. */
  const saveProfile = async () => {
    if (!validateProfile()) {
      toast.error("Corrija os campos inválidos para continuar")
      return
    }

    setSavingProfile(true)
    try {
      await usersAPI.update(profileData.id, {
        name: profileData.nome.trim(),
        email: profileData.email.trim()
      })

      localStorage.setItem("user", JSON.stringify({
        ...currentUser,
        name: profileData.nome.trim(),
        email: profileData.email.trim()
      }))
      window.dispatchEvent(new Event("user-updated"))

      const keys = getStorageKeys(profileData.id)
      localStorage.setItem(keys.phone, profileData.telefone.trim())

      const nextData = {
        ...profileData,
        nome: profileData.nome.trim(),
        email: profileData.email.trim(),
        telefone: profileData.telefone.trim()
      }

      setProfileData(nextData)
      setSavedProfileData(nextData)
      setEditMode(false)
      addActivity("Atualizou informações do perfil")
      toast.success("Perfil atualizado com sucesso")
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao salvar alterações")
    } finally {
      setSavingProfile(false)
    }
  }

  /** Lê o arquivo de imagem selecionado e persiste como base64 no localStorage. */
  const handleAvatarUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file || !currentUser?.id) return

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem")
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const avatarData = reader.result
      const keys = getStorageKeys(currentUser.id)
      localStorage.setItem(keys.avatar, avatarData)
      setProfileData((prev) => ({ ...prev, avatar: avatarData }))
      setSavedProfileData((prev) => ({ ...prev, avatar: avatarData }))
      window.dispatchEvent(new Event("user-updated"))
      addActivity("Atualizou foto de perfil")
      toast.success("Foto de perfil atualizada")
    }
    reader.readAsDataURL(file)
  }

  /** Troca de aba — intercepta quando há mudanças não salvas para confirmar descarte. */
  const handleTabChange = (tab) => {
    if (tab === activeTab) return

    if (editMode && hasUnsavedChanges) {
      setPendingTab(tab)
      openModal({ type: "discard_changes" })
      return
    }

    setActiveTab(tab)
  }

  /** Cancela o modo de edição — pede confirmação se houver mudanças não salvas. */
  const handleCancelEdit = () => {
    if (!hasUnsavedChanges) {
      setEditMode(false)
      setErrors({})
      return
    }
    openModal({ type: "discard_changes" })
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  /**
   * Atualiza a senha: valida via login (verifica senha atual) e então faz PATCH.
   * Estratégia: re-autenticar com a senha atual antes de aplicar a nova.
   */
  const updatePassword = async () => {
    const { senhaAtual, novaSenha, confirmarNovaSenha } = passwordData

    if (!senhaAtual || !novaSenha || !confirmarNovaSenha) {
      toast.error("Preencha todos os campos de senha")
      return
    }

    if (novaSenha.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres")
      return
    }

    if (novaSenha !== confirmarNovaSenha) {
      toast.error("A confirmação da senha não confere")
      return
    }

    if (novaSenha === senhaAtual) {
      toast.error("A nova senha deve ser diferente da senha atual")
      return
    }

    setUpdatingPassword(true)
    try {
      await authAPI.login({ email: profileData.email, password: senhaAtual })
      await usersAPI.update(profileData.id, { password: novaSenha })
      setPasswordData({ senhaAtual: "", novaSenha: "", confirmarNovaSenha: "" })
      addActivity("Alterou a senha")
      toast.success("Senha atualizada com sucesso")
    } catch (error) {
      const message = error.response?.data?.error || "Não foi possível atualizar a senha"
      toast.error(message)
    } finally {
      setUpdatingPassword(false)
    }
  }

  /** Dispatcher de ações do modal de confirmação conforme `data.type`. */
  const handleConfirmAction = async () => {
    if (!data?.type) return

    if (data.type === "save_profile") {
      startLoading()
      await saveProfile()
      stopLoading()
      closeModal()
      return
    }

    if (data.type === "discard_changes") {
      setProfileData(savedProfileData)
      setErrors({})
      setEditMode(false)
      if (pendingTab) {
        setActiveTab(pendingTab)
        setPendingTab(null)
      }
      closeModal()
    }
  }

  if (loadingProfile) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p>Carregando dados do perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.left}>
          <div className={styles.avauser}>
            <div className={styles.avatar}>
              <img src={profileData.avatar} width="100%" alt="Avatar do usuário" />
              <span className={styles.status}></span>
            </div>

            <div>
              <h2>{profileData.nome}</h2>
              <p>{profileData.cargo} • {profileData.setor}</p>
              <span className={styles.email}>{profileData.email}</span>
            </div>
          </div>

          <div className={styles.actions}>
            <label className={styles.outlineBtn}>
              Alterar foto
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className={styles.hiddenInput}
              />
            </label>

            {!editMode ? (
              <button className={styles.outlineBtn} onClick={() => setEditMode(true)}>
                Editar Perfil
              </button>
            ) : (
              <button className={styles.outlineBtn} onClick={handleCancelEdit}>
                Cancelar
              </button>
            )}

            <button
              className={styles.primaryBtn}
              onClick={() => openModal({ type: "save_profile" })}
              disabled={!editMode || !hasUnsavedChanges || savingProfile}
            >
              {savingProfile ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={activeTab === "dados" ? styles.activeTab : ""}
            onClick={() => handleTabChange("dados")}
          >
            Informações
          </button>

          <button
            className={activeTab === "seguranca" ? styles.activeTab : ""}
            onClick={() => handleTabChange("seguranca")}
          >
            Segurança
          </button>

          <button
            className={activeTab === "atividade" ? styles.activeTab : ""}
            onClick={() => handleTabChange("atividade")}
          >
            Atividades
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {activeTab === "dados" && (
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Nome Completo</label>
              <input
                name="nome"
                value={profileData.nome}
                onChange={handleFieldChange}
                disabled={!editMode}
                className={errors.nome ? styles.inputError : ""}
              />
              {errors.nome && <small className={styles.errorText}>{errors.nome}</small>}
            </div>

            <div className={styles.field}>
              <label>Email</label>
              <input
                name="email"
                value={profileData.email}
                onChange={handleFieldChange}
                disabled={!editMode}
                className={errors.email ? styles.inputError : ""}
              />
              {errors.email && <small className={styles.errorText}>{errors.email}</small>}
            </div>

            <div className={styles.field}>
              <label>Telefone</label>
              <input
                name="telefone"
                value={profileData.telefone}
                onChange={handleFieldChange}
                placeholder="(99) 99999-9999"
                disabled={!editMode}
                className={errors.telefone ? styles.inputError : ""}
              />
              {errors.telefone && <small className={styles.errorText}>{errors.telefone}</small>}
            </div>

            <div className={styles.field}>
              <label>Cargo</label>
              <input value={profileData.cargo} disabled />
            </div>

            <div className={styles.field}>
              <label>Setor</label>
              <input value={profileData.setor} disabled />
            </div>

            <div className={styles.field}>
              <label>Status</label>
              <input value={profileData.status} disabled />
            </div>
          </div>
        )}

        {activeTab === "seguranca" && (
          <div className={styles.securitySection}>
            <div className={styles.securityCard}>
              <h4>Alterar Senha</h4>
              <input
                type="password"
                name="senhaAtual"
                placeholder="Senha Atual"
                value={passwordData.senhaAtual}
                onChange={handlePasswordChange}
              />
              <input
                type="password"
                name="novaSenha"
                placeholder="Nova Senha"
                value={passwordData.novaSenha}
                onChange={handlePasswordChange}
              />
              <input
                type="password"
                name="confirmarNovaSenha"
                placeholder="Confirmar Nova Senha"
                value={passwordData.confirmarNovaSenha}
                onChange={handlePasswordChange}
              />
              <button
                className={styles.primaryBtn}
                onClick={updatePassword}
                disabled={updatingPassword}
              >
                {updatingPassword ? "Atualizando..." : "Atualizar Senha"}
              </button>
            </div>

            <div className={styles.securityCard}>
              <h4>Informações de Acesso</h4>
              <p><strong>Último acesso:</strong> {profileData.ultimoAcesso}</p>
              <p><strong>Dispositivo:</strong> {detectDevice()}</p>
              <p><strong>Status:</strong> {profileData.status}</p>
            </div>
          </div>
        )}

        {activeTab === "atividade" && (
          <div className={styles.activity}>
            {activity.map((item) => (
              <div className={styles.activityItem} key={item.id}>
                <span>✔ {item.description}</span>
                <small>{formatDateTime(item.at)}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => {
          closeModal()
          setPendingTab(null)
        }}
        onConfirm={handleConfirmAction}
        title={data?.type === "save_profile" ? "Salvar alterações" : "Descartar alterações"}
        message={data?.type === "save_profile"
          ? "Deseja salvar as alterações do perfil agora?"
          : "Existem alterações não salvas. Deseja descartar e continuar?"}
        confirmText={data?.type === "save_profile" ? "Salvar" : "Descartar"}
        cancelText="Cancelar"
        variant={data?.type === "save_profile" ? "edit" : "warning"}
        isLoading={isLoading}
      />
    </div>
  )
}
