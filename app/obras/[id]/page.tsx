"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { buscarOrcamentoPorId, atualizarOrcamento, adicionarMaterialOrcamento } from "@/app/actions/orcamento-actions"
import { criarPagamento } from "@/app/actions/financeiro-actions"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { Label } from "@/components/ui/label"
import { ptBR } from "date-fns/locale"
import { formatarBRL } from "../../../lib/utils"

export default function ObraDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const obraId = Array.isArray(params.id) ? params.id[0] : params.id

  const [obra, setObra] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [novoMaterial, setNovoMaterial] = useState({ nome: "", quantidade: 1, valor: 0, marca: "" })
  const [status, setStatus] = useState("")
  const [mostrarFormMaterial, setMostrarFormMaterial] = useState(false)

  useEffect(() => {
    if (obraId) carregarObra()
  }, [obraId])

  const carregarObra = async () => {
    if (!obraId) return
    setLoading(true)
    try {
      const resultado = await buscarOrcamentoPorId(obraId)
      if (resultado.success && resultado.orcamento) {
        setObra(resultado.orcamento)
        setStatus(resultado.orcamento.status)
      }
    } catch (error) {
      console.error("Erro ao carregar obra:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMaterial = async () => {
    if (!obraId) return
    const result = await adicionarMaterialOrcamento(obraId, novoMaterial)
    if (result.success) {
      setNovoMaterial({ nome: "", quantidade: 1, valor: 0, marca: "" })
      carregarObra()
    } else {
      alert(result.error || "Erro ao adicionar material")
    }
  }

  const handleStatusChange = async (novoStatus: string) => {
    setStatus(novoStatus)
    if (!obraId) return
    await atualizarOrcamento(obraId, { status: novoStatus })
    if (novoStatus === "CONCLUIDO") {
      if (obra) {
        await criarPagamento({
          orcamentoId: obraId,
          valor: obra.valorTotal,
          metodoPagamento: "DINHEIRO",
          dataVencimento: new Date(),
          numeroParcela: 1,
          totalParcelas: 1,
          observacoes: "Pagamento gerado automaticamente ao finalizar a obra."
        })
      }
      alert("Obra finalizada! Valores enviados para financeiro.")
    }
    carregarObra()
    await new Promise(res => setTimeout(res, 500))
    router.push("/obras")
  }

  if (loading) {
    return <div className="p-8 text-center">Carregando detalhes da obra...</div>
  }

  if (!obra) {
    return <div className="p-8 text-center text-red-500">Obra não encontrada.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Detalhes da Obra</h1>
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="mb-2 font-semibold">Cliente: {obra.cliente?.nome}</div>
          <div className="mb-2">Telefone: {obra.cliente?.telefone}</div>
          {obra.cliente?.bairro && (
            <div className="mb-2">Bairro: {obra.cliente.bairro}</div>
          )}
          <div className="mb-2">Local: {obra.localObra}</div>
          <div className="mb-2">Valor Total: <span className="font-bold text-green-600">{formatarBRL(obra.valorTotal)}</span></div>
          <div className="mb-2">Orçamento: <Badge>{
            status === "NAO_INICIADO" ? "Não iniciado" :
            status === "EM_PREPARACAO" ? "Em preparação" :
            status === "CONCLUIDO" ? "Finalizada" : status
          }</Badge></div>
          <div className="mb-2">Data de criação: {new Date(String(obra.createdAt)).toLocaleDateString("pt-BR")}</div>
        </CardContent>
      </Card>

      {/* Calendário da obra */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Calendário da Obra</h2>
          {obra.dataInicio ? (
            <DayPicker
              mode="range"
              selected={{
                from: new Date(obra.dataInicio),
                to: obra.tempoObra
                  ? new Date(new Date(obra.dataInicio).setDate(new Date(obra.dataInicio).getDate() + (obra.tempoObra - 1)))
                  : new Date(obra.dataInicio),
              }}
              showOutsideDays
              disabled
              locale={ptBR}
            />
          ) : (
            <div className="text-gray-500">Data de início não definida.</div>
          )}
        </CardContent>
      </Card>

      {/* Materiais */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Materiais Utilizados</h2>
          <ul className="mb-4">
            {obra.materiais?.length ? (
              obra.materiais.map((mat: any, idx: number) => (
                <li key={idx} className="mb-1">
                  <span className="font-semibold">{mat.nome}</span> - 
                  {mat.quantidade} x {formatarBRL(mat.valorUnit)} = <span className="font-semibold">{formatarBRL(mat.valorTotal)}</span>
                  {mat.marca && <span className="ml-2 text-gray-500">({mat.marca})</span>}
                </li>
              ))
            ) : (
              <li className="text-gray-500">Nenhum material cadastrado.</li>
            )}
          </ul>
          {status !== "CONCLUIDO" && (
            !mostrarFormMaterial ? (
              <Button variant="outline" onClick={() => setMostrarFormMaterial(true)}>
                Adicionar material extra
              </Button>
            ) : (
              <form
                onSubmit={async e => {
                  e.preventDefault()
                  await handleAddMaterial()
                  setMostrarFormMaterial(false)
                }}
                className="flex gap-2 items-end flex-wrap mt-2"
              >
                <div className="flex flex-col">
                  <Label>Nome do material</Label>
                  <Input
                    placeholder="Nome do material"
                    value={novoMaterial.nome}
                    onChange={e => setNovoMaterial({ ...novoMaterial, nome: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <Label>Marca</Label>
                  <Input
                    placeholder="Marca"
                    value={novoMaterial.marca}
                    onChange={e => setNovoMaterial({ ...novoMaterial, marca: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Quantidade (ex: 10)"
                    value={novoMaterial.quantidade}
                    onChange={e => setNovoMaterial({ ...novoMaterial, quantidade: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <Label>Valor unitário</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Valor unitário (ex: 25.50)"
                    value={novoMaterial.valor}
                    onChange={e => setNovoMaterial({ ...novoMaterial, valor: Number(e.target.value) })}
                    required
                  />
                </div>
                <Button type="submit">Adicionar</Button>
                <Button type="button" variant="ghost" onClick={() => setMostrarFormMaterial(false)}>
                  Cancelar
                </Button>
              </form>
            )
          )}
        </CardContent>
      </Card>

      {/* Alteração de status */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-2">Status da Obra</h2>
          <Select value={status} onValueChange={handleStatusChange} disabled={status === "CONCLUIDO"}>
            <SelectTrigger className="w-64" disabled={status === "CONCLUIDO"}>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NAO_INICIADO">Não iniciado</SelectItem>
              <SelectItem value="EM_PREPARACAO">Em preparação</SelectItem>
              <SelectItem value="CONCLUIDO">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
} 