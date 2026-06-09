"use client";

import { useEffect, useState } from "react";
import { analysisService, MoneyFlowData } from "@/services/analysis.service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function FlowMoneyChart() {
  const [data, setData] = useState<MoneyFlowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"1w" | "1m" | "1y">("1m"); // Por defecto mostramos el mes

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Nota: Aquí puedes pasar tu account_id como segundo parámetro si lo necesitas
        // ej: await analysisService.getMoneyFlow(range, "3bf374ea-db66...");
        const result = await analysisService.getMoneyFlow(range);
        setData(result);
      } catch (error) {
        console.error("Error al obtener el flujo de caja:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]); // Se vuelve a ejecutar cada vez que cambia el 'range'

  // Formateadores para que los números grandes se vean limpios
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
  };

  const formatCompactYAxis = (amount: number) => {
    return new Intl.NumberFormat("es-CO", { notation: "compact", compactDisplay: "short" }).format(amount);
  };

  return (
    <div className="flex h-full min-h-[380px] w-full flex-col rounded-[24px] border border-[#ece9f6] bg-white p-6 shadow-sm">
      
      {/* Header del Gráfico con los Filtros */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-extrabold text-[#1f1f35]">Flujo de efectivo</h3>
        
        {/* Botones de Rango */}
        <div className="flex rounded-lg bg-[#f8f9fc] p-1">
          {(["1w", "1m", "1y"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                range === r
                  ? "bg-white text-[#5b38ff] shadow-sm"
                  : "text-[#8c8ca5] hover:text-[#1f1f35]"
              }`}
            >
              {r === "1w" ? "1 Sem" : r === "1m" ? "1 Mes" : "1 Año"}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de Barras */}
      <div className="flex-1">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5b38ff] border-t-transparent"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%" minHeight={250}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece9f6" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8c8ca5', fontSize: 12 }} 
                dy={10} 
              />
              <YAxis 
                tickFormatter={formatCompactYAxis} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#8c8ca5', fontSize: 12 }} 
              />
                <Tooltip
                  cursor={{ fill: '#f8f9fc' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #ece9f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), ""]}
                />
              <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
              
              {/* Usamos Verde para Ingresos y Rojo para Gastos */}
              <Bar dataKey="income" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}