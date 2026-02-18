/**
 * Constantes de validação para o projeto
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

export const STATUS_CHAMADO = {
  ABERTO: "Aberto",
  EM_ATENDIMENTO: "Em atendimento",
  RESOLVIDO: "Resolvido",
};

export const PRIORIDADE_CHAMADO = {
  ALTA: "Alta",
  MEDIA: "Média",
  BAIXA: "Baixa",
};

export const PERFIL_USUARIO = {
  ADMIN: "Admin",
  TECNICO: "Técnico",
  USUARIO: "Usuário",
};

export const STATUS_USUARIO = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
};

export const CATEGORIAS_CHAMADO = [
  "Software",
  "Hardware",
  "Rede",
  "Acesso",
];

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
