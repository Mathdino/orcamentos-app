"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import ReceitaCard from "./components/ReceitaCard"
import ServicosCard from "./components/ServicosCard"
import PagamentosCard from "./components/PagamentosCard"
import { buscarRelatorioFinanceiro } from "@/app/actions/financeiro-actions"
import { buscarOrcamentos } from "@/app/actions/orcamento-actions"
import { ValoresOrcamento } from "@/components/ValoresOrcamento"
import { buscarPagamentosPorMes, atualizarPagamento } from "@/app/actions/financeiro-actions"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function FinanceiroMesPage() {
  const router = useRouter()
  const params = useParams()
  const [mesSelecionado, setMesSelecionado] = useState(params["ano-mes"] as string)
  const [relatorio, setRelatorio] = useState<any>(null)
  const [obras, setObras] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagamentos, setPagamentos] = useState<{ [obraId: string]: { status: 'PAGO' | 'NAO_PAGO', metodo?: string, parcelas?: number } }>({})
  const [periodo, setPeriodo] = useState("MES_ATUAL")

  // Função para calcular datas conforme o período
  function getPeriodoDatas() {
    const now = new Date()
    let dataInicio, dataFim
    if (periodo === "MES_ATUAL") {
      const [ano, mes] = mesSelecionado.split("-").map(Number)
      dataInicio = new Date(ano, mes - 1, 1)
      dataFim = new Date(ano, mes, 0, 23, 59, 59, 999)
    } else if (periodo === "ULTIMOS_3_MESES") {
      dataInicio = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      dataFim = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else if (periodo === "ULTIMOS_6_MESES") {
      dataInicio = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      dataFim = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    } else if (periodo === "ULTIMO_ANO") {
      dataInicio = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1)
      dataFim = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
    }
    return { dataInicio, dataFim }
  }

  useEffect(() => {
    const fetchDados = async () => {
      setLoading(true)
      const { dataInicio, dataFim } = getPeriodoDatas()
      // Buscar relatorio financeiro
      const relatorioResult = await buscarRelatorioFinanceiro({ dataInicio, dataFim })
      setRelatorio(relatorioResult.success ? relatorioResult.relatorio : null)
      // Buscar orçamentos concluídos do período
      const orcamentosResult = await buscarOrcamentos()
      let obrasPeriodo: any[] = []
      let pagamentosMap: { [obraId: string]: { status: 'PAGO' | 'NAO_PAGO', metodo?: string, parcelas?: number } } = {}
      if (orcamentosResult.success && orcamentosResult.orcamentos) {
        obrasPeriodo = orcamentosResult.orcamentos.filter((o: any) => {
          if (o.status !== "CONCLUIDO" || !o.dataConclusao) return false
          const data = new Date(o.dataConclusao)
          return data >= (dataInicio as Date) && data <= (dataFim as Date)
        }).map((obra: any) => {
          // Mapear ajudantes
          const ajudantes = Array.isArray(obra.ajudantes)
            ? obra.ajudantes
            : (typeof obra.ajudantes === 'string' ? (() => { try { return JSON.parse(obra.ajudantes) } catch { return [] } })() : [])
          // Mapear pagamentos (pegar o último pagamento se houver)
          let pagamento = undefined
          if (Array.isArray(obra.pagamentos) && obra.pagamentos.length > 0) {
            // Pega o pagamento mais recente
            const ultimo = obra.pagamentos.reduce((a: any, b: any) => new Date(a.dataVencimento) > new Date(b.dataVencimento) ? a : b)
            pagamento = {
              status: ultimo.statusPagamento === 'PAGO' ? 'PAGO' as const : 'NAO_PAGO' as const,
              metodo: mapMetodoPagamentoToFrontend(ultimo.metodoPagamento),
              parcelas: ultimo.totalParcelas || 1,
            }
          }
          pagamentosMap[obra.id] = pagamento || { status: 'NAO_PAGO' as const }
          return { ...obra, ajudantes }
        })
        setObras(obrasPeriodo)
      } else {
        setObras([])
      }
      setPagamentos(pagamentosMap)
      setLoading(false)
    }
    fetchDados()
  }, [mesSelecionado, periodo])

  // Mapear método do banco para frontend
  function mapMetodoPagamentoToFrontend(metodo: string) {
    switch (metodo) {
      case 'PIX': return 'pix'
      case 'CARTAO_DEBITO': return 'debito'
      case 'CARTAO_CREDITO': return 'cartao'
      case 'DINHEIRO': return 'dinheiro'
      case 'TRANSFERENCIA': return 'boleto'
      default: return ''
    }
  }

  // Handler para trocar de mês
  const handleChangeMes = (novoMes: string) => {
    setMesSelecionado(novoMes)
    router.push(`/financeiro/${novoMes}`)
  }

  // Handler para atualizar status/metodo de pagamento de uma obra
  const handlePagamentoChange = async (obraId: string, novo: { status: 'PAGO' | 'NAO_PAGO', metodo?: string, parcelas?: number }) => {
    // Atualizar no banco
    const obra = obras.find(o => o.id === obraId)
    if (!obra) return
    await atualizarPagamento({
      orcamentoId: obraId,
      valor: obra.valorTotal,
      metodoPagamento: novo.metodo || 'pix',
      statusPagamento: novo.status,
      totalParcelas: novo.parcelas || 1,
    })
    // Atualizar local
    setPagamentos(prev => ({
      ...prev,
      [obraId]: { ...prev[obraId], ...novo }
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mt-4 mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold">Financeiro - {mesSelecionado}</h1>
          <div className="flex gap-2 items-center">
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-48 text-black">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MES_ATUAL">Mês atual</SelectItem>
                <SelectItem value="ULTIMOS_3_MESES">Últimos 3 meses</SelectItem>
                <SelectItem value="ULTIMOS_6_MESES">Últimos 6 meses</SelectItem>
                <SelectItem value="ULTIMO_ANO">Último ano</SelectItem>
              </SelectContent>
            </Select>
            <input
              type="month"
              value={mesSelecionado}
              onChange={e => handleChangeMes(e.target.value)}
              className="border text-black rounded px-2 py-1 w-fit"
              disabled={periodo !== "MES_ATUAL"}
            />
          </div>
        </div>
        {loading ? (
          <div className="text-gray-400 text-center py-12">Carregando dados financeiros...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            <ReceitaCard obras={obras} />
            {/* Exibir valores detalhados de cada obra */}
            {obras.length > 0 && (
              <div className="bg-white text-black rounded shadow-xl p-4">
                <h2 className="text-xl font-semibold mb-4">Valores Detalhados dos Orçamentos</h2>
                <div className="space-y-6">
                  {obras.map((obra) => (
                    <ValoresOrcamento
                      key={obra.id}
                      orcamento={obra}
                      pagamento={pagamentos[obra.id] || { status: 'NAO_PAGO' }}
                      onChangePagamento={novo => handlePagamentoChange(obra.id, novo)}
                      editavel={periodo === "MES_ATUAL"}
                    />
                  ))}
                </div>
              </div>
            )}
            <ServicosCard obras={obras} />
            <PagamentosCard
              obras={obras}
              pagamentos={pagamentos}
              onVerDetalhes={() => router.push(`/financeiro/${mesSelecionado}/pagamentos`)}
            />
          </div>
        )}
      </div>
    </div>
  )
} 