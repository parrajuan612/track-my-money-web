"use client";

import { useAuth } from "@/providers/auth-context";
import { LogOut } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-[#ece9f6] flex items-center justify-between px-8">
      <div>
        {/* Aquí podemos poner un buscador o un título más adelante */}
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
    </header>
  );
}