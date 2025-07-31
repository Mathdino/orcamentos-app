export interface Cliente {
  id?: string
  nome: string
  telefone: string
  tipo: "fisica" | "juridica"
  cpf?: string
  cnpj?: string
  email?: string
  endereco: string
  cep: string
  numero: string
  complemento?: string
  bairro?: string
}

export interface Material {
  id?: string
  nome: string
  marca: string
  quantidade: number
  unidade: string
  valorUnit: number
  valorTotal: number
}

export interface Ajudante {
  nome: string
  valorDiaria: number
  dias: number
}

export interface DadosOrcamento {
  cliente: Cliente
  localObra: string
  detalhesEspaco: string
  metragem: number
  tempoObra: number
  tipoServico: string
  especificacoes?: string
  materiais: Material[]
  valorMaoObra: number
  observacoes?: string
  valorDiariaPrincipal: number
  diasPrincipal: number
  ajudantes: Ajudante[]
  tipoMetragem: "metro" | "empreita"
  valorEmpreita?: number
  lucro?: number
  // Novos campos para PDF
  dataInicioObra?: string
  dataTerminoObra?: string
  nomePrincipal?: string
}

export interface OrcamentoCompleto extends DadosOrcamento {
  id: string
  valorTotal: number
  status: "PENDENTE" | "APROVADO" | "REJEITADO" | "EM_ANDAMENTO" | "CONCLUIDO" | "NAO_INICIADO" | "EM_PREPARACAO"
  createdAt: Date
  dataInicioObra?: string
  dataTerminoObra?: string
}

export interface Pagamento {
  id?: string
  orcamentoId: string
  valor: number
  metodoPagamento: string
  statusPagamento: "PENDENTE" | "PAGO" | "ATRASADO" | "CANCELADO"
  dataVencimento: Date
  dataPagamento?: Date
  numeroParcela: number
  totalParcelas: number
  observacoes?: string
}

export interface RelatorioFinanceiro {
  totalFaturamento: number
  totalLucro: number
  totalPendente: number
  totalAtrasado: number
  obrasConcluidas: number
  obrasAndamento: number
  pagamentosPorMetodo: Record<string, number>
  faturamentoPorMes: Array<{
    mes: string
    valor: number
    lucro: number
  }>
}

export interface FiltroFinanceiro {
  dataInicio?: Date
  dataFim?: Date
  statusPagamento?: string
  metodoPagamento?: string
  clienteId?: string
}
