import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Users, Calculator, Hammer } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 mt-10">
        <div className="h-8" />
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-extrabold mb-4 drop-shadow-lg"
            style={{ color: "#000" }}
          >
            Sistema de Orçamentos
          </h1>
          <p className="text-xl text-black max-w-2xl mx-auto">
            Gerencie orçamentos de pintura de forma profissional e eficiente
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white border border-yellow-900/60 shadow-xl rounded-2xl hover:scale-105 hover:shadow-yellow-400/30 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-12 h-12 text-blue-600" />
              </div>
              <CardTitle style={{ color: "#000" }}>Novo Orçamento</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6">
                Crie um novo orçamento completo com todos os detalhes da obra
              </p>
              <Link href="/novo-orcamento">
                <Button className="w-full bg-[#7eaa37] text-white font-bold hover:bg-[#455d1d] transition-colors">
                  Criar Orçamento
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-grenn-900/60 shadow-xl rounded-2xl hover:scale-105 hover:shadow-grenn-400/30 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-12 h-12 text-green-900" />
              </div>
              <CardTitle style={{ color: "#000" }}>Orçamentos</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6">
                Visualize e gerencie todos os orçamentos criados
              </p>
              <Link href="/orcamentos">
                <Button
                  variant="outline"
                  className="w-full border-[#7eaa37] text-[#7eaa37] hover:bg-[#7eaa37] hover:text-white transition-colors"
                >
                  Ver Orçamentos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-grenn-900/60 shadow-xl rounded-2xl hover:scale-105 hover:shadow-grenn-400/30 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto bg-yellow-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                <Hammer className="w-12 h-12 text-yellow-600" />
              </div>
              <CardTitle style={{ color: "#000" }}>Obras</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6">
                Visualize e gerencie todas as obras cadastradas
              </p>
              <Link href="/obras">
                <Button
                  variant="outline"
                  className="w-full border-[#7eaa37] text-[#7eaa37] hover:bg-[#7eaa37] hover:text-white transition-colors"
                >
                  Ver Obras
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-grenn-900/60 shadow-xl rounded-2xl hover:scale-105 hover:shadow-grenn-400/30 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto bg-purple-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                <Users className="w-12 h-12 text-purple-600" />
              </div>
              <CardTitle style={{ color: "#000" }}>Clientes</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6">
                Gerencie informações dos seus clientes
              </p>
              <Link href="/clientes">
                <Button
                  variant="outline"
                  className="w-full border-[#7eaa37] text-[#7eaa37] hover:bg-[#7eaa37] hover:text-white transition-colors"
                >
                  Ver Clientes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-grenn-900/60 shadow-xl rounded-2xl hover:scale-105 hover:shadow-grenn-400/30 transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto bg-orange-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
                <Calculator className="w-12 h-12 text-orange-600" />
              </div>
              <CardTitle style={{ color: "#000" }}>Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-black mb-6">
                Controle financeiro, pagamentos e relatórios
              </p>
              <Link href="/financeiro">
                <Button
                  variant="outline"
                  className="w-full border-[#7eaa37] text-[#7eaa37] hover:bg-[#7eaa37] hover:text-white transition-colors"
                >
                  Ver Financeiro
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-4xl mx-auto border border-grenn-900/60 mt-16">
          <h2 className="text-2xl font-bold mb-4" style={{ color: "#000" }}>
            Funcionalidades do Sistema
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start gap-3">
              <Calculator className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2" style={{ color: "#000" }}>
                  Cálculo Automático
                </h3>
                <p className="text-black">
                  Calcule automaticamente o valor total baseado nos materiais e
                  mão de obra
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2" style={{ color: "#000" }}>
                  Geração de PDF
                </h3>
                <p className="text-black">
                  Gere PDFs profissionais dos orçamentos para apresentar aos
                  clientes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2" style={{ color: "#000" }}>
                  Histórico de Clientes
                </h3>
                <p className="text-black">
                  Mantenha histórico completo de todos os clientes e obras
                  realizadas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Plus className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold mb-2" style={{ color: "#000" }}>
                  Controle de Materiais
                </h3>
                <p className="text-black">
                  Cadastre materiais com marca, quantidade e valores para
                  controle preciso
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
