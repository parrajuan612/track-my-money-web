"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  ArrowLeftRight, 
  LayoutGrid, 
  PieChart, 
  Target, 
  TrendingUp, 
  FileText, 
  CreditCard, 
  Settings 
} from "lucide-react";


const menuItems = [
  { name: "Resumen", href: "/dashboard", icon: Home },
  { name: "Movimientos", href: "/dashboard/movements", icon: ArrowLeftRight },
  { name: "Análisis", href: "/dashboard/analysis", icon: TrendingUp },
  { name: "Cuentas", href: "/dashboard/accounts", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[260px] flex-col border-r border-[#ece9f6] bg-white">
      {/* Sección del Logo */}
      <div className="flex h-20 items-center px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5b38ff] font-bold text-white">
            TM
          </div>
          <span className="text-[1.15rem] font-extrabold tracking-tight text-[#1f1f35]">
            TRACK MY MONEY
          </span>
        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <ul className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[0.95rem] font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#f0edff] text-[#5b38ff]" // Estilo activo (lavanda/morado)
                      : "text-[#8c8ca5] hover:bg-[#f8f9fc] hover:text-[#1f1f35]" // Estilo inactivo
                  }`}
                >
                  <item.icon 
                    size={20} 
                    className={isActive ? "text-[#5b38ff]" : "text-[#b5b5c3]"} 
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sección Inferior (Opcional: Versión o ayuda) */}
      <div className="p-6 text-center">
        <p className="text-xs text-[#b5b5c3]">TrackMyMoney v1.0</p>
      </div>
    </aside>
  );
}