"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function ServicosCard({ obras }: { obras: any[] }) {
  if (!obras || obras.length === 0) {
    return <div className="bg-white rounded shadow p-4 min-h-[200px] flex flex-col items-center justify-center text-gray-400">Nenhuma obra concluída neste mês.</div>
  }
  // Calcular ranking de serviços
  const ranking = obras.reduce((acc: Record<string, number>, obra) => {
    acc[obra.tipoServico] = (acc[obra.tipoServico] || 0) + 1
    return acc
  }, {})
  const data = Object.entries(ranking).map(([nomeServico, quantidadeObras]) => ({ 
    nomeServico: nomeServico
      .replace(/_/g, ' ')
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
    quantidadeObras 
  }))
  return (
    <div className="bg-white rounded shadow p-4 min-h-[200px] flex flex-col">
      <h2 className="text-xl text-black font-semibold mb-2">Serviços Realizados no Mês</h2>
      <div className="flex-1 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="nomeServico" type="category" width={180} interval={0} />
            <Tooltip />
            <Bar dataKey="quantidadeObras" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
} 