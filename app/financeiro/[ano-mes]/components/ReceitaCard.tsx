"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatarBRL } from "../../../../lib/utils"

export default function ReceitaCard({ obras }: { obras: any[] }) {
  if (!obras || obras.length === 0) {
    return <div className="bg-white rounded shadow p-4 min-h-[200px] flex flex-col items-center justify-center text-gray-400">Nenhuma obra concluída neste mês.</div>
  }
  // Adaptar os dados reais para o formato do gráfico
  const chartData = obras.map((obra) => {
    const valorMateriais = Array.isArray(obra.materiais)
      ? obra.materiais.reduce((acc: number, m: any) => acc + (m.valorTotal || 0), 0)
      : 0;
    const maoObraAjudantes = Array.isArray(obra.ajudantes)
      ? obra.ajudantes.reduce((acc: number, aj: any) => acc + ((aj.valorDiaria || 0) * (aj.dias || 0)), 0)
      : 0;
    return {
      nomeCliente: obra.cliente?.nome || "",
      Materiais: valorMateriais,
      "Mão de Obra dos Ajudantes": maoObraAjudantes,
      "Mão de Obra do Pintor Principal": obra.valorMaoObra || 0,
      "Lucro Estimado": obra.lucro || 0,
    }
  })
  return (
    <div className="bg-white rounded shadow p-4 min-h-[200px] flex flex-col">
      <h2 className="text-xl text-black font-semibold mb-2">Receita</h2>
      <div>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }} barCategoryGap={32}>
            <XAxis dataKey="nomeCliente" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatarBRL(value)} />
            <Legend />
            {/* Despesas empilhadas */}
            <Bar dataKey="Materiais" stackId="despesas" fill="#ef4444" name="Materiais" barSize={32} />
            <Bar dataKey="Mão de Obra dos Ajudantes" stackId="despesas" fill="#f59e42" name="Mão de Obra dos Ajudantes" barSize={32} />
            {/* Lucros empilhados */}
            <Bar dataKey="Mão de Obra do Pintor Principal" stackId="lucro" fill="#3b82f6" name="Mão de Obra do Pintor Principal" barSize={32} />
            <Bar dataKey="Lucro Estimado" stackId="lucro" fill="#22c55e" name="Lucro Estimado" barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 