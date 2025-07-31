"use server"

import { prisma } from "@/lib/prisma"
import type { DadosOrcamento } from "@/types/orcamento"
import { revalidatePath } from "next/cache"

export async function salvarOrcamento(dados: DadosOrcamento) {
  try {
    // Calcular valor total dos materiais
    const valorMateriais = dados.materiais.reduce((total, material) => {
      return total + material.quantidade * material.valorUnit
    }, 0)

    // Assumir custo de materiais como 70% do valor de venda (pode ser configurável)
    const custoMateriais = valorMateriais * 0.7

    const valorTotal = valorMateriais + dados.valorMaoObra + (dados.lucro || 0)

    // Criar ou encontrar cliente
    let cliente = await prisma.cliente.findFirst({
      where: {
        telefone: dados.cliente.telefone,
      },
    })

    if (!cliente) {
      // Ajuste: garantir que só um dos campos (cpf/cnpj) seja enviado
      let cpf = dados.cliente.cpf
      let cnpj = dados.cliente.cnpj
      if (dados.cliente.tipo === "fisica") {
        cnpj = undefined
      } else {
        cpf = undefined
      }
      // Montar objeto data sem campos undefined
      const clienteData: any = {
        nome: dados.cliente.nome,
        telefone: dados.cliente.telefone,
        endereco: dados.cliente.endereco,
        tipo: dados.cliente.tipo,
        cep: dados.cliente.cep,
        numero: dados.cliente.numero,
      };
      if (dados.cliente.email && dados.cliente.email.trim() !== "") clienteData.email = dados.cliente.email;
      if (dados.cliente.bairro && dados.cliente.bairro.trim() !== "") clienteData.bairro = dados.cliente.bairro;
      if (cpf && cpf.trim() !== "") clienteData.cpf = cpf;
      if (cnpj && cnpj.trim() !== "") clienteData.cnpj = cnpj;
      if (dados.cliente.complemento && dados.cliente.complemento.trim() !== "") clienteData.complemento = dados.cliente.complemento;
      cliente = await prisma.cliente.create({
        data: clienteData
      })
    }

    // Criar orçamento
    const orcamento = await prisma.orcamento.create({
      data: {
        clienteId: dados.cliente.id || cliente.id,
        localObra: dados.localObra,
        detalhesEspaco: dados.detalhesEspaco,
        metragem: dados.metragem,
        tempoObra: dados.tempoObra,
        tipoServico: dados.tipoServico,
        tipoMetragem: dados.tipoMetragem,
        valorEmpreita: dados.valorEmpreita,
        valorDiariaPrincipal: dados.valorDiariaPrincipal,
        diasPrincipal: dados.diasPrincipal,
        ajudantes: dados.ajudantes ? JSON.stringify(dados.ajudantes) : undefined,
        especificacoes: dados.especificacoes,
        valorMaoObra: dados.valorMaoObra,
        valorTotal: valorTotal,
        custoMateriais: custoMateriais,
        lucro: dados.lucro,
        observacoes: dados.observacoes,
        status: "PENDENTE",
        materiais: {
          create: dados.materiais.map((material) => ({
            nome: material.nome,
            marca: material.marca,
            quantidade: material.quantidade,
            unidade: material.unidade,
            valorUnit: material.valorUnit,
            valorTotal: material.quantidade * material.valorUnit,
          })),
        },
        dataInicioObra: dados.dataInicioObra ? new Date(dados.dataInicioObra) : undefined,
        dataTerminoObra: dados.dataTerminoObra ? new Date(dados.dataTerminoObra) : undefined,
      },
      include: {
        cliente: true,
        materiais: true,
      },
    })

    revalidatePath("/orcamentos")
    revalidatePath("/financeiro")
    return { success: true, orcamento }
  } catch (error) {
    console.error("Erro ao salvar orçamento:", error)
    let errorMsg = "Erro ao salvar orçamento"
    if (error instanceof Error) errorMsg = error.message
    return { success: false, error: errorMsg }
  }
}

export async function aprovarOrcamento(
  orcamentoId: string,
  dadosPagamento?: {
    metodoPagamento: string
    dataVencimento: Date
    totalParcelas?: number
  },
) {
  try {
    const orcamento = await prisma.orcamento.update({
      where: { id: orcamentoId },
      data: {
        status: "APROVADO" as any,
        dataInicio: new Date(),
      },
    })

    // Criar pagamento(s) se dados fornecidos
    if (dadosPagamento) {
      const totalParcelas = dadosPagamento.totalParcelas || 1
      const valorParcela = orcamento.valorTotal / totalParcelas

      for (let i = 1; i <= totalParcelas; i++) {
        const dataVencimento = new Date(dadosPagamento.dataVencimento)
        dataVencimento.setMonth(dataVencimento.getMonth() + (i - 1))

        await prisma.pagamento.create({
          data: {
            orcamentoId: orcamento.id,
            valor: valorParcela,
            metodoPagamento: dadosPagamento.metodoPagamento,
            dataVencimento: dataVencimento,
            numeroParcela: i,
            totalParcelas: totalParcelas,
          },
        })
      }
    }

    revalidatePath("/orcamentos")
    revalidatePath("/financeiro")
    return { success: true, orcamento }
  } catch (error) {
    return { success: false, error: "Erro ao aprovar orçamento" }
  }
}

export async function buscarOrcamentos() {
  try {
    const orcamentos = await prisma.orcamento.findMany({
      include: {
        cliente: true,
        materiais: true,
        pagamentos: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, orcamentos }
  } catch (error) {
    return { success: false, error: "Erro ao buscar orçamentos" }
  }
}

export async function buscarClientes() {
  try {
    const clientes = await prisma.cliente.findMany({
      orderBy: {
        nome: "asc",
      },
    })

    return { success: true, clientes }
  } catch (error) {
    return { success: false, error: "Erro ao buscar clientes" }
  }
}

export async function buscarOrcamentoPorId(id: string) {
  try {
    const orcamento = await prisma.orcamento.findUnique({
      where: { id },
      include: {
        cliente: true,
        materiais: true,
        pagamentos: true,
      },
    })
    if (!orcamento) return { success: false, error: "Orçamento não encontrado" }
    // Corrigir campo ajudantes para array
    let ajudantes = [];
    if (orcamento.ajudantes) {
      try {
        ajudantes = typeof orcamento.ajudantes === 'string' ? JSON.parse(orcamento.ajudantes) : orcamento.ajudantes;
      } catch {
        ajudantes = [];
      }
    }
    return { success: true, orcamento: { ...orcamento, ajudantes } }
  } catch (error) {
    return { success: false, error: "Erro ao buscar orçamento" }
  }
}

export async function atualizarOrcamento(id: string, dados: any) {
  try {
    // Buscar o orçamento para checar o status atual
    const orcamentoExistente = await prisma.orcamento.findUnique({ where: { id } });
    if (!orcamentoExistente) {
      return { success: false, error: "Orçamento não encontrado" };
    }
    if (orcamentoExistente.status === "CONCLUIDO") {
      return { success: false, error: "Não é possível editar um orçamento concluído." };
    }
    // Atualiza apenas campos principais, cliente e status
    const orcamento = await prisma.orcamento.update({
      where: { id },
      data: {
        localObra: dados.localObra,
        observacoes: dados.observacoes,
        // Atualiza status se fornecido
        ...(dados.status && { status: dados.status }),
        // Adiciona atualização de dataInicio e dataConclusao
        ...(dados.dataInicio && { dataInicio: new Date(dados.dataInicio) }),
        ...(dados.dataConclusao && { dataConclusao: new Date(dados.dataConclusao) }),
        // Adicione outros campos editáveis conforme necessário
        cliente: {
          update: {
            nome: dados.cliente.nome,
            telefone: dados.cliente.telefone,
          },
        },
      },
      include: {
        cliente: true,
        materiais: true,
      },
    })
    revalidatePath("/orcamentos")
    return { success: true, orcamento }
  } catch (error) {
    return { success: false, error: "Erro ao atualizar orçamento" }
  }
}

export async function excluirOrcamento(id: string) {
  try {
    await prisma.orcamento.delete({ where: { id } })
    revalidatePath("/orcamentos")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Erro ao excluir orçamento" }
  }
}

export async function adicionarMaterialOrcamento(orcamentoId: string, material: any) {
  try {
    // Buscar o orçamento para checar o status
    const orcamento = await prisma.orcamento.findUnique({ where: { id: orcamentoId } })
    if (!orcamento) {
      return { success: false, error: "Orçamento não encontrado" }
    }
    if (orcamento.status === "CONCLUIDO") {
      return { success: false, error: "Não é possível adicionar materiais a uma obra concluída." }
    }
    const novoMaterial = await prisma.material.create({
      data: {
        orcamentoId,
        nome: material.nome,
        marca: material.marca || '',
        quantidade: material.quantidade,
        unidade: material.unidade || '',
        valorUnit: material.valor || 0,
        valorTotal: (material.quantidade || 1) * (material.valor || 0),
      },
    })
    revalidatePath("/obras")
    revalidatePath(`/obras/${orcamentoId}`)
    return { success: true, material: novoMaterial }
  } catch (error) {
    return { success: false, error: "Erro ao adicionar material" }
  }
}
