"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, FileText, Save } from "lucide-react"
import type { DadosOrcamento, Material, Cliente, Ajudante } from "@/types/orcamento"
import { salvarOrcamento } from "@/app/actions/orcamento-actions"
import { gerarPDF } from "@/lib/pdf-generator"
import { formatarBRL } from "../../lib/utils"

export default function NovoOrcamento() {
  const [cliente, setCliente] = useState<Cliente & { tipo: "fisica" | "juridica", cpf?: string, cnpj?: string }>({
    tipo: "fisica",
    nome: "",
    telefone: "",
    cpf: "",
    cnpj: "",
    endereco: "",
    cep: "",
    numero: "",
    complemento: "",
    bairro: "",
  })

  const [dadosObra, setDadosObra] = useState({
    localObra: "",
    detalhesEspaco: "",
    metragem: 0,
    tempoObra: 1,
    tipoServico: "",
    especificacoes: "",
    valorMaoObra: 0,
    observacoes: "",
    valorDiariaPrincipal: 0,
    diasPrincipal: 1,
    ajudantes: [] as Ajudante[],
    tipoMetragem: "metro" as "metro" | "empreita",
    valorEmpreita: 0,
    lucro: 0,
    dataInicio: "", // nova propriedade
    dataTermino: "", // nova propriedade
  })

  const [materiais, setMateriais] = useState<Material[]>([
    {
      nome: "",
      marca: "",
      quantidade: 0,
      unidade: "litros",
      valorUnit: 0,
      valorTotal: 0,
    },
  ])

  const [loading, setLoading] = useState(false)
  const [carregandoCep, setCarregandoCep] = useState(false)
  const [erroCep, setErroCep] = useState("")

  const prevEnderecoCliente = useRef("")

  useEffect(() => {
    if (
      cliente.endereco &&
      cliente.cep &&
      cliente.numero
    ) {
      const enderecoCompleto = `${cliente.endereco}, ${cliente.numero}${cliente.complemento ? ' - ' + cliente.complemento : ''}, CEP: ${cliente.cep}`
      if (!dadosObra.localObra || dadosObra.localObra === prevEnderecoCliente.current) {
        setDadosObra((prev) => ({ ...prev, localObra: enderecoCompleto }))
        prevEnderecoCliente.current = enderecoCompleto
      }
    }
  }, [cliente.endereco, cliente.cep, cliente.numero, cliente.complemento])

  // Calcular data de término da obra
  useEffect(() => {
    if (dadosObra.dataInicio && dadosObra.tempoObra > 0) {
      const inicio = new Date(dadosObra.dataInicio)
      const termino = new Date(inicio)
      termino.setDate(inicio.getDate() + (dadosObra.tempoObra - 1))
      setDadosObra((prev) => ({ ...prev, dataTermino: termino.toISOString().split('T')[0] }))
    } else {
      setDadosObra((prev) => ({ ...prev, dataTermino: "" }))
    }
  }, [dadosObra.dataInicio, dadosObra.tempoObra])

  const adicionarMaterial = () => {
    setMateriais([
      {
        nome: "",
        marca: "",
        quantidade: 0,
        unidade: "litros",
        valorUnit: 0,
        valorTotal: 0,
      },
      ...materiais,
    ])
  }

  const removerMaterial = (index: number) => {
    setMateriais(materiais.filter((_, i) => i !== index))
  }

  const atualizarMaterial = (index: number, campo: keyof Material, valor: any) => {
    const novosMateriais = [...materiais]
    novosMateriais[index] = { ...novosMateriais[index], [campo]: valor }

    // Calcular valor total do material
    if (campo === "quantidade" || campo === "valorUnit") {
      novosMateriais[index].valorTotal = novosMateriais[index].quantidade * novosMateriais[index].valorUnit
    }

    setMateriais(novosMateriais)
  }

  const adicionarAjudante = () => {
    setDadosObra((prev) => ({
      ...prev,
      ajudantes: [
        ...prev.ajudantes,
        { nome: "", valorDiaria: 0, dias: 1 },
      ],
    }))
  }

  const removerAjudante = (index: number) => {
    setDadosObra((prev) => ({
      ...prev,
      ajudantes: prev.ajudantes.filter((_, i) => i !== index),
    }))
  }

  const atualizarAjudante = (index: number, campo: keyof Ajudante, valor: any) => {
    setDadosObra((prev) => {
      const novosAjudantes = [...prev.ajudantes]
      novosAjudantes[index] = { ...novosAjudantes[index], [campo]: valor }
      return { ...prev, ajudantes: novosAjudantes }
    })
  }

  const calcularValorMaoObra = () => {
    if (dadosObra.tipoMetragem === "empreita") {
      return dadosObra.valorEmpreita || 0
    }
    const valorPrincipal = (dadosObra.valorDiariaPrincipal || 0) * (dadosObra.diasPrincipal || 1)
    const valorAjudantes = (dadosObra.ajudantes || []).reduce(
      (total, aj) => total + (aj.valorDiaria || 0) * (aj.dias || 1),
      0
    )
    return valorPrincipal + valorAjudantes
  }

  const calcularValorTotal = () => {
    const valorMateriais = materiais.reduce((total, material) => {
      return total + material.valorTotal
    }, 0)
    const maoObra = calcularValorMaoObra()
    const lucro = dadosObra.lucro || 0
    return valorMateriais + maoObra + lucro
  }

  const handleSalvarOrcamento = async () => {
    setLoading(true)
    // Validação dos campos obrigatórios do cliente
    const camposObrigatorios = [
      cliente.nome,
      cliente.telefone,
      cliente.endereco,
      cliente.cep,
      cliente.numero,
      cliente.tipo,
    ]
    if (camposObrigatorios.some(campo => !campo || campo.trim() === "")) {
      alert("Preencha todos os campos obrigatórios do cliente!")
      setLoading(false)
      return
    }
    try {
      const valorMaoObra = calcularValorMaoObra()
      // Ajuste: enviar apenas o campo correto (cpf ou cnpj)
      const clienteParaSalvar = { ...cliente }
      if (cliente.tipo === "fisica") {
        clienteParaSalvar.cnpj = undefined
      } else {
        clienteParaSalvar.cpf = undefined
      }
      const dadosCompletos: DadosOrcamento = {
        cliente: clienteParaSalvar,
        ...dadosObra,
        materiais: materiais.filter((m) => m.nome && m.quantidade > 0),
        valorMaoObra,
        dataInicioObra: dadosObra.dataInicio,
        dataTerminoObra: dadosObra.dataTermino,
      }

      const resultado = await salvarOrcamento(dadosCompletos)

      if (resultado.success) {
        alert("Orçamento salvo com sucesso!")
        // Reset form
        setCliente({ tipo: "fisica", nome: "", telefone: "", cpf: "", cnpj: "", endereco: "", cep: "", numero: "", complemento: "", bairro: "" })
        setDadosObra({
          localObra: "",
          detalhesEspaco: "",
          metragem: 0,
          tempoObra: 1,
          tipoServico: "",
          especificacoes: "",
          valorMaoObra: 0,
          observacoes: "",
          valorDiariaPrincipal: 0,
          diasPrincipal: 1,
          ajudantes: [],
          tipoMetragem: "metro",
          valorEmpreita: 0,
          lucro: 0,
          dataInicio: "",
          dataTermino: "",
        })
        setMateriais([
          {
            nome: "",
            marca: "",
            quantidade: 0,
            unidade: "litros",
            valorUnit: 0,
            valorTotal: 0,
          },
        ])
      } else {
        alert("Erro ao salvar orçamento: " + resultado.error)
      }
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error)
      alert("Erro ao salvar orçamento")
    } finally {
      setLoading(false)
    }
  }

  const handleGerarPDF = async () => {
    const valorMaoObra = calcularValorMaoObra()
    const dadosCompletos: DadosOrcamento = {
      cliente,
      ...dadosObra,
      materiais: materiais.filter((m) => m.nome && m.quantidade > 0),
      valorMaoObra,
    }
    // Não remover lucro, pois queremos que apareça no PDF
    await gerarPDF(dadosCompletos, calcularValorTotal())
  }

  const buscarEnderecoPorCep = async (cep: string) => {
    setCarregandoCep(true)
    setErroCep("")
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`)
      const data = await response.json()
      if (data.erro) {
        setErroCep("CEP não encontrado")
        return
      }
      setCliente((prev) => ({
        ...prev,
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        // complemento: data.complemento || prev.complemento,
        // cidade: data.localidade || prev.cidade,
        // uf: data.uf || prev.uf,
      }))
    } catch (e) {
      setErroCep("Erro ao buscar CEP")
    } finally {
      setCarregandoCep(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 mt-30">
        <div className="h-8" />
        <h1 className="text-2xl font-bold mb-6 text-black">Novo Orçamento</h1>
        <p className="text-black">Preencha os dados para gerar o orçamento</p>

        {/* Dados do Cliente */}
        <Card className="border-2 border-gray-400 mt-4">
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipoCliente">Tipo de Cliente *</Label>
                <Select
                  value={cliente.tipo}
                  onValueChange={(value) => setCliente({ ...cliente, tipo: value as "fisica" | "juridica" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fisica">Pessoa Física</SelectItem>
                    <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div />
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={cliente.nome}
                  onChange={(e) => setCliente({ ...cliente, nome: e.target.value })}
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone *</Label>
                <Input
                  id="telefone"
                  value={cliente.telefone}
                  onChange={(e) => setCliente({ ...cliente, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              {cliente.tipo === "fisica" ? (
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={cliente.cpf}
                    onChange={(e) => setCliente({ ...cliente, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={cliente.cnpj}
                    onChange={(e) => setCliente({ ...cliente, cnpj: e.target.value })}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  value={cliente.cep}
                  onChange={(e) => setCliente({ ...cliente, cep: e.target.value })}
                  onBlur={(e) => {
                    const cep = e.target.value
                    if (cep && cep.replace(/\D/g, "").length === 8) {
                      buscarEnderecoPorCep(cep)
                    }
                  }}
                  placeholder="00000-000"
                />
                {carregandoCep && <span className="text-xs text-blue-500">Buscando endereço...</span>}
                {erroCep && <span className="text-xs text-red-500">{erroCep}</span>}
              </div>
              <div>
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  value={cliente.endereco}
                  onChange={(e) => setCliente({ ...cliente, endereco: e.target.value })}
                  placeholder="Rua, Avenida, etc."
                />
              </div>
              <div>
                <Label htmlFor="numero">Número *</Label>
                <Input
                  id="numero"
                  value={cliente.numero}
                  onChange={(e) => setCliente({ ...cliente, numero: e.target.value })}
                  placeholder="Número"
                />
              </div>
              <div>
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={cliente.complemento}
                  onChange={(e) => setCliente({ ...cliente, complemento: e.target.value })}
                  placeholder="Apto, bloco, etc. (opcional)"
                />
              </div>
              <div>
                <Label htmlFor="bairro">Bairro *</Label>
                <Input
                  id="bairro"
                  value={cliente.bairro}
                  onChange={(e) => setCliente({ ...cliente, bairro: e.target.value })}
                  placeholder="Bairro"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Obra */}
        <Card className="border-2 border-gray-400">
          <CardHeader>
            <CardTitle>Dados da Obra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipoMetragem">Tipo de Metragem *</Label>
                <Select
                  value={dadosObra.tipoMetragem}
                  onValueChange={(value) => setDadosObra({ ...dadosObra, tipoMetragem: value as "metro" | "empreita" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metro">Por Metro Quadrado</SelectItem>
                    <SelectItem value="empreita">Empreita (Valor Fechado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {dadosObra.tipoMetragem === "metro" && (
              <div className="mt-2">
                <Label htmlFor="metragem">Metragem *</Label>
                <Input
                  id="metragem"
                  type="number"
                  value={dadosObra.metragem}
                  onChange={(e) => setDadosObra({ ...dadosObra, metragem: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            )}
            {dadosObra.tipoMetragem === "empreita" && (
              <div className="mt-2">
                <Label htmlFor="valorEmpreita">Valor da Empreita (R$) *</Label>
                <Input
                  id="valorEmpreita"
                  type="number"
                  step="0.01"
                  value={dadosObra.valorEmpreita}
                  onChange={(e) => setDadosObra({ ...dadosObra, valorEmpreita: Number.parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="localObra">Local da Obra *</Label>
                <Input
                  id="localObra"
                  value={dadosObra.localObra}
                  onChange={(e) => setDadosObra({ ...dadosObra, localObra: e.target.value })}
                  placeholder="Endereço da obra"
                />
              </div>
              <div>
                <Label htmlFor="tempoObra">Tempo da Obra (dias) *</Label>
                <Input
                  id="tempoObra"
                  type="number"
                  value={dadosObra.tempoObra}
                  onChange={(e) => setDadosObra({ ...dadosObra, tempoObra: Number.parseInt(e.target.value) || 1 })}
                  placeholder="1"
                />
              </div>
            </div>
            {/* Data de início e término da obra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <Label htmlFor="dataInicio">Data de Início da Obra *</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dadosObra.dataInicio}
                  onChange={(e) => setDadosObra({ ...dadosObra, dataInicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dataTermino">Data de Término (estimada)</Label>
                <Input
                  id="dataTermino"
                  type="date"
                  value={dadosObra.dataTermino}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tipoServico">Tipo de Serviço *</Label>
              <Select
                value={dadosObra.tipoServico}
                onValueChange={(value) => setDadosObra({ ...dadosObra, tipoServico: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pintura_residencial_predial">Pintura residencial e predial</SelectItem>
                  <SelectItem value="massa_corrida_acrilica">Aplicação de massa corrida e acrílica</SelectItem>
                  <SelectItem value="aplicacao_texturas">Aplicação de texturas</SelectItem>
                  <SelectItem value="efeitos_decorativos">Efeitos decorativos</SelectItem>
                  <SelectItem value="cimento_queimado">Cimento queimado</SelectItem>
                  <SelectItem value="aco_corten">Aço corten</SelectItem>
                  <SelectItem value="pedras_naturais">Pedras naturais</SelectItem>
                  <SelectItem value="efeito_tijolinho">Efeito tijolinho</SelectItem>
                  <SelectItem value="efeito_marmore">Efeito mármore</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="detalhesEspaco">Detalhes do Espaço *</Label>
              <Textarea
                id="detalhesEspaco"
                value={dadosObra.detalhesEspaco}
                onChange={(e) => setDadosObra({ ...dadosObra, detalhesEspaco: e.target.value })}
                placeholder="Descreva os cômodos, paredes, teto, etc."
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="especificacoes">Especificações Adicionais</Label>
              <Textarea
                id="especificacoes"
                value={dadosObra.especificacoes}
                onChange={(e) => setDadosObra({ ...dadosObra, especificacoes: e.target.value })}
                placeholder="Preparação de superfície, número de demãos, etc."
                rows={2}
              />
            </div>

            {/* Mão de obra por diária */}
            {dadosObra.tipoMetragem === "metro" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="valorDiariaPrincipal">Valor da Diária do Pintor Principal (R$) *</Label>
                    <Input
                      id="valorDiariaPrincipal"
                      type="number"
                      step="0.01"
                      value={dadosObra.valorDiariaPrincipal}
                      onChange={(e) => setDadosObra({ ...dadosObra, valorDiariaPrincipal: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="diasPrincipal">Dias do Pintor Principal *</Label>
                    <Input
                      id="diasPrincipal"
                      type="number"
                      value={dadosObra.diasPrincipal}
                      onChange={(e) => setDadosObra({ ...dadosObra, diasPrincipal: Number.parseInt(e.target.value) || 1 })}
                      placeholder="1"
                    />
                  </div>
                </div>
                {/* Ajudantes */}
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <Label>Ajudantes / Pintores Parceiros</Label>
                    <Button type="button" size="sm" onClick={adicionarAjudante}>
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Ajudante
                    </Button>
                  </div>
                  {dadosObra.ajudantes.length > 0 && dadosObra.ajudantes.map((aj, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2 items-end">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={aj.nome}
                          onChange={(e) => atualizarAjudante(idx, "nome", e.target.value)}
                          placeholder="Nome do ajudante"
                        />
                      </div>
                      <div>
                        <Label>Valor Diária (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={aj.valorDiaria}
                          onChange={(e) => atualizarAjudante(idx, "valorDiaria", Number.parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Dias</Label>
                        <Input
                          type="number"
                          value={aj.dias}
                          onChange={(e) => atualizarAjudante(idx, "dias", Number.parseInt(e.target.value) || 1)}
                          placeholder="1"
                        />
                      </div>
                      <div>
                        <Button type="button" variant="destructive" size="sm" onClick={() => removerAjudante(idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Campo de lucro (não vai para o PDF) */}
            <div>
              <Label htmlFor="lucro">Lucro desejado (R$) <span className="text-xs text-gray-500">(não aparece no PDF)</span></Label>
              <Input
                id="lucro"
                type="number"
                step="0.01"
                value={dadosObra.lucro}
                onChange={(e) => setDadosObra({ ...dadosObra, lucro: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Materiais */}
        <Card className="border-2 border-gray-400">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Materiais
              <Button onClick={adicionarMaterial} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {materiais.map((material, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Material {materiais.length - index}</h4>
                  {materiais.length > 1 && (
                    <Button onClick={() => removerMaterial(index)} variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Nome do Material</Label>
                    <Input
                      value={material.nome}
                      onChange={(e) => atualizarMaterial(index, "nome", e.target.value)}
                      placeholder="Ex: Tinta Látex"
                    />
                  </div>
                  <div>
                    <Label>Marca</Label>
                    <Input
                      value={material.marca}
                      onChange={(e) => atualizarMaterial(index, "marca", e.target.value)}
                      placeholder="Ex: Suvinil"
                    />
                  </div>
                  <div>
                    <Label>Unidade</Label>
                    <Select
                      value={material.unidade}
                      onValueChange={(value) => atualizarMaterial(index, "unidade", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="litros">Litros</SelectItem>
                        <SelectItem value="metros">Metros</SelectItem>
                        <SelectItem value="unidades">Unidades</SelectItem>
                        <SelectItem value="kg">Quilogramas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={material.quantidade}
                      onChange={(e) => atualizarMaterial(index, "quantidade", Number.parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label>Valor Unitário (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={material.valorUnit}
                      onChange={(e) => atualizarMaterial(index, "valorUnit", Number.parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Valor Total (R$)</Label>
                    <Input value={formatarBRL(material.valorTotal)} disabled className="bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Observações */}
        <Card className="border-2 border-gray-400">
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={dadosObra.observacoes}
              onChange={(e) => setDadosObra({ ...dadosObra, observacoes: e.target.value })}
              placeholder="Observações adicionais sobre o orçamento..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Resumo e Ações */}
        <Card className="border-2 border-gray-400">
          <CardHeader>
            <CardTitle>Resumo do Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-lg">
              <div className="flex justify-between">
                <span>Valor dos Materiais:</span>
                <span>{formatarBRL(materiais.reduce((total, m) => total + m.valorTotal, 0))}</span>
              </div>
              <div className="flex justify-between">
                <span>Valor da Mão de Obra:</span>
                <span>{formatarBRL(calcularValorMaoObra())}</span>
              </div>
              <div className="flex justify-between">
                <span>Lucro:</span>
                <span>{formatarBRL(dadosObra.lucro || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-xl border-t pt-2">
                <span>Valor Total:</span>
                <span>{formatarBRL(calcularValorTotal())}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button onClick={handleGerarPDF} className="flex-1 bg-transparent" variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Gerar PDF
              </Button>
              <Button onClick={handleSalvarOrcamento} className="flex-1" disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Salvando..." : "Salvar Orçamento"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
