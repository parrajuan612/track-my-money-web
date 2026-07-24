"use client";

import { useEffect, useState } from "react";
import { analysisService, MonthlySummaryResponse } from "@/services/analysis.service";
import { ArrowUp, ArrowDown, Wallet, TrendingUp, TrendingDown, UploadCloud } from "lucide-react"; // Importamos UploadCloud
import { UploadModal } from "./upload-modal";
export function SummaryCards() {
  const [data, setData] = useState<MonthlySummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Por ahora lo forzamos a "2025-09" que es tu mes de prueba. 
        // Más adelante esto vendrá de un selector de fecha global.
        const summary = await analysisService.getMonthlySummary("2025-09");
        setData(summary);
      } catch (error) {
        console.error("Error al obtener el resumen:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Utilidad para formatear a moneda (USD/COP)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP", // Cambia a USD si lo prefieres
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Pantalla de carga tipo "esqueleto" mientras llegan los datos
if (loading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> {/* Cambiado a 4 columnas */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-[120px] rounded-[24px] bg-white shadow-sm animate-pulse"></div>
        ))}
      </div>
    );
  }

  // Cálculos rápidos
const totalBalance = data.current_month.income - data.current_month.expense;
  
return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> {/* Cambiado a 4 columnas y gap-4 */}
      
      {/* Tarjeta 1: INGRESOS (Ajustado p-5) */}
      <div className="rounded-[24px] bg-white p-5 shadow-sm border border-[#ece9f6] flex flex-col justify-between h-[130px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <ArrowUp size={20} />
          </div>
          <span className="text-xs font-medium text-[#8c8ca5]">Ingresos</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1f1f35] mb-1">
            {formatCurrency(data.current_month.income)}
          </h3>
          <p className={`flex items-center text-[10px] font-medium ${data.variations.income_percentage >= 0 ? "text-green-500" : "text-red-500"}`}>
            {data.variations.income_percentage >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
            {Math.abs(data.variations.income_percentage).toFixed(1)}% vs anterior
          </p>
        </div>
      </div>

      {/* Tarjeta 2: GASTOS (Ajustado p-5) */}
      <div className="rounded-[24px] bg-white p-5 shadow-sm border border-[#ece9f6] flex flex-col justify-between h-[130px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <ArrowDown size={20} />
          </div>
          <span className="text-xs font-medium text-[#8c8ca5]">Gastos</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1f1f35] mb-1">
            {formatCurrency(data.current_month.expense)}
          </h3>
          <p className={`flex items-center text-[10px] font-medium ${data.variations.expense_percentage <= 0 ? "text-green-500" : "text-red-500"}`}>
            {data.variations.expense_percentage <= 0 ? <TrendingDown size={12} className="mr-1" /> : <TrendingUp size={12} className="mr-1" />}
            {Math.abs(data.variations.expense_percentage).toFixed(1)}% vs anterior
          </p>
        </div>
      </div>

      {/* Tarjeta 3: BALANCE TOTAL (Ajustado p-5) */}
<div className="rounded-[24px] bg-white p-5 shadow-sm border border-[#ece9f6] flex flex-col justify-between h-[130px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0edff] text-[#5b38ff]">
            <Wallet size={20} />
          </div>
          <span className="text-xs font-medium text-[#8c8ca5]">Balance total</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1f1f35] mb-1">
            {formatCurrency(totalBalance)}
          </h3>
          <p className="text-[10px] font-medium text-[#8c8ca5]">
            Flujo de caja neto
          </p>
        </div>
      </div>

      {/* NUEVA Tarjeta 4: CARGAR EXTRACTO */}
<div 
        onClick={() => setIsModalOpen(true)} 
        className="rounded-[24px] bg-[#5b38ff] p-5 shadow-[0_8px_25px_rgba(91,56,255,0.3)] hover:bg-[#4620ff] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center h-[130px] group text-white"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform group-hover:scale-110 mb-2">
          <UploadCloud size={24} />
        </div>
        <span className="text-sm font-bold text-white">Cargar Extracto</span>
        <span className="text-[10px] font-medium text-white/80">PDF</span>
      </div>
<UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}