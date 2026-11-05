import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from './generated/prisma/client.js';
import bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Senha da conta admin. Vem de SEED_ADMIN_PASSWORD; sem ela, localmente usa
  // a senha de demonstração "admin123" (pública, documentada no README).
  // Na Vercel a variável é obrigatória, para nunca publicar a senha conhecida.
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD?.trim() || (process.env.VERCEL ? '' : 'admin123');
  if (!adminPassword) {
    throw new Error(
      'Defina SEED_ADMIN_PASSWORD nas variáveis de ambiente do projeto: ' +
      'em ambiente público a conta admin não é criada com a senha de demonstração.'
    );
  }

  // Criar setores padrão
  const setores = [
    { name: 'TI' },
    { name: 'Administrativo' },
    { name: 'RH' },
    { name: 'Financeiro' },
    { name: 'Manutenção' },
    { name: 'Produção' },
    { name: 'Engenharia' },
    { name: 'Qualidade' },
    { name: 'Direção' },
  ];

  for (const setor of setores) {
    await prisma.sector.upsert({
      where: { name: setor.name },
      update: {},
      create: setor,
    });
  }

  // Conta admin. Só define a senha ao criar a conta; se ela já existir, nada muda
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: 'admin@helpdesk.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@helpdesk.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Setores e usuário admin criados com sucesso');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });