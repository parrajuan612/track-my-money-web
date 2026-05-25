"use client";

import { useAuth } from "@/providers/auth-context";
import { LogOut, User, Wallet, TrendingUp, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();

  // Si el contexto aún está cargando la sesión
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f4fa]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#5b38ff] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f4fa]">
      {/* Header Sencillo */}
      <nav className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5b38ff] text-white font-bold">
            TM
          </div>
          <span className="text-xl font-bold text-[#1f1f35]">TrackMyMoney</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-[#1f1f35]">{user?.name}</p>
            <p className="text-xs text-[#8c8ca5]">{user?.email}</p>
          </div>
          <button 
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0f0] text-[#ff4d4d] transition-colors hover:bg-[#ff4d4d] hover:text-white"
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      {/* Contenido del Dashboard */}
      <main className="mx-auto max-w-7xl p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#1f1f35]">
            ¡Hola, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-[#8c8ca5]">Aquí tienes el resumen de tus finanzas hoy.</p>
        </header>

        {/* Grid de ejemplo (Próximamente conectaremos esto a la DB) */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[24px] bg-white p-6 shadow-sm border border-transparent hover:border-[#5b38ff] transition-all cursor-default">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0edff] text-[#5b38ff]">
              <Wallet size={24} />
            </div>
            <p className="text-sm font-medium text-[#8c8ca5]">Balance Total</p>
            <h3 className="text-2xl font-bold text-[#1f1f35]">$0.00</h3>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-sm border border-transparent hover:border-green-500 transition-all cursor-default">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
              <ArrowUpRight size={24} />
            </div>
            <p className="text-sm font-medium text-[#8c8ca5]">Ingresos del mes</p>
            <h3 className="text-2xl font-bold text-[#1f1f35]">$0.00</h3>
          </div>

          <div className="rounded-[24px] bg-white p-6 shadow-sm border border-transparent hover:border-[#5b38ff] transition-all cursor-default text-center flex flex-col items-center justify-center border-dashed border-[#ece9f6]">
            <p className="text-[#8c8ca5] text-sm mb-2">¿Listo para empezar?</p>
            <button className="rounded-xl bg-[#5b38ff] px-6 py-2 text-sm font-bold text-white hover:bg-[#4620ff]">
              + Agregar Movimiento
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}