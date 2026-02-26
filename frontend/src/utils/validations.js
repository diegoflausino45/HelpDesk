/**
 * Validações reutilizáveis para o projeto HelpDesk
 */

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Valida se um texto não está vazio
 * @param {string} value - Valor a validar
 * @param {string} fieldName - Nome do campo para mensagem de erro
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateRequired(value, fieldName = "Campo") {
  if (!value || !value.toString().trim()) {
    return {
      isValid: false,
      error: `${fieldName} é obrigatório`,
    };
  }
  return { isValid: true, error: "" };
}

/**
 * Valida comprimento mínimo
 * @param {string} value - Valor a validar
 * @param {number} minLength - Comprimento mínimo
 * @param {string} fieldName - Nome do campo
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateMinLength(value, minLength, fieldName = "Campo") {
  if (value.trim().length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} deve ter no mínimo ${minLength} caracteres`,
    };
  }
  return { isValid: true, error: "" };
}

/**
 * Valida comprimento máximo
 * @param {string} value - Valor a validar
 * @param {number} maxLength - Comprimento máximo
 * @param {string} fieldName - Nome do campo
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateMaxLength(value, maxLength, fieldName = "Campo") {
  if (value.trim().length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} não pode ter mais de ${maxLength} caracteres`,
    };
  }
  return { isValid: true, error: "" };
}

/**
 * Valida email
 * @param {string} email - Email a validar
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateEmail(email) {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return {
      isValid: false,
      error: "Email é obrigatório",
    };
  }

  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return {
      isValid: false,
      error: "Email inválido",
    };
  }

  return { isValid: true, error: "" };
}

/**
 * Valida se o campo é um número válido
 * @param {string} value - Valor a validar
 * @param {string} fieldName - Nome do campo
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateNumber(value, fieldName = "Campo") {
  if (!value || isNaN(value)) {
    return {
      isValid: false,
      error: `${fieldName} deve ser um número válido`,
    };
  }
  return { isValid: true, error: "" };
}

/**
 * Valida um formulário complexo
 * @param {object} data - Objeto com dados do formulário
 * @param {object} rules - Regras de validação { fieldName: [validators] }
 * @returns {object} { isValid: boolean, errors: object }
 */
export function validateForm(data, rules) {
  const errors = {};
  let isValid = true;

  Object.entries(rules).forEach(([fieldName, validators]) => {
    validators.forEach((validator) => {
      const result = validator(data[fieldName]);
      if (!result.isValid) {
        errors[fieldName] = result.error;
        isValid = false;
      }
    });
  });

  return { isValid, errors };
}

/**
 * Valida título de chamado
 * @param {string} titulo - Título a validar
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateTituloChamado(titulo) {
  const trimmed = titulo.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "Título é obrigatório",
    };
  }

  if (trimmed.length < 5) {
    return {
      isValid: false,
      error: "Título deve ter no mínimo 5 caracteres",
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: "Título não pode ter mais de 100 caracteres",
    };
  }

  return { isValid: true, error: "" };
}

/**
 * Valida descrição de chamado
 * @param {string} descricao - Descrição a validar
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateDescricao(descricao) {
  const trimmed = descricao.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "Descrição é obrigatória",
    };
  }

  if (trimmed.length < 10) {
    return {
      isValid: false,
      error: "Descrição deve ter no mínimo 10 caracteres",
    };
  }

  if (trimmed.length > 5000) {
    return {
      isValid: false,
      error: "Descrição não pode ter mais de 5000 caracteres",
    };
  }

  return { isValid: true, error: "" };
}

/**
 * Valida nome de usuário
 * @param {string} name - Nome a validar
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateNomeUsuario(name) {
  const trimmed = name.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "Nome é obrigatório",
    };
  }

  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: "Nome deve ter no mínimo 3 caracteres",
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: "Nome não pode ter mais de 100 caracteres",
    };
  }

  // Validar se contém apenas letras, espaços e alguns caracteres especiais comuns
  if (!/^[a-zA-Záàâãéèêíïóôõöúçñ\s'-]+$/i.test(trimmed)) {
    return {
      isValid: false,
      error: "Nome contém caracteres inválidos",
    };
  }

  return { isValid: true, error: "" };
}

/**
 * Valida setor
 * @param {string} sector - Setor a validar
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateSetor(sector) {
  if (!sector) {
    return {
      isValid: false,
      error: "Setor é obrigatório",
    };
  }

  return { isValid: true, error: "" };
}

/**
 * Limpa espaços em branco extras de um valor
 * @param {string} value - Valor a limpar
 * @returns {string} Valor limpo
 */
export function sanitizeInput(value) {
  return value.trim().replace(/\s+/g, " ");
}

/**
 * Valida comprimento do campo com mensagem customizada
 * @param {string} value - Valor a validar
 * @param {number} min - Mínimo
 * @param {number} max - Máximo
 * @param {string} fieldName - Nome do campo
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateLength(value, min, max, fieldName = "Campo") {
  const length = value.trim().length;

  if (length < min) {
    return {
      isValid: false,
      error: `${fieldName} deve ter no mínimo ${min} caracteres (${length}/${min})`,
    };
  }

  if (length > max) {
    return {
      isValid: false,
      error: `${fieldName} não pode ter mais de ${max} caracteres (${length}/${max})`,
    };
  }

  return { isValid: true, error: "" };
}
