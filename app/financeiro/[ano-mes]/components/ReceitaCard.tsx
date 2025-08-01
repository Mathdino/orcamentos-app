"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatarBRL } from "../../../../lib/utils";

export default function ReceitaCard({ obras }: { obras: any[] }) {
  if (!obras || obras.length === 0) {
    return (
      <div className="bg-white rounded shadow p-4 min-h-[200px] flex flex-col items-center justify-center text-gray-400">
        Nenhuma obra concluída neste mês.
      </div>
    );
  }

  // Função para formatar valores reduzidos no eixo Y
  const formatarValorReduzido = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  // Adaptar os dados reais para o formato do gráfico
  const chartData = obras.map((obra) => {
    const valorMateriais = Array.isArray(obra.materiais)
      ? obra.materiais.reduce(
          (acc: number, m: any) => acc + (m.valorTotal || 0),
          0
        )
      : 0;
    const maoObraAjudantes = Array.isArray(obra.ajudantes)
      ? obra.ajudantes.reduce(
          (acc: number, aj: any) =>
            acc + (aj.valorDiaria || 0) * (aj.dias || 0),
          0
        )
      : 0;
    return {
      nomeCliente: obra.cliente?.nome || "",
      Materiais: valorMateriais,
      "Mão de Obra dos Ajudantes": maoObraAjudantes,
      "Mão de Obra do Pintor Principal": obra.valorMaoObra || 0,
      "Lucro Estimado": obra.lucro || 0,
    };
  });

  // Calcular o valor máximo para definir o domínio do eixo Y
  const maxValue = Math.max(
    ...chartData.map(
      (item) =>
        item.Materiais +
        item["Mão de Obra dos Ajudantes"] +
        item["Mão de Obra do Pintor Principal"] +
        item["Lucro Estimado"]
    )
  );

  return (
    <div className="bg-white rounded shadow p-4 min-h-[200px] flex flex-col">
      <h2 className="text-xl text-black font-semibold mb-2">Receita</h2>
      <div>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            barCategoryGap={32}
          >
            <XAxis dataKey="nomeCliente" />
            <YAxis
              domain={[0, maxValue]}
              tickFormatter={formatarValorReduzido}
            />
            <Tooltip formatter={(value: number) => formatarBRL(value)} />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: "20px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
              }}
            />
            {/* Despesas empilhadas */}
            <Bar
              dataKey="Materiais"
              stackId="despesas"
              fill="#ef4444"
              name="Materiais"
              barSize={32}
            />
            <Bar
              dataKey="Mão de Obra dos Ajudantes"
              stackId="despesas"
              fill="#f59e42"
              name="Mão de Obra dos Ajudantes"
              barSize={32}
            />
            {/* Lucros empilhados */}
            <Bar
              dataKey="Mão de Obra do Pintor Principal"
              stackId="lucro"
              fill="#3b82f6"
              name="Mão de Obra do Pintor Principal"
              barSize={32}
            />
            <Bar
              dataKey="Lucro Estimado"
              stackId="lucro"
              fill="#22c55e"
              name="Lucro Estimado"
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .recharts-legend-wrapper {
            flex-direction: column !important;
            gap: 12px !important;
            margin-top: 16px !important;
          }
          .recharts-legend-item {
            margin: 0 !important;
            padding: 4px 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
