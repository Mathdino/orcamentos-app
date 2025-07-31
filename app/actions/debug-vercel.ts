"use server";

import { prisma } from "@/lib/prisma";

export async function debugVercel() {
  try {
    // Verificar variáveis de ambiente
    const hasDatabaseUrl = !!process.env.DATABASE_URL;
    const nodeEnv = process.env.NODE_ENV;
    const vercelEnv = process.env.VERCEL_ENV;

    // Testar conexão com banco
    let dbConnection = false;
    let dbError = null;
    let clienteCount = 0;

    try {
      await prisma.$connect();
      dbConnection = true;
      clienteCount = await prisma.cliente.count();
    } catch (error) {
      dbError = error instanceof Error ? error.message : "Erro desconhecido";
    } finally {
      await prisma.$disconnect();
    }

    return {
      success: true,
      environment: {
        nodeEnv,
        vercelEnv,
        hasDatabaseUrl,
        databaseUrl: hasDatabaseUrl ? "Configurado" : "Não configurado",
      },
      database: {
        connected: dbConnection,
        error: dbError,
        clienteCount,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString(),
    };
  }
}
