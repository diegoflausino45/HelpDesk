/**
 * settings.js — Configurações da aplicação e derivadas de permissão do usuário.
 *
 * Fluxo:
 *   1. getAppConfig()   → lê configurações do localStorage, mesclando com defaults
 *   2. getCurrentUser() → lê o usuário logado do localStorage
 *   3. getUserPermissions() → combina config + user para calcular permissões
 *
 * As configurações são persistídas em localStorage com a chave 'configuracoes'.
 */

// Valores padrão usados quando a chave não existe no storage ou está corrompida
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

/**
 * Retorna as configurações da app mesclando o localStorage com os defaults.
 * Garante que campos adicionados após persistência anterior sempre tenham valor.
 */
export function getAppConfig() {
  try {
    // Tenta ler e parsear o JSON salvo; se não existir, usa objeto vazio
    const raw = localStorage.getItem('configuracoes')
    const parsed = raw ? JSON.parse(raw) : {}

    // Mesclagem por seção: defaults primeiro, depois valores salvos sobrescrevem
    // Isso garante retrocompatibilidade quando novos campos são adicionados aos defaults
    return {
      ...parsed,
      usuarios: {
        ...CONFIG_DEFAULTS.usuarios,
        ...(parsed.usuarios || {}),  // sobrescreve só as chaves existentes no storage
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
    // localStorage corrompido ou JSON inválido → retorna defaults seguros
    return CONFIG_DEFAULTS
  }
}

/** Lê o objeto do usuário logado armazenado no localStorage. */
export function getCurrentUser() {
  try {
    // Retorna null se a chave não existir ('null' literal) ou se o JSON estiver inválido
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    return null
  }
}

/**
 * Deriva as permissões do usuário a partir de sua role e das configurações.
 *
 * Lógica de permissão:
 *   canManageUsers  → admin sempre; técnico apenas se 'tecnicosGerenciam' = true
 *   canInviteUsers  → só se canManageUsers E 'permitirConviteUsuarios' = true
 *   canCloseOwnTickets → admin/técnico sempre; usuário só se 'usuariosEncerram' = true
 */
export function getUserPermissions() {
  const config = getAppConfig()
  const user = getCurrentUser()
  const role = user?.role || 'user'  // fallback seguro para usuário não autenticado

  // Flags de papel — usadas nas derivações abaixo
  const isAdmin = role === 'admin'
  const isTechnician = role === 'technician'
  const isUser = role === 'user'

  // canManageUsers: admin tem acesso irrestrito; técnico precisa de flag de config ligada
  const canManageUsers = isAdmin || (isTechnician && config.usuarios.tecnicosGerenciam)

  // canInviteUsers: só válido se já pode gerenciar E a feature de convite está habilitada
  const canInviteUsers = canManageUsers && config.usuarios.permitirConviteUsuarios

  // canCloseOwnTickets: roles privilegiadas sempre podem; usuário comum precisa de config
  const canCloseOwnTickets = isAdmin || isTechnician || (isUser && config.usuarios.usuariosEncerram)

  return {
    config,       // configurações completas, disponível para leitura pontual
    user,         // objeto do usuário logado
    role,         // string: 'admin' | 'technician' | 'user'
    isAdmin,
    isTechnician,
    isUser,
    canManageUsers,
    canInviteUsers,
    canCloseOwnTickets,
  }
}
