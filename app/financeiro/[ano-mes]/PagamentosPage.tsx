"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { buscarPagamentosPorMes } from "@/app/actions/financeiro-actions"
import { formatarBRL } from "../../../lib/utils"

type StatusPagamento = "PAGO" | "EM_ANDAMENTO" | "ATRASADO" | "PENDENTE" | "CANCELADO"

type PagamentoObra = {
  id: string
  cliente: string
  nomeObra: string
  valor: number
  status: StatusPagamento
}

export default function PagamentosPage() {
  const router = useRouter()
  const params = useParams()
  const mesSelecionado = params["ano-mes"] as string
  const [pagamentos, setPagamentos] = useState<PagamentoObra[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPagamentos = async () => {
      setLoading(true)
      const [ano, mes] = mesSelecionado.split("-").map(Number)
      const result = await buscarPagamentosPorMes(ano, mes)
      if (result.success && result.pagamentos) {
        setPagamentos(
          result.pagamentos.map((p: any) => ({
            id: p.id,
            cliente: p.orcamento?.cliente?.nome || "",
            nomeObra: p.orcamento?.localObra || "",
            valor: p.valor,
            status: p.statusPagamento,
          }))
        )
      }
      setLoading(false)
    }
    fetchPagamentos()
  }, [mesSelecionado])

  const handleStatusChange = (id: string, novoStatus: StatusPagamento) => {
    setPagamentos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: novoStatus } : p))
    )
    // Aqui você pode chamar uma action para atualizar o status no backend
  }

  const statusColors: Record<StatusPagamento, string> = {
    PAGO: "bg-green-100 text-green-700",
    EM_ANDAMENTO: "bg-yellow-100 text-yellow-700",
    ATRASADO: "bg-red-100 text-red-700",
    PENDENTE: "bg-gray-100 text-gray-700",
    CANCELADO: "bg-gray-200 text-gray-400",
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8 gap-4">
        <button
          className="bg-gray-200 rounded px-3 py-1 hover:bg-gray-300"
          onClick={() => router.back()}
        >
          Voltar
        </button>
        <h1 className="text-2xl font-bold">Pagamentos - {mesSelecionado}</h1>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="text-gray-400 text-center py-12">Carregando pagamentos...</div>
        ) : pagamentos.length === 0 ? (
          <div className="text-gray-400 text-center py-12">Nenhum pagamento encontrado para este mês.</div>
        ) : (
          pagamentos.map((pagamento) => (
            <div
              key={pagamento.id}
              className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg shadow ${statusColors[pagamento.status]}`}
            >
              <div>
                <div className="font-semibold">{pagamento.cliente}</div>
                <div className="text-sm text-gray-600">{pagamento.nomeObra}</div>
              </div>
              <div className="font-bold text-lg">{formatarBRL(pagamento.valor)}</div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                <select
                  className="border rounded px-2 py-1"
                  value={pagamento.status}
                  onChange={e => handleStatusChange(pagamento.id, e.target.value as StatusPagamento)}
                >
                  <option value="PAGO">Pago</option>
                  <option value="EM_ANDAMENTO">Em Andamento</option>
                  <option value="ATRASADO">Atrasado</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 