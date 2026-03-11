/**
 * constants.js — Constantes de domínio do projeto HelpDesk.
 *
 * Centraliza regras de validação, rótulos de status/prioridade/perfil
 * e mensagens de erro padrão, evitando strings duplicadas no código.
 */

// ─── Regras de validação por campo ─────────────────────────────────────────
/**
 * Limites de tamanho e obrigatoriedade para cada campo do formulário.
 * Usados em conjunto com as funções de `validations.js`.
 */
export const VALIDATION_RULES = {
  TITULO_CHAMADO: {
    minLength: 5,
    maxLength: 100,
    required: true,
  },
  DESCRICAO_CHAMADO: {
    minLength: 10,
    maxLength: 5000,
    required: true,
  },
  NOME_USUARIO: {
    minLength: 3,
    maxLength: 100,
    required: true,
  },
  EMAIL: {
    maxLength: 100,
    required: true,
  },
  SETOR: {
    maxLength: 50,
    required: true,
  },
  SEARCH_TERM: {
    maxLength: 100,
  },
};

// ─── Rótulos de status do chamado ───────────────────────────────────────────
/** Mapeamento do valor interno (snake_case da API) para o rótulo exibido. */
export const STATUS_CHAMADO = {
  ABERTO: "Aberto",
  EM_ATENDIMENTO: "Em atendimento",
  RESOLVIDO: "Resolvido",
};

// ─── Rótulos de prioridade ──────────────────────────────────────────────────
export const PRIORIDADE_CHAMADO = {
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixa",
};

// ─── Rótulos de perfil de usuário ───────────────────────────────────────────
export const PERFIL_USUARIO = {
  ADMIN: "Admin",
  TECNICO: "Técnico",
  USUARIO: "Usuário",
};

// ─── Status de usuário ──────────────────────────────────────────────────────
export const STATUS_USUARIO = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

// ─── Listas de domínio ──────────────────────────────────────────────────────
/** Categorias disponíveis ao abrir/editar um chamado. */
export const CATEGORIAS_CHAMADO = [
  "Software",
  "Hardware",
  "Rede",
  "Acesso",
];

/** Setores padrão usados quando a API de setores não retorna dados. */
export const SETORES = [
  "TI",
  "Administrativo",
  "RH",
  "Financeiro",
  "Manutenção",
  "Produção",
  "Engenharia",
  "Qualidade",
  "Direção",
];

/**
 * Mensagens de erro padrão
 */
export const ERROR_MESSAGES = {
  REQUIRED: "Este campo é obrigatório",
  INVALID_EMAIL: "Email inválido",
  MIN_LENGTH: (min) => `Mínimo de ${min} caracteres`,
  MAX_LENGTH: (max) => `Máximo de ${max} caracteres`,
  INVALID_CHARACTERS: "Contém caracteres inválidos",
};
