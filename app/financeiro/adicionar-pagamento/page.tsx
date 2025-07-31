"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { criarPagamento } from "@/app/actions/financeiro-actions"
import { buscarOrcamentos } from "@/app/actions/orcamento-actions"
import Link from "next/link"
import { formatarBRL } from "../../../lib/utils"

export default function AdicionarPagamento() {
  const router = useRouter()
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [dadosPagamento, setDadosPagamento] = useState({
    orcamentoId: "",
    valor: 0,
    metodoPagamento: "",
    dataVencimento: "",
    numeroParcela: 1,
    totalParcelas: 1,
    observacoes: "",
  })

  useEffect(() => {
    carregarOrcamentos()
  }, [])

  const carregarOrcamentos = async () => {
    try {
      const resultado = await buscarOrcamentos()
      if (resultado.success) {
        // Filtrar apenas orçamentos aprovados
        const orcamentosAprovados = resultado.orcamentos.filter((o) => o.status === "APROVADO")
        setOrcamentos(orcamentosAprovados)
      }
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error)
    }
  }

  const handleSalvar = async () => {
    if (
      !dadosPagamento.orcamentoId ||
      !dadosPagamento.valor ||
      !dadosPagamento.metodoPagamento ||
      !dadosPagamento.dataVencimento
    ) {
      alert("Preencha todos os campos obrigatórios")
      return
    }

    setLoading(true)
    try {
      const resultado = await criarPagamento({
        ...dadosPagamento,
        dataVencimento: new Date(dadosPagamento.dataVencimento),
      })

      if (resultado.success) {
        alert("Pagamento criado com sucesso!")
        router.push("/financeiro")
      } else {
        alert("Erro ao criar pagamento: " + resultado.error)
      }
    } catch (error) {
      alert("Erro ao criar pagamento")
    } finally {
      setLoading(false)
    }
  }

  const orcamentoSelecionado = orcamentos.find((o) => o.id === dadosPagamento.orcamentoId)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/financeiro">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Adicionar Pagamento</h1>
            <p className="text-gray-600">Registre um novo pagamento</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados do Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Orçamento *</Label>
              <Select
                value={dadosPagamento.orcamentoId}
                onValueChange={(value) => {
                  const orcamento = orcamentos.find((o) => o.id === value)
                  setDadosPagamento({
                    ...dadosPagamento,
                    orcamentoId: value,
                    valor: orcamento ? orcamento.valorTotal : 0,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um orçamento" />
                </SelectTrigger>
                <SelectContent>
                  {orcamentos.map((orcamento) => (
                    <SelectItem key={orcamento.id} value={orcamento.id}>
                      {orcamento.cliente.nome} - {formatarBRL(orcamento.valorTotal)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {orcamentoSelecionado && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Detalhes do Orçamento</h4>
                <div className="text-sm space-y-1">
                  <div>Cliente: {orcamentoSelecionado.cliente.nome}</div>
                  <div>Local: {orcamentoSelecionado.localObra}</div>
                  <div>Valor Total: {formatarBRL(orcamentoSelecionado.valorTotal)}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={dadosPagamento.valor}
                  onChange={(e) =>
                    setDadosPagamento({ ...dadosPagamento, valor: Number.parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label>Data de Vencimento *</Label>
                <Input
                  type="date"
                  value={dadosPagamento.dataVencimento}
                  onChange={(e) => setDadosPagamento({ ...dadosPagamento, dataVencimento: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Método de Pagamento *</Label>
              <Select
                value={dadosPagamento.metodoPagamento}
                onValueChange={(value) => setDadosPagamento({ ...dadosPagamento, metodoPagamento: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PIX">PIX</SelectItem>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                  <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferência Bancária</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Número da Parcela</Label>
                <Input
                  type="number"
                  min="1"
                  value={dadosPagamento.numeroParcela}
                  onChange={(e) =>
                    setDadosPagamento({ ...dadosPagamento, numeroParcela: Number.parseInt(e.target.value) || 1 })
                  }
                />
              </div>
              <div>
                <Label>Total de Parcelas</Label>
                <Input
                  type="number"
                  min="1"
                  value={dadosPagamento.totalParcelas}
                  onChange={(e) =>
                    setDadosPagamento({ ...dadosPagamento, totalParcelas: Number.parseInt(e.target.value) || 1 })
                  }
                />
              </div>
            </div>

            <div>
              <Label>Observações</Label>
              <Textarea
                value={dadosPagamento.observacoes}
                onChange={(e) => setDadosPagamento({ ...dadosPagamento, observacoes: e.target.value })}
                placeholder="Observações sobre o pagamento..."
                rows={3}
              />
            </div>

            <Button onClick={handleSalvar} disabled={loading} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Pagamento"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
