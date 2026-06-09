"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { movementService, Movement } from "@/services/movement.service";
import { 
  ArrowRight, 
  Car, 
  ShoppingCart, 
  Tv, 
  Lightbulb, 
  DollarSign, 
  UtensilsCrossed, 
  HelpCircle 
} from "lucide-react";

// --- Mapeo de Categorías a Íconos ---
// Asocia tus categorías reales de la DB con un ícono y un color de fondo circular
const categoryMap: { [key: string]: { icon: React.ElementType, bg: string, color: string } } = {
  "Transporte": { icon: Car, bg: "bg-gray-100", color: "text-[#1f1f35]" },
  "Uber": { icon: Car, bg: "bg-gray-100", color: "text-[#1f1f35]" }, // Ejemplo específico
  "Alimentación": { icon: ShoppingCart, bg: "bg-gray-100", color: "text-[#1f1f35]" },
  "Restaurante/Comida/Supermercado": { icon: UtensilsCrossed, bg: "bg-gray-100", color: "text-[#1f1f35]" },
  "Supermercado Plaza": { icon: ShoppingCart, bg: "bg-gray-100", color: "text-[#1f1f35]" },
  "Entretenimiento": { icon: Tv, bg: "bg-gray-100", color: "text-[#1f1f35]" },
  "Netflix": { icon: Tv, bg: "bg-gray-100", color: "text-[#1f1f35]" },
  "Servicios": { icon: Lightbulb, bg: "bg-gray-100", color: "text-[#1f1f35]" },
  "Pago de luz": { icon: Lightbulb, bg: "bg-gray-100", color: "text-[#1f1f35]" },
  "Ingresos": { icon: DollarSign, bg: "bg-green-100", color: "text-green-600" },
  "Salario": { icon: DollarSign, bg: "bg-green-100", color: "text-green-600" },
  // Categoría por defecto si no encuentra coincidencia
  "default": { icon: HelpCircle, bg: "bg-gray-100", color: "text-[#8c8ca5]" }
};

export function RecentMovements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovements = async () => {
      try {
        const response = await movementService.getRecentMovements();
        // Request page_size=5 o page_size=6 para que coincida con el mockup
        setMovements(response.data || []);
      } catch (error) {
        console.error("Error al obtener movimientos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovements();
  }, []);

  // --- Funciones de Formateo ---

  const formatCurrency = (amount: number, type: "income" | "expense") => {
    const isIncome = type === "income" || amount > 0;
    const formattedAmount = new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));

    return `${isIncome ? "+ " : "- "}${formattedAmount}`;
  };

  const formatMovementDate = (dateString: string) => {
    const movementDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Reset horas para comparar solo fechas
    const isToday = movementDate.toDateString() === today.toDateString();
    const isYesterday = movementDate.toDateString() === yesterday.toDateString();

    if (isToday) return "Hoy";
    if (isYesterday) return "Ayer";

    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
    }).format(movementDate);
  };

  // --- Retorno Visual ---

  if (loading) {
    return (
      <div className="w-full flex-col rounded-3xl border border-[#ece9f6] bg-white p-6 shadow-sm animate-pulse h-64"></div>
    );
  }

const displayedMovements = movements.slice(0, 3);

  return (
    <div className="flex w-full flex-col rounded-[24px] border border-[#ece9f6] bg-white shadow-sm">
      {/* Título de la Sección (Padding reducido) */}
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-[1.1rem] font-extrabold text-[#1f1f35]">Últimos movimientos</h3>
      </div>

      {/* Lista de Movimientos (Padding y espaciado reducido) */}
      <div className="space-y-4 px-5">
        {displayedMovements.length === 0 ? (
          <p className="py-4 text-center text-xs text-[#8c8ca5]">No hay movimientos recientes.</p>
        ) : (
          displayedMovements.map((mov) => {
            const isIncome = mov.Type === "income" || mov.Amount > 0;
            const categoryConfig = categoryMap[mov.Description] || categoryMap[mov.category_name] || categoryMap["default"];
            const { icon: CategoryIcon, bg, color } = categoryConfig;

            return (
              <div key={mov.ID} className="flex items-center justify-between gap-3">
                {/* Lado Izquierdo */}
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bg} ${color}`}>
                    <CategoryIcon size={18} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <p className="text-[0.9rem] font-bold text-[#1f1f35] truncate" title={mov.Description}>
                      {mov.Description}
                    </p>
                    <p className="text-[0.75rem] text-[#8c8ca5] truncate">
                      {mov.category_name}
                    </p>
                  </div>
                </div>

                {/* Lado Derecho */}
                <div className="flex flex-col items-end shrink-0">
                  <p className={`text-[0.95rem] font-bold ${isIncome ? "text-green-500" : "text-[#1f1f35]"}`}>
                    {formatCurrency(mov.Amount, mov.Type)}
                  </p>
                  <p className="text-[0.75rem] text-[#8c8ca5]">
                    {formatMovementDate(mov.Date)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Enlace de Ver todos (Padding reducido) */}
      <div className="p-5 pt-3 text-right mt-auto">
        <Link 
          href="/dashboard/movements" 
          className="flex items-center gap-1 justify-end text-[0.8rem] font-bold text-[#5b38ff] transition-colors hover:text-[#4620ff]"
        >
          Ver todos <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}