"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buscarClientesComOrcamentos, editarCliente, excluirCliente } from "@/app/actions/cliente-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { formatarBRL } from "../../lib/utils"

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  endereco: string;
  bairro?: string;
  orcamentos: Orcamento[];
}

interface Orcamento {
  id: string;
  localObra: string;
  detalhesEspaco: string;
  metragem: number;
  tempoObra: number;
  tipoPintura: string;
  especificacoes?: string;
  valorMaoObra: number;
  valorTotal: number;
  status: string;
  materiais: Material[];
  dataInicio?: string;
}

interface Material {
  id: string;
  nome: string;
  marca: string;
  quantidade: number;
  unidade: string;
  valorUnit: number;
  valorTotal: number;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroAprovados, setFiltroAprovados] = useState(false);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", endereco: "", bairro: "" });
  const [excluindo, setExcluindo] = useState<string | null>(null);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    setLoading(true);
    try {
      const resultado = await buscarClientesComOrcamentos();
      if (resultado.success) {
        setClientes((resultado.clientes || []).map((c: any) => ({
          ...c,
          email: c.email === null ? undefined : c.email,
        })));
      }
    } catch (error) {
      alert("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (cliente: Cliente) => {
    setEditando(cliente);
    setForm({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email || "",
      endereco: cliente.endereco,
      bairro: cliente.bairro || "",
    });
  };

  const handleSalvarEdicao = async () => {
    if (!editando) return;
    const resultado = await editarCliente(editando.id, form);
    if (resultado.success) {
      setEditando(null);
      await carregarClientes();
    } else {
      alert(resultado.error);
    }
  };

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    const resultado = await excluirCliente(id);
    if (resultado.success) {
      await carregarClientes();
    } else {
      alert(resultado.error);
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    if (filtroAprovados && !c.orcamentos.some((o) => o.status === "APROVADO")) {
      return false;
    }
    if (busca.trim() === "") return true;
    const buscaLower = busca.toLowerCase();
    if (c.nome.toLowerCase().includes(buscaLower)) return true;
    return c.orcamentos.some((o) => {
      if (o.status === "APROVADO" && o.dataInicio) {
        const dataFormatada = format(new Date(o.dataInicio), "dd/MM/yyyy");
        return dataFormatada.includes(busca);
      }
      return false;
    });
  });

  if (loading) {
    return <div className="p-8 text-center">Carregando clientes...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-30">
      <div className="max-w-5xl mx-auto">
        <div className="h-8" />
        <div className="mb-2">
          <h1 className="text-2xl font-bold mb-6 text-black">Clientes</h1>
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center w-full max-w-md sm:max-w-none">
            <Input
              placeholder="Buscar por nome ou data (dd/mm/aaaa)"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full sm:w-56 placeholder-black text-black border-gray-400"
              style={{ color: '#000', borderColor: '#888' }}
            />
            <Button
              variant={filtroAprovados ? "default" : "outline"}
              onClick={() => setFiltroAprovados((v) => !v)}
              className="text-black border-gray-400"
              style={{ color: '#000', borderColor: '#888' }}
            >
              {filtroAprovados ? "Mostrar Todos" : "Filtrar por Aprovados"}
            </Button>
          </div>
        </div>
        {clientesFiltrados.length === 0 ? (
          <div className="text-gray-500">Nenhum cliente cadastrado ainda.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientesFiltrados.map((cliente) => (
              <Card key={cliente.id} className="shadow-xl">
                <CardHeader className="relative">
                  <CardTitle>{cliente.nome}</CardTitle>
                  {cliente.orcamentos.map((orcamento) => (
                    orcamento.status === "APROVADO" && orcamento.dataInicio ? (
                      <span
                        key={orcamento.id}
                        className="absolute top-2 right-4 text-xs text-green-700 bg-green-100 px-2 py-1 rounded shadow"
                        title="Data de aprovação"
                      >
                        {format(new Date(orcamento.dataInicio), "dd/MM/yyyy")}
                      </span>
                    ) : null
                  ))}
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditar(cliente)}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleExcluir(cliente.id)}>Excluir</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {cliente.orcamentos.length === 0 ? (
                    <div className="text-gray-400 text-sm">Nenhum orçamento para este cliente.</div>
                  ) : (
                    <div className="space-y-4">
                      {cliente.orcamentos.map((orcamento) => (
                        <div key={orcamento.id} className="border rounded p-2 bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between">
                          <div>
                            <div><b>Obra:</b> {orcamento.localObra}</div>
                          </div>
                          <div>
                            <b>Valor:</b> <span className="font-bold">{formatarBRL(orcamento.valorTotal)}</span>
                          </div>
                          <div>
                            <b>Status:</b> <span className={"font-bold " + (orcamento.status === "APROVADO" ? "text-green-600" : orcamento.status === "CONCLUIDO" ? "text-green-600" : "text-gray-600")}>{orcamento.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Dialog open={!!editando} onOpenChange={() => setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Input placeholder="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            <Input placeholder="Telefone" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
            <Input placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            <div className="flex flex-col gap-2 mt-2">
              <Input placeholder="Endereço" value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} />
              <Input placeholder="Bairro" value={form.bairro} onChange={e => setForm(f => ({ ...f, bairro: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSalvarEdicao}>Salvar</Button>
            <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 