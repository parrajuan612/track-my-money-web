// Agregamos las importaciones aquí arriba
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] overflow-hidden">
      {/* 1. El Menú Lateral Fijo */}
      <Sidebar />

      {/* 2. El Contenedor Derecho (Header + Contenido) */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        
        {/* 3. El contenido dinámico que hace scroll */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}