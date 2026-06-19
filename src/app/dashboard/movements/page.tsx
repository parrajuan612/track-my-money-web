"use client";

import { useEffect, useState, useCallback } from "react";
import { movementService, MovementFilters } from "@/services/movement.service";
import { Search, Filter, Calendar, DollarSign, Tag, RefreshCcw } from "lucide-react";

// Categorías "quemadas" por ahora, luego pueden venir de la API
const CATEGORIES = [
  { id: 1, name: "Restaurante/Comida/Supermercado" },
  { id: 2, name: "Ropa/Calzado" },
  { id: 3, name: "Salud/Deporte" },
  { id: 4, name: "Servicios/Suscripciones" },
  { id: 5, name: "Transporte" },
  { id: 6, name: "Viajes" },
  { id: 7, name: "Educación" },
  { id: 8, name: "Entretenimiento" },
  { id: 9, name: "Hogar/Alquiler" },
  { id: 10, name: "Salario" },
  { id: 11, name: "Otros Ingresos" },
  { id: 12, name: "Otros Gastos" }
];

export default function MovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // --- FECHAS POR DEFECTO (Mes Actual) ---
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  // Estado con filtros más explícitos y fechas por defecto
  const [filters, setFilters] = useState<MovementFilters>({
    page: 1, // Empezamos en la página 1
    page_size: 10, // Traemos de a 10 para que sea rápido
    query: "",
    type: "",
    category_id: undefined,
    start_date: firstDay,
    end_date: lastDay,
  });

  // Funciones de Paginación
  const handleNextPage = () => {
    setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  };

  const handlePrevPage = () => {
    setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }));
  };

  // Calculamos el total de páginas
  const totalPages = Math.ceil(totalRecords / (filters.page_size || 10));

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      );
      
      // Usamos "any" aquí para que TypeScript no se queje de la propiedad "meta"
      const result: any = await movementService.getMovements(activeFilters);
      
      setMovements(result.data || []); 
      
      // Guardamos el total de registros
      if (result.meta && result.meta.total) {
        setTotalRecords(result.meta.total);
      } else {
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error al cargar movimientos:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Disparar la búsqueda cuando cambian los filtros
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMovements();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchMovements]);

  // Manejador de cambios en los inputs
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ 
      ...prev, 
      [name]: value, 
      page: 1 // Siempre regresamos a la página 1 al filtrar
    })); 
  };

  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      page: 1,
      page_size: 10,
      query: "",
      type: "",
      category_id: undefined,
      start_date: firstDay,
      end_date: lastDay,
    });
  };

  // Utilidades de formato
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-CO", { year: 'numeric', month: 'short', day: '2-digit' });
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-10">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1f1f35]">Historial de Movimientos</h1>
          <p className="text-sm text-[#8c8ca5]">Filtra, busca y audita tus finanzas a detalle.</p>
        </div>
        <button 
          onClick={clearFilters}
          className="flex items-center gap-2 text-sm font-bold text-[#5b38ff] bg-[#f0edff] px-4 py-2 rounded-lg hover:bg-[#e4dfff] transition-colors"
        >
          <RefreshCcw size={16} /> Limpiar Filtros
        </button>
      </div>

      {/* PANEL DE FILTROS */}
      <div className="rounded-[24px] border border-[#ece9f6] bg-white p-6 shadow-sm">
        <div className="mb-5 relative">
          <label className="mb-2 block text-xs font-extrabold uppercase text-[#8c8ca5]">Buscar Descripción</label>
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b5b5c3]" />
            <input
              type="text"
              name="query"
              value={filters.query}
              onChange={handleFilterChange}
              placeholder="Ej: Netflix, Uber, Restaurante..."
              className="w-full rounded-xl border border-[#ece9f6] bg-[#f8f9fc] p-3.5 pl-12 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-1 focus:ring-[#5b38ff] transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase text-[#8c8ca5]">Desde</label>
            <div className="relative flex items-center">
              <input
                type="date"
                name="start_date"
                value={filters.start_date || ""}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase text-[#8c8ca5]">Hasta</label>
            <div className="relative flex items-center">
              <input
                type="date"
                name="end_date"
                value={filters.end_date || ""}
                onChange={handleFilterChange}
                className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase text-[#8c8ca5]">Tipo de Flujo</label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5c3]" />
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full appearance-none rounded-xl border border-[#ece9f6] bg-white p-3 pl-9 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff] cursor-pointer transition-all"
              >
                <option value="">Todos los movimientos</option>
                <option value="income">Solo Ingresos (+)</option>
                <option value="expense">Solo Gastos (-)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase text-[#8c8ca5]">Categoría</label>
            <div className="relative">
              <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5c3]" />
              <select
                name="category_id"
                value={filters.category_id || ""}
                onChange={handleFilterChange}
                className="w-full appearance-none rounded-xl border border-[#ece9f6] bg-white p-3 pl-9 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff] cursor-pointer transition-all"
              >
                <option value="">Todas las categorías</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL TABLA + PAGINACIÓN */}
      <div className="rounded-[24px] border border-[#ece9f6] bg-white shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 text-[#8c8ca5] flex-1">
             <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5b38ff] border-t-transparent mb-4"></div>
             <p className="font-medium">Buscando movimientos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-[#8c8ca5]">
              <thead className="border-b border-[#ece9f6] bg-[#f8f9fc] text-[11px] font-extrabold uppercase tracking-wider text-[#b5b5c3]">
                <tr>
                  <th className="px-6 py-5">Fecha</th>
                  <th className="px-6 py-5">Descripción</th>
                  <th className="px-6 py-5">Categoría</th>
                  <th className="px-6 py-5 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece9f6]">
                {movements.length > 0 ? (
                  movements.map((mov, idx) => {
                    const rawType = (mov.Type || mov.type || "").toLowerCase();
                    const rawAmount = Number(mov.Amount !== undefined ? mov.Amount : (mov.amount || 0));
                    const isIncome = rawType === "expense" ? false : rawType === "income" ? true : rawAmount >= 0;
                    const amount = Math.abs(rawAmount);
                    const description = mov.Description || mov.description || "Sin descripción";
                    const date = mov.Date || mov.date;
                    const category = mov.category_name || "Sin categoría";

                    return (
                      <tr key={mov.ID || mov.id || idx} className="hover:bg-[#f8f9fc]/50 transition-colors group">
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-[#8c8ca5]">
                          {formatDate(date)}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#1f1f35]">{description}</p>
                          <p className="text-xs text-[#8c8ca5] lg:hidden">{category}</p>
                        </td>
                        <td className="px-6 py-4 font-medium hidden lg:table-cell">
                          <span className="bg-[#f8f9fc] px-3 py-1 rounded-full text-xs border border-[#ece9f6]">
                            {category}
                          </span>
                        </td>
                        <td className={`whitespace-nowrap px-6 py-4 text-right font-bold text-[15px] ${isIncome ? 'text-green-500' : 'text-[#1f1f35]'}`}>
                          {isIncome ? '+ ' : '- '} {formatCurrency(amount)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Filter size={48} className="text-[#ece9f6] mb-4" />
                        <p className="font-bold text-[#1f1f35] text-lg">No encontramos resultados</p>
                        <p className="text-sm text-[#8c8ca5] mt-1">Prueba cambiando las fechas o los filtros de búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINACIÓN ESTRUCTURADA CORRECTAMENTE */}
        {!loading && movements.length > 0 && (
          <div className="mt-auto flex items-center justify-between border-t border-[#ece9f6] bg-[#f8f9fc] px-6 py-4">
            <p className="text-xs font-medium text-[#8c8ca5]">
              Mostrando página <span className="font-bold text-[#1f1f35]">{filters.page}</span> de <span className="font-bold text-[#1f1f35]">{totalPages}</span> ({totalRecords} movimientos)
            </p>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={filters.page === 1}
                className="rounded-lg border border-[#ece9f6] bg-white px-4 py-2 text-xs font-bold text-[#1f1f35] transition-colors hover:bg-[#f0edff] hover:text-[#5b38ff] disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#1f1f35]"
              >
                Anterior
              </button>
              <button
                onClick={handleNextPage}
                disabled={filters.page === totalPages || totalPages === 0}
                className="rounded-lg border border-[#ece9f6] bg-white px-4 py-2 text-xs font-bold text-[#1f1f35] transition-colors hover:bg-[#f0edff] hover:text-[#5b38ff] disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#1f1f35]"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}