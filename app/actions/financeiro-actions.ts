"use server"

import { prisma } from "@/lib/prisma"
import type { FiltroFinanceiro, RelatorioFinanceiro } from "@/types/orcamento"
import { revalidatePath } from "next/cache"
import { MetodoPagamento, StatusPagamento } from "@prisma/client"

export async function buscarRelatorioFinanceiro(filtros: FiltroFinanceiro = {}) {
  try {
    const whereClause: any = {}

    if (filtros.dataInicio && filtros.dataFim) {
      whereClause.createdAt = {
        gte: filtros.dataInicio,
        lte: filtros.dataFim,
      }
    }

    if (filtros.clienteId) {
      whereClause.clienteId = filtros.clienteId
    }

    // Buscar orçamentos com filtros
    const orcamentos = await prisma.orcamento.findMany({
      where: whereClause,
      include: {
        cliente: true,
        pagamentos: true,
        materiais: true,
      },
    })

    // Calcular métricas
    const totalFaturamento = orcamentos
      .filter((o) => o.status === "CONCLUIDO")
      .reduce((total, o) => total + o.valorTotal, 0)

    const totalLucro = orcamentos
      .filter((o) => o.status === "CONCLUIDO")
      .reduce((total, o) => total + (o.valorTotal - o.custoMateriais), 0)

    const obrasConcluidas = orcamentos.filter((o) => o.status === "CONCLUIDO").length
    const obrasAndamento = orcamentos.filter((o) => o.status === "EM_ANDAMENTO").length

    // Pagamentos pendentes e atrasados
    const pagamentos = await prisma.pagamento.findMany({
      where: {
        orcamento: whereClause,
      },
    })

    const totalPendente = pagamentos
      .filter((p) => p.statusPagamento === "PENDENTE")
      .reduce((total, p) => total + p.valor, 0)

    const totalAtrasado = pagamentos
      .filter((p) => p.statusPagamento === "ATRASADO")
      .reduce((total, p) => total + p.valor, 0)

    // Pagamentos por método
    const pagamentosPorMetodo = pagamentos
      .filter((p) => p.statusPagamento === "PAGO")
      .reduce(
        (acc, p) => {
          acc[p.metodoPagamento] = (acc[p.metodoPagamento] || 0) + p.valor
          return acc
        },
        {} as Record<string, number>,
      )

    // Faturamento por mês (últimos 12 meses)
    const faturamentoPorMes = []
    for (let i = 11; i >= 0; i--) {
      const data = new Date()
      data.setMonth(data.getMonth() - i)
      const mesAno = data.toISOString().slice(0, 7)

      const orcamentosMes = orcamentos.filter((o) => {
        return o.dataConclusao && o.dataConclusao.toISOString().slice(0, 7) === mesAno
      })

      const valorMes = orcamentosMes.reduce((total, o) => total + o.valorTotal, 0)
      const lucroMes = orcamentosMes.reduce((total, o) => total + (o.valorTotal - o.custoMateriais), 0)

      faturamentoPorMes.push({
        mes: data.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
        valor: valorMes,
        lucro: lucroMes,
      })
    }

    const relatorio: RelatorioFinanceiro = {
      totalFaturamento,
      totalLucro,
      totalPendente,
      totalAtrasado,
      obrasConcluidas,
      obrasAndamento,
      pagamentosPorMetodo,
      faturamentoPorMes,
    }

    return { success: true, relatorio }
  } catch (error) {
    console.error("Erro ao buscar relatório financeiro:", error)
    return { success: false, error: "Erro ao buscar dados financeiros" }
  }
}

export async function buscarPagamentosAtrasados() {
  try {
    const hoje = new Date()

    const pagamentosAtrasados = await prisma.pagamento.findMany({
      where: {
        statusPagamento: "PENDENTE",
        dataVencimento: {
          lt: hoje,
        },
      },
      include: {
        orcamento: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: {
        dataVencimento: "asc",
      },
    })

    // Atualizar status para ATRASADO
    await prisma.pagamento.updateMany({
      where: {
        statusPagamento: "PENDENTE",
        dataVencimento: {
          lt: hoje,
        },
      },
      data: {
        statusPagamento: "ATRASADO",
      },
    })

    return { success: true, pagamentos: pagamentosAtrasados }
  } catch (error) {
    return { success: false, error: "Erro ao buscar pagamentos atrasados" }
  }
}

export async function marcarPagamentoComoPago(pagamentoId: string) {
  try {
    const pagamento = await prisma.pagamento.update({
      where: { id: pagamentoId },
      data: {
        statusPagamento: "PAGO",
        dataPagamento: new Date(),
      },
    })

    revalidatePath("/financeiro")
    return { success: true, pagamento }
  } catch (error) {
    return { success: false, error: "Erro ao marcar pagamento como pago" }
  }
}

export async function criarPagamento(dados: {
  orcamentoId: string
  valor: number
  metodoPagamento: string
  dataVencimento: Date
  numeroParcela?: number
  totalParcelas?: number
  observacoes?: string
}) {
  try {
    // Mapear método para enum do banco
    const metodoMap: Record<string, MetodoPagamento> = {
      pix: MetodoPagamento.PIX,
      debito: MetodoPagamento.CARTAO_DEBITO,
      cartao: MetodoPagamento.CARTAO_CREDITO,
      dinheiro: MetodoPagamento.DINHEIRO,
      boleto: MetodoPagamento.TRANSFERENCIA,
    }
    const metodoPagamento = metodoMap[dados.metodoPagamento] || MetodoPagamento.PIX
    const pagamento = await prisma.pagamento.create({
      data: {
        orcamentoId: dados.orcamentoId,
        valor: dados.valor,
        metodoPagamento,
        dataVencimento: dados.dataVencimento,
        numeroParcela: dados.numeroParcela || 1,
        totalParcelas: dados.totalParcelas || 1,
        observacoes: dados.observacoes,
      },
    })

    revalidatePath("/financeiro")
    return { success: true, pagamento }
  } catch (error) {
    return { success: false, error: "Erro ao criar pagamento" }
  }
}

export async function atualizarPagamento(dados: {
  orcamentoId: string
  valor: number
  metodoPagamento: string
  statusPagamento: string
  totalParcelas?: number
  numeroParcela?: number
  dataVencimento?: Date
  dataPagamento?: Date
  observacoes?: string
}) {
  try {
    // Mapear método para enum do banco
    const metodoMap: Record<string, MetodoPagamento> = {
      pix: MetodoPagamento.PIX,
      debito: MetodoPagamento.CARTAO_DEBITO,
      cartao: MetodoPagamento.CARTAO_CREDITO,
      dinheiro: MetodoPagamento.DINHEIRO,
      boleto: MetodoPagamento.TRANSFERENCIA,
    }
    const statusMap: Record<string, StatusPagamento> = {
      PAGO: StatusPagamento.PAGO,
      NAO_PAGO: StatusPagamento.PENDENTE,
    }
    const metodoPagamento = metodoMap[dados.metodoPagamento] || MetodoPagamento.PIX
    const statusPagamento = statusMap[dados.statusPagamento] || StatusPagamento.PENDENTE
    // Tenta encontrar pagamento existente para o orçamento (último)
    const pagamentoExistente = await prisma.pagamento.findFirst({
      where: { orcamentoId: dados.orcamentoId },
      orderBy: { createdAt: 'desc' },
    })
    let pagamento
    if (pagamentoExistente) {
      pagamento = await prisma.pagamento.update({
        where: { id: pagamentoExistente.id },
        data: {
          valor: dados.valor,
          metodoPagamento,
          statusPagamento,
          totalParcelas: dados.totalParcelas || 1,
          numeroParcela: dados.numeroParcela || 1,
          dataVencimento: dados.dataVencimento || pagamentoExistente.dataVencimento,
          dataPagamento: dados.dataPagamento,
          observacoes: dados.observacoes,
        },
      })
    } else {
      pagamento = await prisma.pagamento.create({
        data: {
          orcamentoId: dados.orcamentoId,
          valor: dados.valor,
          metodoPagamento,
          statusPagamento,
          totalParcelas: dados.totalParcelas || 1,
          numeroParcela: dados.numeroParcela || 1,
          dataVencimento: dados.dataVencimento || new Date(),
          dataPagamento: dados.dataPagamento,
          observacoes: dados.observacoes,
        },
      })
    }
    revalidatePath("/financeiro")
    return { success: true, pagamento }
  } catch (error) {
    return { success: false, error: "Erro ao atualizar pagamento" }
  }
}

export async function buscarPagamentosPorMes(ano: number, mes: number) {
  try {
    // Primeiro e último dia do mês
    const dataInicio = new Date(ano, mes - 1, 1)
    const dataFim = new Date(ano, mes, 0, 23, 59, 59, 999)

    const pagamentos = await prisma.pagamento.findMany({
      where: {
        dataVencimento: {
          gte: dataInicio,
          lte: dataFim,
        },
      },
      include: {
        orcamento: {
          include: {
            cliente: true,
          },
        },
      },
      orderBy: {
        dataVencimento: "asc",
      },
    })

    return { success: true, pagamentos }
  } catch (error) {
    return { success: false, error: "Erro ao buscar pagamentos do mês" }
  }
}
