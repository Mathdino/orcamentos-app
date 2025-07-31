"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { buscarOrcamentoPorId, atualizarOrcamento } from "@/app/actions/orcamento-actions"
import type { OrcamentoCompleto, Material, Cliente } from "@/types/orcamento"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { gerarPDF } from "@/lib/pdf-generator"
import { formatarBRL } from "../../../lib/utils"

export default function DetalhesOrcamento() {
  const router = useRouter()
  const params = useParams()
  const orcamentoId = params?.id as string
  const [orcamento, setOrcamento] = useState<OrcamentoCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<OrcamentoCompleto | null>(null)

  useEffect(() => {
    if (orcamentoId) {
      carregarOrcamento()
    }
    // eslint-disable-next-line
  }, [orcamentoId])

  const carregarOrcamento = async () => {
    setLoading(true)
    try {
      const resultado = await buscarOrcamentoPorId(orcamentoId)
      if (resultado.success && resultado.orcamento) {
        const c: Cliente = {
          id: resultado.orcamento.cliente?.id ?? '',
          nome: resultado.orcamento.cliente?.nome ?? '',
          telefone: resultado.orcamento.cliente?.telefone ?? '',
          tipo: resultado.orcamento.cliente?.tipo === 'juridica' ? 'juridica' : 'fisica',
          cpf: resultado.orcamento.cliente?.cpf ?? '',
          cnpj: resultado.orcamento.cliente?.cnpj ?? '',
          email: resultado.orcamento.cliente?.email ?? undefined,
          endereco: resultado.orcamento.cliente?.endereco ?? '',
          cep: resultado.orcamento.cliente?.cep ?? '',
          numero: resultado.orcamento.cliente?.numero ?? '',
          complemento: resultado.orcamento.cliente?.complemento ?? '',
          bairro: resultado.orcamento.cliente?.bairro ?? '',
        };
        const orcamentoCorrigido: OrcamentoCompleto = {
          id: resultado.orcamento.id,
          cliente: {
            id: resultado.orcamento.cliente?.id ?? '',
            nome: resultado.orcamento.cliente?.nome ?? '',
            telefone: resultado.orcamento.cliente?.telefone ?? '',
            tipo: resultado.orcamento.cliente?.tipo === 'juridica' ? 'juridica' : 'fisica',
            cpf: resultado.orcamento.cliente?.cpf ?? '',
            cnpj: resultado.orcamento.cliente?.cnpj ?? '',
            email: resultado.orcamento.cliente?.email ?? undefined,
            endereco: resultado.orcamento.cliente?.endereco ?? '',
            cep: resultado.orcamento.cliente?.cep ?? '',
            numero: resultado.orcamento.cliente?.numero ?? '',
            complemento: resultado.orcamento.cliente?.complemento ?? '',
            bairro: resultado.orcamento.cliente?.bairro ?? '',
          },
          localObra: resultado.orcamento.localObra ?? '',
          detalhesEspaco: resultado.orcamento.detalhesEspaco ?? '',
          metragem: resultado.orcamento.metragem ?? 0,
          tempoObra: resultado.orcamento.tempoObra ?? 0,
          tipoServico: resultado.orcamento.tipoServico ?? '',
          especificacoes: resultado.orcamento.especificacoes ?? '',
          materiais: resultado.orcamento.materiais ?? [],
          valorMaoObra: resultado.orcamento.valorMaoObra ?? 0,
          observacoes: resultado.orcamento.observacoes ?? '',
          valorDiariaPrincipal: resultado.orcamento.valorDiariaPrincipal ?? 0,
          diasPrincipal: resultado.orcamento.diasPrincipal ?? 0,
          ajudantes: Array.isArray(resultado.orcamento.ajudantes) ? resultado.orcamento.ajudantes : [],
          tipoMetragem: resultado.orcamento.tipoMetragem === 'empreita' ? 'empreita' : 'metro',
          valorEmpreita: resultado.orcamento.valorEmpreita ?? 0,
          lucro: resultado.orcamento.lucro ?? 0,
          valorTotal: resultado.orcamento.valorTotal ?? 0,
          status: resultado.orcamento.status ?? 'PENDENTE',
          createdAt: resultado.orcamento.createdAt ?? new Date(),
          dataInicioObra: resultado.orcamento.dataInicioObra ?? '',
          dataTerminoObra: resultado.orcamento.dataTerminoObra ?? '',
        };
        setOrcamento(orcamentoCorrigido)
        setForm(orcamentoCorrigido)
      }
    } catch (error) {
      alert("Erro ao carregar orçamento")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (campo: string, valor: any) => {
    if (form) {
      setForm({ ...form, [campo]: valor })
    }
  }

  const handleSalvar = async () => {
    setLoading(true)
    try {
      const resultado = await atualizarOrcamento(orcamentoId, form)
      if (resultado.success) {
        alert("Orçamento atualizado com sucesso!")
        setEditando(false)
        carregarOrcamento()
      } else {
        alert("Erro ao atualizar orçamento: " + resultado.error)
      }
    } catch (error) {
      alert("Erro ao atualizar orçamento")
    } finally {
      setLoading(false)
    }
  }

  const handleGerarPDF = async () => {
    if (!form) return
    await gerarPDF(form, form.valorTotal)
  }

  const isConcluido = form?.status === "CONCLUIDO"

  if (loading || !form) {
    return <div className="p-8 text-center">Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados do Cliente */}
            <div>
              <h2 className="font-bold text-lg mb-2">Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><b>Tipo:</b> {form.cliente.tipo === "fisica" ? "Pessoa Física" : "Pessoa Jurídica"}</div>
                <div><b>Nome:</b> {form.cliente.nome}</div>
                <div><b>Telefone:</b> {form.cliente.telefone}</div>
                <div><b>Endereço:</b> {form.cliente.endereco}</div>
                <div><b>CEP:</b> {form.cliente.cep}</div>
                <div><b>Número:</b> {form.cliente.numero}</div>
                <div><b>Complemento:</b> {form.cliente.complemento || '-'}</div>
                <div><b>Bairro:</b> {form.cliente.bairro || '-'}</div>
                {form.cliente.tipo === "fisica" && <div><b>CPF:</b> {form.cliente.cpf || '-'}</div>}
                {form.cliente.tipo === "juridica" && <div><b>CNPJ:</b> {form.cliente.cnpj || '-'}</div>}
              </div>
            </div>

            {/* Dados da Obra */}
            <div>
              <h2 className="font-bold text-lg mb-2">Obra</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><b>Local:</b> {form.localObra}</div>
                <div><b>Detalhes do Espaço:</b> {form.detalhesEspaco}</div>
                <div><b>Metragem:</b> {form.metragem} m²</div>
                <div><b>Tempo de Obra:</b> {form.tempoObra} dias</div>
                <div><b>Tipo de Serviço:</b> {form.tipoServico}</div>
                <div><b>Tipo de Metragem:</b> {form.tipoMetragem === "metro" ? "Por Metro Quadrado" : "Empreita (Valor Fechado)"}</div>
                {form.tipoMetragem === "empreita" && (
                  <div><b>Valor da Empreita:</b> {form.valorEmpreita !== undefined ? formatarBRL(form.valorEmpreita) : '-'}</div>
                )}
                <div><b>Valor Diária Principal:</b> {form.valorDiariaPrincipal !== undefined ? formatarBRL(form.valorDiariaPrincipal) : '-'}</div>
                <div><b>Dias Principal:</b> {form.diasPrincipal || '-'}</div>
                <div><b>Especificações:</b> {form.especificacoes || '-'}</div>
                <div><b>Status:</b> {!editando ? (
                  getStatusLabel(form.status)
                ) : (
                  <Select value={form.status} onValueChange={value => handleChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APROVADO">Aprovado</SelectItem>
                      <SelectItem value="PENDENTE">Aguardando Resposta</SelectItem>
                      <SelectItem value="REJEITADO">Recusado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                </div>
                <div><b>Data de Início:</b> {form.dataInicioObra ? new Date(new Date(form.dataInicioObra).getTime() + 3 * 60 * 60 * 1000).toLocaleDateString('pt-BR') : '-'}</div>
                <div><b>Data de Conclusão:</b> {form.dataTerminoObra ? new Date(new Date(form.dataTerminoObra).getTime() + 3 * 60 * 60 * 1000).toLocaleDateString('pt-BR') : '-'}</div>
                <div><b>Criado em:</b> {form.createdAt ? new Date(new Date(form.createdAt).getTime() + 3 * 60 * 60 * 1000).toLocaleDateString('pt-BR') : '-'}</div>
              </div>
            </div>

            {/* Ajudantes */}
            <div>
              <h2 className="font-bold text-lg mb-2">Ajudantes</h2>
              {form.ajudantes && form.ajudantes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 border">Nome</th>
                        <th className="px-2 py-1 border">Valor Diária</th>
                        <th className="px-2 py-1 border">Dias</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.ajudantes.map((aj: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-2 py-1 border">{aj.nome}</td>
                          <td className="px-2 py-1 border">{formatarBRL(aj.valorDiaria)}</td>
                          <td className="px-2 py-1 border">{aj.dias}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500">Nenhum ajudante cadastrado.</div>
              )}
            </div>

            {/* Materiais */}
            <div>
              <h2 className="font-bold text-lg mb-2">Materiais</h2>
              {form.materiais && form.materiais.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-2 py-1 border">Nome</th>
                        <th className="px-2 py-1 border">Marca</th>
                        <th className="px-2 py-1 border">Qtd</th>
                        <th className="px-2 py-1 border">Unidade</th>
                        <th className="px-2 py-1 border">Valor Unit.</th>
                        <th className="px-2 py-1 border">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.materiais.map((mat: Material, idx: number) => (
                        <tr key={mat.id || idx}>
                          <td className="px-2 py-1 border">{mat.nome}</td>
                          <td className="px-2 py-1 border">{mat.marca}</td>
                          <td className="px-2 py-1 border">{mat.quantidade}</td>
                          <td className="px-2 py-1 border">{mat.unidade}</td>
                          <td className="px-2 py-1 border">{formatarBRL(mat.valorUnit)}</td>
                          <td className="px-2 py-1 border">{formatarBRL(mat.valorTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-500">Nenhum material cadastrado.</div>
              )}
            </div>

            {/* Valores */}
            <div>
              <h2 className="font-bold text-lg mb-2">Valores</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div><b>Valor dos Materiais:</b> {formatarBRL(form.materiais?.reduce((t: number, m: Material) => t + m.valorTotal, 0))}</div>
                <div><b>Mão de Obra do Pintor Principal:</b> {formatarBRL(((form.valorDiariaPrincipal || 0) * (form.diasPrincipal || 1)))}</div>
                <div><b>Mão de Obra dos Ajudantes:</b> {formatarBRL((form.ajudantes && form.ajudantes.length > 0) ? form.ajudantes.reduce((total: number, aj: any) => total + ((aj.valorDiaria || 0) * (aj.dias || 0)), 0) : 0)}</div>
                <div><b>Valor Total:</b> <span className="font-bold text-green-700">{formatarBRL(form.valorTotal)}</span></div>
                <div><b>Lucro Estimado:</b> {formatarBRL(form.valorTotal - (form.materiais?.reduce((t: number, m: Material) => t + m.valorTotal, 0) || 0) - ((form.ajudantes && form.ajudantes.length > 0) ? form.ajudantes.reduce((total: number, aj: any) => total + ((aj.valorDiaria || 0) * (aj.dias || 0)), 0) : 0))}</div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <h2 className="font-bold text-lg mb-2">Observações</h2>
              <div className="bg-gray-50 border rounded p-2 min-h-[40px]">{form.observacoes || <span className="text-gray-400">Nenhuma observação.</span>}</div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 mt-4">
              {!editando ? (
                <Button onClick={() => setEditando(true)} disabled={isConcluido}>Editar</Button>
              ) : (
                <>
                  <Button onClick={handleSalvar} disabled={loading || isConcluido}>Salvar</Button>
                  <Button variant="outline" onClick={() => { setEditando(false); setForm(orcamento); }}>Cancelar</Button>
                </>
              )}
              <Button variant="secondary" onClick={() => router.back()}>Voltar</Button>
              <Button variant="outline" onClick={handleGerarPDF}>Gerar PDF</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getStatusLabel(status: string) {
  switch (status) {
    case "APROVADO": return "Aprovado"
    case "PENDENTE": return "Aguardando Resposta"
    case "REJEITADO": return "Recusado"
    case "EM_ANDAMENTO": return "Em Andamento"
    case "CONCLUIDO": return "Concluído"
    default: return status
  }
}
