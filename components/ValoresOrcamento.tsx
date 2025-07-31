import React, { useState } from "react"
import type { OrcamentoCompleto, Material } from "@/types/orcamento"
import { formatarBRL } from "../lib/utils"

interface ValoresOrcamentoProps {
  orcamento: OrcamentoCompleto
  pagamento: { status: 'PAGO' | 'NAO_PAGO', metodo?: string, parcelas?: number }
  onChangePagamento: (novo: { status: 'PAGO' | 'NAO_PAGO', metodo?: string, parcelas?: number }) => void
  editavel?: boolean
}

export function ValoresOrcamento({ orcamento, pagamento, onChangePagamento, editavel = true }: ValoresOrcamentoProps) {
  const valorMateriais = orcamento.materiais?.reduce((t, m) => t + m.valorTotal, 0) || 0
  const maoObraPrincipal = (orcamento.valorDiariaPrincipal || 0) * (orcamento.diasPrincipal || 1)
  const maoObraAjudantes = (orcamento.ajudantes && orcamento.ajudantes.length > 0)
    ? orcamento.ajudantes.reduce((total, aj) => total + ((aj.valorDiaria || 0) * (aj.dias || 0)), 0)
    : 0
  const valorTotal = orcamento.valorTotal || 0
  const lucroEstimado = valorTotal - valorMateriais - maoObraAjudantes

  // Estado local para expandir/colapsar
  const [aberto, setAberto] = useState(false)

  // Atualiza valor da parcela ao mudar parcelas
  const parcelas = pagamento.parcelas || 1
  const valorParcela = (pagamento.metodo === "cartao" || pagamento.metodo === "boleto") && parcelas > 0
    ? Number((valorTotal / parcelas).toFixed(2))
    : 0

  return (
    <div className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      {/* Cabeçalho colapsável */}
      <button
        className="w-full text-left font-bold text-orange-500 text-lg mb-2 focus:outline-none flex justify-between items-center"
        onClick={() => setAberto(a => !a)}
        aria-expanded={aberto}
      >
        {orcamento.cliente?.nome || "Orçamento"}
        <span className="ml-2 text-black text-base">{aberto ? '▲' : '▼'}</span>
      </button>
      {aberto && (
        <div className="space-y-2 pl-2">
          <div><b>Valor dos Materiais:</b> {formatarBRL(valorMateriais)}</div>
          <div><b>Mão de Obra do Pintor Principal:</b> {formatarBRL(maoObraPrincipal)}</div>
          <div><b>Mão de Obra dos Ajudantes:</b> {formatarBRL(maoObraAjudantes)}</div>
          <div><b>Lucro Estimado:</b> {formatarBRL(lucroEstimado)}</div>
          <div className="flex items-center gap-4">
            <b>Valor Total:</b> <span className="font-bold text-green-700">{formatarBRL(valorTotal)}</span>
          </div>
          {/* Botões Pago/Não Pago */}
          <div className="flex items-center gap-2 mt-2">
            <button
              className={`px-3 py-1 rounded font-semibold ${pagamento.status === 'PAGO' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => editavel && onChangePagamento({ ...pagamento, status: 'PAGO' })}
              disabled={!editavel}
            >Pago</button>
            <button
              className={`px-3 py-1 rounded font-semibold ${pagamento.status === 'NAO_PAGO' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => editavel && onChangePagamento({ ...pagamento, status: 'NAO_PAGO', metodo: undefined, parcelas: undefined })}
              disabled={!editavel}
            >Não Pago</button>
          </div>
          {/* Seleção de método de pagamento só se pago */}
          {pagamento.status === 'PAGO' && (
            <div className="mt-2">
              <label className="font-semibold mr-2">Método de Pagamento:</label>
              <select
                className="border rounded px-2 py-1 text-black"
                value={pagamento.metodo || ''}
                onChange={e => {
                  if (!editavel) return
                  const metodo = e.target.value
                  onChangePagamento({ ...pagamento, metodo, parcelas: metodo === 'cartao' || metodo === 'boleto' ? (pagamento.parcelas || 1) : undefined })
                }}
                disabled={!editavel}
              >
                <option value="">Selecione</option>
                <option value="pix">Pix</option>
                <option value="debito">Débito</option>
                <option value="cartao">Cartão Crédito</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="boleto">Boleto</option>
              </select>
            </div>
          )}
          {/* Parcelas se cartão ou boleto */}
          {pagamento.status === 'PAGO' && (pagamento.metodo === "cartao" || pagamento.metodo === "boleto") && (
            <div className="flex items-center gap-4 mt-2">
              <label>Parcelas:</label>
              <input
                type="number"
                min={1}
                max={36}
                value={parcelas}
                onChange={e => editavel && onChangePagamento({ ...pagamento, parcelas: Number(e.target.value) })}
                className="border rounded px-2 py-1 w-20 text-black"
                disabled={!editavel}
              />
              <span>Valor da Parcela: <b>{formatarBRL(valorParcela)}</b></span>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 