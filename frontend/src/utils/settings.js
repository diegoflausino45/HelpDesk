const CONFIG_DEFAULTS = {
  usuarios: {
    tecnicosGerenciam: false,
    usuariosEncerram: false,
    permitirConviteUsuarios: true,
    autoAprovarNovosUsuarios: false,
    papelPadraoNovoUsuario: 'user',
    limiteSessaoMinutos: 120,
    maxUsuariosAtivos: 500,
  },
  notificacoes: {
    emailCriarChamado: true,
    emailAtribuirChamado: true,
    emailAlteracaoStatus: true,
    notificarComentario: true,
    notificarSLA: true,
    receberResumoDiario: false,
    canalPadrao: 'email',
    frequenciaResumo: 'diario',
    remetenteEmail: 'helpdesk@empresa.com',
    horarioSilenciosoInicio: '22:00',
    horarioSilenciosoFim: '07:00',
  },
  seguranca: {
    tentativasLogin: 5,
    validadeSenha: 90,
    forcar2FAAdmins: false,
    exigirSenhaForte: true,
    tamanhoMinimoSenha: 8,
    exigirMaiuscula: true,
    exigirNumero: true,
    exigirSimbolo: false,
    bloquearAposFalhas: true,
    tempoBloqueioMinutos: 30,
    alertaNovoDispositivo: true,
  },
}

export function getAppConfig() {
  try {
    const raw = localStorage.getItem('configuracoes')
    const parsed = raw ? JSON.parse(raw) : {}

    return {
      ...parsed,
      usuarios: {
        ...CONFIG_DEFAULTS.usuarios,
        ...(parsed.usuarios || {}),
      },
      notificacoes: {
        ...CONFIG_DEFAULTS.notificacoes,
        ...(parsed.notificacoes || {}),
      },
      seguranca: {
        ...CONFIG_DEFAULTS.seguranca,
        ...(parsed.seguranca || {}),
      },
    }
  } catch {
    return CONFIG_DEFAULTS
  }
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

export function getUserPermissions() {
  const config = getAppConfig()
  const user = getCurrentUser()
  const role = user?.role || 'user'

  const isAdmin = role === 'admin'
  const isTechnician = role === 'technician'
  const isUser = role === 'user'

  const canManageUsers = isAdmin || (isTechnician && config.usuarios.tecnicosGerenciam)
  const canInviteUsers = canManageUsers && config.usuarios.permitirConviteUsuarios
  const canCloseOwnTickets = isAdmin || isTechnician || (isUser && config.usuarios.usuariosEncerram)

  return {
    config,
    user,
    role,
    isAdmin,
    isTechnician,
    isUser,
    canManageUsers,
    canInviteUsers,
    canCloseOwnTickets,
  }
}
