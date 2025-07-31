"use client"

import { formatarBRL } from "../../../../lib/utils"

export default function PagamentosCard({ obras, pagamentos, onVerDetalhes }: { obras: any[], pagamentos: { [obraId: string]: { status: 'PAGO' | 'NAO_PAGO', metodo?: string, parcelas?: number } }, onVerDetalhes: () => void }) {
  // Função para determinar status
  function getStatus(pagamento: { status: 'PAGO' | 'NAO_PAGO', metodo?: string }) {
    if (!pagamento || pagamento.status === 'NAO_PAGO') return { label: 'Atrasado', color: 'text-red-600', badge: 'bg-red-100' }
    if (["pix", "debito", "dinheiro"].includes(pagamento.metodo ?? '')) return { label: 'Pago', color: 'text-green-700', badge: 'bg-green-100' }
    if (["cartao", "boleto"].includes(pagamento.metodo ?? '')) return { label: 'Em andamento', color: 'text-yellow-700', badge: 'bg-yellow-100' }
    return { label: 'Em andamento', color: 'text-yellow-700', badge: 'bg-yellow-100' }
  }

  return (
    <div className="bg-white rounded shadow p-4 min-h-[200px] flex flex-col">
      <h2 className="text-xl text-black font-semibold mb-2">Pagamentos</h2>
      <div className="flex-1 flex flex-col gap-2 justify-center">
        {obras.length === 0 && (
          <div className="text-gray-400 text-center">Sem clientes para este mês.</div>
        )}
        {obras.map(obra => {
          const pagamento = pagamentos[obra.id] || { status: 'NAO_PAGO' }
          const status = getStatus(pagamento)
          return (
            <div key={obra.id} className="flex justify-between items-center border-b last:border-b-0 py-2">
              <span className="font-semibold text-black">{obra.cliente?.nome || 'Orçamento'}</span>
              <span className={`px-2 py-1 rounded text-xs font-bold ${status.color} ${status.badge}`}>{status.label}</span>
            </div>
          )
        })}
      </div>
      {/* Removido botão de detalhes */}
    </div>
  )
} 