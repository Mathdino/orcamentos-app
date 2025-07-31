"use server";

import { prisma } from "@/lib/prisma";

export async function testarConexaoDB() {
  try {
    // Testar conexão básica
    await prisma.$connect();

    // Testar uma query simples
    const clienteCount = await prisma.cliente.count();

    return {
      success: true,
      message: "Conexão com banco de dados OK",
      clienteCount,
    };
  } catch (error) {
    console.error("Erro na conexão com banco de dados:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido na conexão com banco de dados",
    };
  } finally {
    await prisma.$disconnect();
  }
}
