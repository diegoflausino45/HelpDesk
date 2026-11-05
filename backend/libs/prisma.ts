import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// String de conexão ao banco de dados (variável de ambiente DATABASE_URL)
const connectionString = `${process.env.DATABASE_URL}`;

// Adaptador do Prisma para PostgreSQL via driver nativo (pg)
const adapter = new PrismaPg({ connectionString });

// Instância singleton do Prisma Client — compartilhada por toda a aplicação
const prisma = new PrismaClient({ adapter });

export { prisma };