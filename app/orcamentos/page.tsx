"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  buscarOrcamentos,
  aprovarOrcamento,
  excluirOrcamento,
  atualizarOrcamento,
} from "@/app/actions/orcamento-actions";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatarBRL } from "../../lib/utils";

interface OrcamentoListItem {
  id: string;
  cliente: {
    nome: string;
    telefone: string;
  };
  localObra: string;
  valorTotal: number;
  status: string;
  createdAt: string;
}

export default function ListaOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<OrcamentoListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("TODOS");

  const statusOptions = [
    { value: "APROVADO", label: "Aprovado" },
    { value: "EM_ANDAMENTO", label: "Aguardando resposta" },
    { value: "REJEITADO", label: "Rejeitado" },
    { value: "CONCLUIDO", label: "Finalizada" },
    { value: "PENDENTE", label: "Pendente" },
  ];

  useEffect(() => {
    carregarOrcamentos();
  }, []);

  const carregarOrcamentos = async () => {
    try {
      const resultado = await buscarOrcamentos();
      if (resultado.success) {
        setOrcamentos(
          (resultado.orcamentos ?? []).map((o: any) => ({
            id: o.id,
            cliente: {
              nome: o.cliente?.nome || "",
              telefone: o.cliente?.telefone || "",
            },
            localObra: o.localObra,
            valorTotal: o.valorTotal,
            status: o.status,
            createdAt:
              typeof o.createdAt === "string"
                ? o.createdAt
                : new Date(o.createdAt).toISOString(),
          }))
        );
      }
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAprovar = async (orcamentoId: string) => {
    try {
      const resultado = await aprovarOrcamento(orcamentoId);
      if (resultado.success) {
        await carregarOrcamentos();
        alert("Orçamento aprovado com sucesso!");
      }
    } catch (error) {
      alert("Erro ao aprovar orçamento");
    }
  };

  const handleExcluir = async (orcamentoId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita."
      )
    )
      return;
    try {
      const resultado = await excluirOrcamento(orcamentoId);
      if (resultado.success) {
        await carregarOrcamentos();
        alert("Orçamento excluído com sucesso!");
      } else {
        alert("Erro ao excluir orçamento: " + resultado.error);
      }
    } catch (error) {
      alert("Erro ao excluir orçamento");
    }
  };

  const handleStatusChange = async (
    orcamento: OrcamentoListItem,
    novoStatus: string
  ) => {
    if (orcamento.status === "APROVADO") {
      alert("O status não pode ser alterado após aprovação.");
      return;
    }
    try {
      const resultado = await atualizarOrcamento(orcamento.id, {
        status: novoStatus,
        cliente: orcamento.cliente,
      });
      if (resultado.success) {
        await carregarOrcamentos();
        alert("Status atualizado com sucesso!");
      } else {
        alert("Erro ao atualizar status: " + resultado.error);
      }
    } catch (error) {
      alert("Erro ao atualizar status");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      APROVADO: {
        label: "Aprovado",
        variant: "default" as const,
        icon: CheckCircle,
        className: "",
      },
      EM_ANDAMENTO: {
        label: "Aguardando Resposta",
        variant: "default" as const,
        icon: Clock,
        className: "",
      },
      REJEITADO: {
        label: "Rejeitado",
        variant: "destructive" as const,
        icon: XCircle,
        className: "",
      },
      CONCLUIDO: {
        label: "Finalizada",
        variant: "default" as const,
        icon: CheckCircle,
        className: "bg-green-600 text-white",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.EM_ANDAMENTO;
    const Icon = config.icon;
    return (
      <Badge
        variant={config.variant}
        className={`flex items-center gap-1 px-2 py-1 text-xs ${
          config.className || ""
        }`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Filtragem dos orçamentos
  const orcamentosFiltrados = orcamentos.filter((o) => {
    const buscaLower = busca.toLowerCase();
    const nomeInclui = o.cliente.nome.toLowerCase().includes(buscaLower);
    const localInclui = o.localObra.toLowerCase().includes(buscaLower);
    const statusOk =
      statusFiltro === "TODOS" ? true : o.status === statusFiltro;
    return (nomeInclui || localInclui) && statusOk;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-30">
      <div className="max-w-6xl mx-auto">
        <div className="h-8" />
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-black">Orçamentos</h1>
            <p className="text-black">Gerencie todos os orçamentos</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end text-black">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Buscar por cliente ou local da obra"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos</SelectItem>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link href="/novo-orcamento">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Orçamento
              </Button>
            </Link>
          </div>
        </div>

        {orcamentosFiltrados.length === 0 ? (
          <Card className="shadow-xl">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Nenhum orçamento encontrado
              </p>
              <Link href="/novo-orcamento">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Orçamento
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orcamentosFiltrados.map((orcamento) => {
              console.log(
                "Status do orçamento",
                orcamento.id,
                orcamento.status
              );
              return (
                <Card key={orcamento.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4">
                      {/* Header com nome, status e valor */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold truncate">
                              {orcamento.cliente.nome}
                            </h3>
                            <div className="w-fit">
                              {getStatusBadge(orcamento.status)}
                            </div>
                          </div>
                          <p className="flex items-center text-gray-600 text-sm mb-1">
                            <Phone className="w-4 h-4 mr-2" />
                            {orcamento.cliente.telefone}
                          </p>
                          <p className="flex items-center text-gray-600 text-sm mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            {orcamento.localObra}
                          </p>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                          <span className="text-xl sm:text-2xl font-bold text-green-600">
                            {formatarBRL(orcamento.valorTotal)}
                          </span>
                          <span className="flex items-center text-xs sm:text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(
                              new Date(orcamento.createdAt).getTime() +
                                3 * 60 * 60 * 1000
                            ).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link
                          href={`/orcamentos/${orcamento.id}`}
                          passHref
                          legacyBehavior
                        >
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-fill"
                          >
                            <span>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </span>
                          </Button>
                        </Link>
                        {orcamento.status === "PENDENTE" && (
                          <Button
                            onClick={() => handleAprovar(orcamento.id)}
                            size="sm"
                            className="w-fill"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </Button>
                        )}
                        <Button
                          onClick={() => handleExcluir(orcamento.id)}
                          variant="destructive"
                          size="sm"
                          className="w-fill"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
