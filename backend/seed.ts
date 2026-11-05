import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from './generated/prisma/client';
import bcrypt from 'bcryptjs';

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
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

  // Conta admin de DEMONSTRAÇÃO, apenas para uso local.
  // A senha é pública (documentada no README): troque-a ou remova a conta
  // antes de rodar o seed em qualquer ambiente acessível pela internet.
  const hashedPassword = await bcrypt.hash('admin123', 10);
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