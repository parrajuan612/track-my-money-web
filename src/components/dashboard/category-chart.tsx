"use client";

import { useEffect, useState } from "react";
import { analysisService, CategoryDistributionResponse } from "@/services/analysis.service";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Paleta de colores moderna inspirada en tu diseño
const COLORS = ["#5b38ff", "#a58cf6", "#00d084", "#ffb800", "#ff4d4d", "#00d9e1"];

export function CategoryChart() {
  const [data, setData] = useState<CategoryDistributionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analysisService.getCategoryDistribution("2025-09");
        setData(result);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading || !data) {
    return (
      <div className="flex h-[380px] w-full animate-pulse flex-col rounded-[24px] bg-white p-6 shadow-sm">
        <div className="h-6 w-1/3 rounded-md bg-gray-200 mb-6"></div>
        <div className="m-auto h-40 w-40 rounded-full bg-gray-200"></div>
      </div>
    );
  }

  // Tooltip personalizado para el gráfico
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-[#ece9f6] bg-white p-4 shadow-lg outline-none">
          <p className="mb-1 font-bold text-[#1f1f35]">{payload[0].name}</p>
          <p className="text-sm font-medium text-[#5b38ff]">
            {formatCurrency(payload[0].value)}
          </p>
          <p className="text-xs text-[#8c8ca5]">
            {payload[0].payload.percentage.toFixed(2)}% del total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex h-full min-h-[380px] w-full flex-col rounded-[24px] border border-[#ece9f6] bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-extrabold text-[#1f1f35]">Gastos por categoría</h3>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data.categories}
              cx="50%"
              cy="50%"
              innerRadius={60} // Esto lo convierte en una "dona"
              outerRadius={85}
              paddingAngle={5} // Espacio entre las tajadas
              dataKey="amount"
              nameKey="category_name"
            >
              {data.categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda personalizada debajo del gráfico */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {data.categories.map((category, index) => (
          <div key={category.category_name} className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full shrink-0" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-bold text-[#1f1f35]" title={category.category_name}>
                {category.category_name}
              </span>
              <span className="text-xs text-[#8c8ca5]">
                {category.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}