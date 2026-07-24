"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Calendar, Filter, RefreshCw, Edit2, X, Trash2, Landmark } from "lucide-react";
import { movementService } from "@/services/movement.service";
import { accountService, Account } from "@/services/account.service";

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "Sin fecha";
  return new Date(dateString).toLocaleDateString("es-CO", { year: 'numeric', month: 'short', day: '2-digit' });
};

export default function MovementsPage() {
  // --- ESTADOS DE LA TABLA Y FILTROS ---
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // --- ESTADOS DE CUENTAS (Para el selector) ---
  const [accounts, setAccounts] = useState<Account[]>([]);

  // Filtros
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // --- ESTADOS DE EDICIÓN ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMov, setEditingMov] = useState<any>(null);

  // --- ESTADOS DE CREACIÓN ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newMov, setNewMov] = useState({
    date: new Date().toISOString().split('T')[0],
    account_id: "", // ¡NUEVO CAMPO!
    description: "",
    amount: "",
    type: "expense",
    category_id: 12
  });

  // 1. Cargar la tabla y las cuentas
  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const filters: any = { page, page_size: 10 };
      if (search) filters.search = search;
      if (startDate) filters.start_date = startDate;
      if (endDate) filters.end_date = endDate;
      if (type) filters.type = type;
      if (categoryId) filters.category_id = categoryId;

      const result: any = await movementService.getMovements(filters);
      setMovements(result.data || []);
      
      if (result.meta && result.meta.total) {
        setTotalPages(Math.ceil(result.meta.total / 10));
      }
    } catch (error) {
      console.error("Error cargando movimientos:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, startDate, endDate, type, categoryId]);

  // Cargar cuentas solo una vez al montar el componente
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data || []);
      } catch (error) {
        console.error("Error cargando cuentas:", error);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  // 2. Limpiar filtros
  const handleClearFilters = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setType("");
    setCategoryId("");
    setPage(1);
  };

  // 3. Abrir modal de Edición
  const handleEditClick = (mov: any) => {
    const catObj = CATEGORIES.find(c => c.name === mov.category_name);
    
    setEditingMov({
      id: mov.ID || mov.id,
      date: mov.Date || mov.date,
      description: mov.Description || mov.description,
      amount: Math.abs(mov.Amount || mov.amount),
      type: mov.Type || mov.type || 'expense',
      category_id: catObj ? catObj.id : 12
    });
    setIsEditModalOpen(true);
  };

  // 4. Guardar Edición
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await movementService.updateMovement(editingMov.id, {
        description: editingMov.description,
        amount: Number(editingMov.amount),
        type: editingMov.type,
        category_id: Number(editingMov.category_id)
      });
      
      setIsEditModalOpen(false);
      fetchMovements(); 
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Hubo un error al actualizar el movimiento.");
    }
  };

  // 5. Guardar Nuevo Movimiento
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMov.account_id) {
      alert("Por favor selecciona una cuenta bancaria.");
      return;
    }

    try {
      await movementService.createMovement({
        date: newMov.date,
        account_id: newMov.account_id, // Enviamos el ID de la cuenta elegida
        description: newMov.description,
        amount: Number(newMov.amount),
        type: newMov.type,
        category_id: Number(newMov.category_id)
      });
      
      setIsCreateModalOpen(false);
      setNewMov({ date: new Date().toISOString().split('T')[0], account_id: "", description: "", amount: "", type: "expense", category_id: 12 });
      fetchMovements(); 
    } catch (error) {
      console.error("Error al crear:", error);
      alert("Hubo un error al crear el movimiento.");
    }
  };

  // 6. Función para eliminar
  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este movimiento? Esta acción no se puede deshacer.")) {
      try {
        await movementService.deleteMovement(id);
        fetchMovements(); 
      } catch (error) {
        console.error("Error al eliminar:", error);
        alert("Hubo un error al eliminar el movimiento.");
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-10">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1f1f35]">Historial de Movimientos</h1>
          <p className="text-sm text-[#8c8ca5]">Filtra, busca y audita tus finanzas a detalle.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleClearFilters}
            className="flex items-center gap-2 rounded-xl bg-[#f8f9fc] px-4 py-2 text-sm font-bold text-[#8c8ca5] hover:bg-[#ece9f6] transition-colors"
          >
            <RefreshCw size={16} />
            Limpiar Filtros
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#5b38ff] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#5b38ff]/20 hover:bg-[#4524db] transition-all"
          >
            <span className="text-lg leading-none">+</span>
            Nuevo Movimiento
          </button>
        </div>
      </div>

      {/* CAJA DE FILTROS */}
      <div className="rounded-[24px] border border-[#ece9f6] bg-white p-6 shadow-sm flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Buscar Descripción</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5c3]" />
            <input 
              type="text" 
              placeholder="Ej: Netflix, Uber, Restaurante..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#ece9f6] bg-[#f8f9fc] p-3 pl-10 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Desde</label>
            <div className="relative">
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5b5c3] pointer-events-none" />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff]" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Hasta</label>
            <div className="relative">
              <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#b5b5c3] pointer-events-none" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff]" />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Tipo de Flujo</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff]">
              <option value="">Todos los movimientos</option>
              <option value="expense">Gastos</option>
              <option value="income">Ingresos</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Categoría</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff]">
              <option value="">Todas las categorías</option>
              {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* TABLA DE RESULTADOS */}
      <div className="rounded-[24px] border border-[#ece9f6] bg-white shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-[#8c8ca5]">
            <thead className="border-b border-[#ece9f6] bg-[#f8f9fc]/50 text-[11px] font-extrabold uppercase tracking-wider text-[#b5b5c3]">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Descripción</th>
                <th className="px-6 py-4 hidden sm:table-cell">Categoría</th>
                <th className="px-6 py-4 text-right">Monto</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ece9f6]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="flex justify-center"><div className="h-6 w-6 animate-spin rounded-full border-4 border-[#5b38ff] border-t-transparent"></div></div>
                  </td>
                </tr>
              ) : movements.length > 0 ? (
                movements.map((mov, idx) => {
                  const amount = Math.abs(mov.Amount || mov.amount || 0);
                  const isExpense = (mov.Type || mov.type) === 'expense';
                  
                  return (
                    <tr key={mov.ID || mov.id || idx} className="hover:bg-[#f8f9fc]/50 transition-colors group">
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-[#8c8ca5]">{formatDate(mov.Date || mov.date)}</td>
                      <td className="px-6 py-4"><p className="font-bold text-[#1f1f35]">{mov.Description || mov.description}</p></td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="bg-[#f8f9fc] px-3 py-1 rounded-full text-xs border border-[#ece9f6] font-medium text-[#8c8ca5]">
                          {mov.category_name || "Sin categoría"}
                        </span>
                      </td>
                      <td className={`whitespace-nowrap px-6 py-4 text-right font-bold text-[15px] ${isExpense ? 'text-[#ff4d4d]' : 'text-[#00d084]'}`}>
                        {isExpense ? '- ' : '+ '}{formatCurrency(amount)}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(mov)}
                            className="text-[#b5b5c3] hover:text-[#5b38ff] transition-colors p-2 rounded-lg hover:bg-[#f0edff] opacity-50 group-hover:opacity-100"
                            title="Editar movimiento"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(mov.ID || mov.id)}
                            className="text-[#b5b5c3] hover:text-[#ff4d4d] transition-colors p-2 rounded-lg hover:bg-[#ffe5e5] opacity-50 group-hover:opacity-100"
                            title="Eliminar movimiento"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-14 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Filter size={32} className="text-[#ece9f6] mb-3" />
                      <p className="font-bold text-[#1f1f35]">No hay movimientos</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && movements.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#ece9f6] bg-white px-6 py-4">
            <p className="text-xs font-medium text-[#8c8ca5]">Página <span className="font-bold text-[#1f1f35]">{page}</span> de <span className="font-bold text-[#1f1f35]">{totalPages || 1}</span></p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-[#ece9f6] bg-[#f8f9fc] px-3 py-1.5 text-xs font-bold text-[#1f1f35] hover:bg-[#f0edff] hover:text-[#5b38ff] disabled:opacity-50">Anterior</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="rounded-lg border border-[#ece9f6] bg-[#f8f9fc] px-3 py-1.5 text-xs font-bold text-[#1f1f35] hover:bg-[#f0edff] hover:text-[#5b38ff] disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL DE EDICIÓN FLOTANTE --- */}
      {/* ... (Se mantiene igual que antes) ... */}
      {isEditModalOpen && editingMov && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1f35]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#1f1f35]">Editar Movimiento</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="rounded-full p-2 text-[#8c8ca5] hover:bg-[#f8f9fc] hover:text-[#ff4d4d] transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Fecha (No editable)</label>
                <input 
                  type="date" 
                  value={editingMov.date ? editingMov.date.split('T')[0] : ''} 
                  disabled 
                  className="w-full rounded-xl border border-[#ece9f6] bg-[#f8f9fc] p-3 text-sm font-medium text-[#b5b5c3] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Descripción</label>
                <input 
                  type="text" 
                  required
                  value={editingMov.description} 
                  onChange={(e) => setEditingMov({...editingMov, description: e.target.value})}
                  className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-bold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Tipo</label>
                  <select 
                    value={editingMov.type} 
                    onChange={(e) => setEditingMov({...editingMov, type: e.target.value})}
                    className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-bold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                  >
                    <option value="expense">Gasto</option>
                    <option value="income">Ingreso</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Categoría</label>
                  <select 
                    value={editingMov.category_id} 
                    onChange={(e) => setEditingMov({...editingMov, category_id: Number(e.target.value)})}
                    className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-bold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Monto</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#b5b5c3]">$</span>
                  <input 
                    type="number" 
                    required
                    min="0.01"
                    step="any"
                    value={editingMov.amount} 
                    onChange={(e) => setEditingMov({...editingMov, amount: e.target.value})}
                    className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 pl-8 text-lg font-extrabold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#ece9f6]">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="rounded-xl px-4 py-2 text-sm font-bold text-[#8c8ca5] hover:bg-[#f8f9fc] hover:text-[#1f1f35] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="rounded-xl bg-[#5b38ff] px-6 py-2 text-sm font-bold text-white shadow-md shadow-[#5b38ff]/20 hover:bg-[#4524db] transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE CREACIÓN FLOTANTE --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1f35]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#1f1f35]">Nuevo Movimiento</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="rounded-full p-2 text-[#8c8ca5] hover:bg-[#f8f9fc] hover:text-[#ff4d4d] transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Fecha</label>
                  <input 
                    type="date" 
                    required
                    value={newMov.date} 
                    onChange={(e) => setNewMov({...newMov, date: e.target.value})}
                    className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                  />
                </div>
              </div>

              {/* ¡NUEVO SELECTOR DE CUENTAS! */}
              <div>
                <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Cuenta Destino / Origen</label>
                <div className="relative">
                  <Landmark size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5c3]" />
                  <select 
                    required
                    value={newMov.account_id} 
                    onChange={(e) => setNewMov({...newMov, account_id: e.target.value})}
                    className="w-full appearance-none rounded-xl border border-[#ece9f6] bg-white p-3 pl-10 text-sm font-bold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                  >
                    <option value="" disabled>Selecciona una cuenta</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.bank?.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Descripción</label>
                <input 
                  type="text" 
                  required
                  value={newMov.description} 
                  onChange={(e) => setNewMov({...newMov, description: e.target.value})}
                  className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-bold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Tipo</label>
                  <select 
                    value={newMov.type} 
                    onChange={(e) => setNewMov({...newMov, type: e.target.value})}
                    className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-bold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                  >
                    <option value="expense">Gasto</option>
                    <option value="income">Ingreso</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Categoría</label>
                  <select 
                    value={newMov.category_id} 
                    onChange={(e) => setNewMov({...newMov, category_id: Number(e.target.value)})}
                    className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 text-sm font-bold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Monto</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-[#b5b5c3]">$</span>
                  <input 
                    type="number" 
                    required
                    min="0.01"
                    step="any"
                    value={newMov.amount} 
                    onChange={(e) => setNewMov({...newMov, amount: e.target.value})}
                    className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 pl-8 text-lg font-extrabold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#ece9f6]">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)} 
                  className="rounded-xl px-4 py-2 text-sm font-bold text-[#8c8ca5] hover:bg-[#f8f9fc] hover:text-[#1f1f35] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="rounded-xl bg-[#5b38ff] px-6 py-2 text-sm font-bold text-white shadow-md shadow-[#5b38ff]/20 hover:bg-[#4524db] transition-all"
                >
                  Crear Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}