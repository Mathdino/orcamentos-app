"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, CheckCircle, Clock, XCircle, Hammer, ChevronDown, ChevronUp, Trash2, Plus } from "lucide-react"
import { buscarOrcamentos, buscarOrcamentoPorId, atualizarOrcamento } from "@/app/actions/orcamento-actions"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ptBR } from "date-fns/locale"
import { DayPicker } from "react-day-picker"
import { formatarBRL } from "../../lib/utils"

interface ObraListItem {
  id: string
  cliente: {
    nome: string
    telefone: string
    bairro?: string
  }
  localObra: string
  valorTotal: number
  status: string
  tipoServico: string
  dataInicio: string
  dataConclusao?: string // novo campo
  createdAt: string
}

const statusLabels: Record<string, { label: string; color: string; icon: any }> = {
  EM_PREPARACAO: { label: "Em preparação", color: "bg-yellow-500", icon: Hammer },
  CONCLUIDO: { label: "Finalizada", color: "bg-green-600", icon: CheckCircle },
  PENDENTE: { label: "Não iniciado", color: "bg-gray-400", icon: Clock },
}

const statusOptions = [
  { value: "EM_ANDAMENTO", label: "Em Processo" },
  { value: "CONCLUIDO", label: "Finalizada" },
]

export default function ObrasPage() {
  const [obras, setObras] = useState<ObraListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("")

  useEffect(() => {
    carregarObras()
  }, [])

  const carregarObras = async () => {
    try {
      const resultado = await buscarOrcamentos()
      if (resultado.success && resultado.orcamentos) {
        // Mostrar todas as obras, independente do status
        const obrasFiltradas = resultado.orcamentos
          .map((o: any) => ({
            id: o.id,
            cliente: {
              nome: o.cliente?.nome || "",
              telefone: o.cliente?.telefone || "",
              bairro: o.cliente?.bairro || "",
            },
            localObra: o.localObra,
            valorTotal: o.valorTotal,
            status: o.status,
            tipoServico: o.tipoServico,
            dataInicio: o.dataInicio,
            dataConclusao: o.dataConclusao, // novo campo
            createdAt: typeof o.createdAt === "string" ? o.createdAt : new Date(o.createdAt).toISOString(),
          }))
        setObras(obrasFiltradas)
      }
    } catch (error) {
      console.error("Erro ao carregar obras:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filtros e busca
  const obrasFiltradas = obras.filter((obra) => {
    const buscaLower = busca.toLowerCase()
    const matchBusca =
      obra.cliente.nome.toLowerCase().includes(buscaLower) ||
      obra.localObra.toLowerCase().includes(buscaLower) ||
      (obra.tipoServico?.toLowerCase() || "").includes(buscaLower) ||
      (obra.cliente.bairro?.toLowerCase() || "").includes(buscaLower)
    const matchStatus = statusFiltro === "ALL" || statusFiltro === "" ? true : obra.status === statusFiltro
    return matchBusca && matchStatus
  })

  const getStatusBadge = (status: string) => {
    const config = statusLabels[status] || { label: status, color: "bg-gray-400", icon: Clock }
    const Icon = config.icon
    return (
      <Badge className={`flex items-center gap-1 ${config.color} text-white`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando obras...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-30">
      <div className="h-8" />
      <h1 className="text-2xl font-bold mb-6 text-black">Obras</h1>
      {/* Busca e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
        <Input
          placeholder="Buscar por cliente, local ou serviço..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="max-w-xs text-black"
        />
        <Select value={statusFiltro} onValueChange={setStatusFiltro}>
          <SelectTrigger className="w-[180px] text-black">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos os status</SelectItem>
            <SelectItem value="NAO_INICIADO">Não iniciado</SelectItem>
            <SelectItem value="EM_PREPARACAO">Em preparação</SelectItem>
            <SelectItem value="CONCLUIDO">Finalizada</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4">
        {obrasFiltradas.length === 0 && (
          <div className="text-center text-gray-500">Nenhuma obra encontrada.</div>
        )}
        {obrasFiltradas.map((obra) => {
          const isConcluida = obra.status === "CONCLUIDO"
          return (
            <Card key={obra.id} className="hover:shadow-2xl shadow-xl transition-shadow">
              <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col items-center min-w-[120px]">
                  <span className="text-xs text-gray-500 mb-1">Início</span>
                  <span className="text-lg font-bold">{obra.dataInicio ? new Date(obra.dataInicio).toLocaleDateString("pt-BR") : "-"}</span>
                  {obra.dataConclusao && (
                    <>
                      <span className="text-xs text-gray-500 mt-2">Conclusão</span>
                      <span className="text-lg font-bold text-green-700">{new Date(obra.dataConclusao).toLocaleDateString("pt-BR")}</span>
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{obra.cliente.nome}</h3>
                    {getStatusBadge(obra.status)}
                  </div>
                  <p className="text-gray-600 mb-1">{obra.cliente.telefone}</p>
                  {obra.cliente.bairro && (
                    <p className="text-gray-600 mb-1">Bairro: {obra.cliente.bairro}</p>
                  )}
                  <p className="text-gray-600 mb-2">{obra.localObra}</p>
                  <p className="text-gray-600 mb-2">Tipo de serviço: {obra.tipoServico}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">{formatarBRL(obra.valorTotal)}</span>
                    <Link href={`/obras/${obra.id}`} passHref legacyBehavior>
                      <Button asChild variant="outline" size="sm">
                        <span>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </span>
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 min-w-[180px]">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isConcluida || obra.status === "EM_PREPARACAO"}
                    onClick={async () => {
                      if (isConcluida || obra.status === "EM_PREPARACAO") return
                      setLoading(true)
                      const now = new Date().toISOString()
                      const resultado = await atualizarOrcamento(obra.id, {
                        status: "EM_PREPARACAO",
                        cliente: obra.cliente,
                        dataInicio: now,
                      })
                      if (resultado.success) {
                        setObras((prev) =>
                          prev.map((o) =>
                            o.id === obra.id ? { ...o, status: "EM_PREPARACAO", dataInicio: now } : o
                          )
                        )
                      }
                      setLoading(false)
                    }}
                  >
                    Em preparação
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    disabled={isConcluida || obra.status === "NAO_INICIADO"}
                    onClick={async () => {
                      if (isConcluida || obra.status === "NAO_INICIADO") return
                      setLoading(true)
                      const now = new Date().toISOString()
                      const resultado = await atualizarOrcamento(obra.id, {
                        status: "CONCLUIDO",
                        cliente: obra.cliente,
                        dataConclusao: now,
                      })
                      if (resultado.success) {
                        setObras((prev) =>
                          prev.map((o) =>
                            o.id === obra.id ? { ...o, status: "CONCLUIDO", dataConclusao: now } : o
                          )
                        )
                      }
                      setLoading(false)
                    }}
                  >
                    Finalizar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
} 