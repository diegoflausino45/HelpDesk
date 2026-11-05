import "dotenv/config";

/**
 * Lê uma variável de ambiente obrigatória.
 * Se ela estiver ausente ou vazia, a API se recusa a iniciar com uma
 * mensagem clara, em vez de seguir com um valor padrão inseguro.
 */
function requireEnv(name: string, hint: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(
      `\n[config] A variável de ambiente ${name} não está definida. ` +
      `A API não será iniciada.\n${hint}\n`
    );
    process.exit(1);
  }
  return value;
}

// Segredo usado para assinar e verificar os tokens JWT.
// Não existe valor padrão: sem ele, nenhum token pode ser emitido.
export const JWT_SECRET = requireEnv(
  'JWT_SECRET',
  'Defina-a em backend/.env (veja backend/.env.example). Para gerar um valor aleatório:\n' +
  '  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
);
