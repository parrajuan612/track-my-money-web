"use client";

import { useEffect, useState } from "react";
import { analysisService } from "@/services/analysis.service";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import Link from "next/link";

// Paleta de colores moderna
const COLORS = ["#5b38ff", "#a58cf6", "#00d084", "#ffb800", "#ff4d4d", "#00d9e1", "#ff7ac6", "#7a9cff", "#ff9d7a", "#7affb8", "#c87aff", "#ffc87a"];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    payload: {
      percentage: number;
    };
  }[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length > 0) {
    return (
      <div className="rounded-xl border border-[#ece9f6] bg-white p-4 shadow-lg outline-none">
        <p className="mb-1 font-bold text-[#1f1f35]">{payload[0].name}</p>
        <p className="text-sm font-medium text-[#5b38ff]">
          {formatCurrency(payload[0].value)}
        </p>
        <p className="text-xs text-[#8c8ca5]">
          {payload[0].payload.percentage?.toFixed(1)}% del total
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryChart() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Calculamos el mes actual dinámicamente
  const today = new Date();
  const currentMonthName = today.toLocaleDateString('es-CO', { month: 'long' }); // Ejemplo: "junio"

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtenemos el primer y último día del mes actual
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        // Usamos la nueva estructura de la API enviando las dos fechas
        const result = await analysisService.getCategoryDistribution(firstDay, lastDay);
        setData(result);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex h-[380px] w-full animate-pulse flex-col rounded-[24px] bg-white p-6 shadow-sm">
        <div className="h-6 w-1/3 rounded-md bg-gray-200 mb-6"></div>
        <div className="m-auto h-40 w-40 rounded-full bg-gray-200"></div>
      </div>
    );
  }

  const validCategories = data.categories || [];
  
  if (validCategories.length === 0) {
    return (
      <div className="flex h-full min-h-[380px] w-full flex-col rounded-[24px] border border-[#ece9f6] bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-[#1f1f35]">Gastos de este mes</h3>
            <p className="text-xs font-medium text-[#8c8ca5] capitalize">{currentMonthName}</p>
          </div>
          <Link href="/dashboard/analysis" className="flex items-center gap-1 text-xs font-bold text-[#5b38ff] hover:text-[#4524db] transition-colors">
            Análisis <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm font-medium text-[#8c8ca5]">No hay gastos registrados este mes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-[380px] w-full flex-col rounded-[24px] border border-[#ece9f6] bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          {/* Título más explícito como sugeriste */}
          <h3 className="text-lg font-extrabold text-[#1f1f35]">Gastos de este mes</h3>
          <p className="text-xs font-medium text-[#8c8ca5] capitalize">{currentMonthName}</p>
        </div>
        <Link 
          href="/dashboard/analysis" 
          className="flex items-center gap-1 text-xs font-bold text-[#5b38ff] hover:text-[#4524db] transition-colors"
        >
          Análisis detallado <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={validCategories}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={5}
              dataKey="amount"
              nameKey="category_name"
            >
              {validCategories.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {validCategories.map((category: any, index: number) => (
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

