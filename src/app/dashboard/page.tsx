"use client";

import { useAuth } from "@/providers/auth-context";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { FlowMoneyChart } from "@/components/dashboard/flow-money-chart";
import { RecentMovements } from "@/components/dashboard/recent-movements";

// 1. Agregamos la función para extraer el primer nombre y ponerle mayúscula
const formatFirstName = (fullName?: string) => {
  if (!fullName || fullName.toLowerCase() === "usuario") return "Usuario";
  
  const firstName = fullName.trim().split(" ")[0]; // Extrae "juan"
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase(); // Lo convierte a "Juan"
};

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5b38ff] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]"> {/* Ampliamos un poco el max-width para que respiren las 4 tarjetas */}
      <header className="mb-6"> {/* Reducimos margen inferior */}
        <h1 className="text-2xl font-extrabold text-[#1f1f35]"> {/* Texto ligeramente más pequeño */}
          {/* 2. Aplicamos la función al nombre que viene del AuthContext */}
          ¡Hola, {formatFirstName(user?.name)}! 👋
        </h1>
        <p className="text-[#8c8ca5] text-sm">Aquí tienes el resumen de tus finanzas hoy.</p>
      </header>

      {/* Fila 1: Tarjetas de Resumen (AHORA SON 4 COLUMNAS) */}
      <SummaryCards />

      {/* Fila 2: Gráficos y Movimientos */}
      {/* Cambiamos a grid-cols-12 para tener control más fino. Izquierda toma 8, derecha toma 4 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Lado Izquierdo (Flujo de Caja - más ancho) */}
        <div className="lg:col-span-8">
           <FlowMoneyChart />
        </div>
        
        {/* Lado Derecho (Dona + Movimientos apilados) */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          <CategoryChart />
          <RecentMovements />
        </div>
        
      </div>
    </div>
  );
}
