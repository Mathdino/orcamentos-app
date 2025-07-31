"use server";

import { prisma } from "@/lib/prisma";

export async function buscarClientesComOrcamentos() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        orcamentos: {
          include: {
            materiais: true,
          },
        },
      },
      orderBy: {
        nome: "asc",
      },
    });
    return { success: true, clientes };
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return { success: false, error: "Erro ao buscar clientes" };
  }
}

export async function editarCliente(id: string, dados: { nome: string; telefone: string; email?: string; endereco: string; bairro?: string }) {
  try {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nome: dados.nome,
        telefone: dados.telefone,
        email: dados.email,
        endereco: dados.endereco,
        bairro: dados.bairro,
      },
    });
    return { success: true, cliente };
  } catch (error) {
    console.error("Erro ao editar cliente:", error);
    return { success: false, error: "Erro ao editar cliente" };
  }
}

export async function excluirCliente(id: string) {
  try {
    await prisma.cliente.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    return { success: false, error: "Erro ao excluir cliente" };
  }
} 