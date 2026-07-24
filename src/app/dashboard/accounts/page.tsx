"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Landmark, CreditCard, Building2 } from "lucide-react";
import { accountService, Bank, Account } from "@/services/account.service";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ bank_id: "", name: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [accountsData, banksData] = await Promise.all([
        accountService.getAccounts(),
        accountService.getBanks()
      ]);
      setAccounts(accountsData || []);
      setBanks(banksData || []);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await accountService.createAccount({
        bank_id: Number(newAccount.bank_id),
        name: newAccount.name
      });
      setIsModalOpen(false);
      setNewAccount({ bank_id: "", name: "" }); // Limpiar formulario
      fetchData(); // Recargar cuentas
    } catch (error) {
      console.error("Error creando cuenta:", error);
      alert("No se pudo crear la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para darle estilo visual según el banco
  const getBankStyle = (bankName: string = "") => {
    const name = bankName.toLowerCase();
    if (name.includes("nu")) return "bg-[#8A05BE] text-white"; // Morado Nubank
    if (name.includes("bancolombia")) return "bg-[#FBDD18] text-[#2c2a29]"; // Amarillo Bancolombia
    return "bg-[#f8f9fc] text-[#1f1f35] border border-[#ece9f6]"; // Por defecto
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-10">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1f1f35]">Mis Cuentas Bancarias</h1>
          <p className="text-sm text-[#8c8ca5]">Administra tus productos financieros y billeteras.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#5b38ff] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#5b38ff]/20 hover:bg-[#4524db] transition-all"
        >
          <Plus size={18} />
          Vincular Cuenta
        </button>
      </div>

      {/* GRID DE CUENTAS */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5b38ff] border-t-transparent"></div>
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((acc) => {
            const bankStyle = getBankStyle(acc.bank?.name);
            return (
              <div key={acc.id} className="rounded-[24px] bg-white border border-[#ece9f6] p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-[180px]">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-2xl ${bankStyle}`}>
                    <Building2 size={24} />
                  </div>
                  <span className="bg-[#f8f9fc] text-[#8c8ca5] text-xs font-bold px-3 py-1 rounded-full">
                    Activa
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#8c8ca5] uppercase tracking-wider mb-1">
                    {acc.bank?.name || "Banco Desconocido"}
                  </p>
                  <h3 className="text-xl font-extrabold text-[#1f1f35] truncate">
                    {acc.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[#b5b5c3] bg-[#f8f9fc]/50 p-12 text-center flex flex-col items-center justify-center">
          <Landmark size={48} className="text-[#b5b5c3] mb-4" />
          <h3 className="text-lg font-bold text-[#1f1f35] mb-2">No tienes cuentas vinculadas</h3>
          <p className="text-[#8c8ca5] text-sm max-w-md">
            Agrega tu primera cuenta de Bancolombia o Nubank para empezar a organizar tus movimientos.
          </p>
        </div>
      )}

      {/* MODAL DE CREACIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f1f35]/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-[#1f1f35]">Nueva Cuenta</h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-2 text-[#8c8ca5] hover:bg-[#f8f9fc] hover:text-[#ff4d4d] transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-5">
              
              {/* SELECT DE BANCOS */}
              <div>
                <label className="mb-2 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Institución Financiera</label>
                <div className="relative">
                  <Landmark size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5c3]" />
                  <select 
                    required
                    value={newAccount.bank_id} 
                    onChange={(e) => setNewAccount({...newAccount, bank_id: e.target.value})}
                    className="w-full appearance-none rounded-xl border border-[#ece9f6] bg-white p-3 pl-10 text-sm font-bold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Selecciona un banco...</option>
                    {banks.map(bank => (
                      <option key={bank.id} value={bank.id}>{bank.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* NOMBRE PERSONALIZADO */}
              <div>
                <label className="mb-2 block text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Nombre de la cuenta</label>
                <div className="relative">
                  <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b5b5c3]" />
                  <input 
                    type="text" 
                    required
                    placeholder="Ej: Tarjeta de Crédito, Cuenta Nómina..."
                    value={newAccount.name} 
                    onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    className="w-full rounded-xl border border-[#ece9f6] bg-white p-3 pl-10 text-sm font-bold text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-2 focus:ring-[#5b38ff]/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#ece9f6] mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="rounded-xl px-4 py-2 text-sm font-bold text-[#8c8ca5] hover:bg-[#f8f9fc] hover:text-[#1f1f35] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="rounded-xl bg-[#5b38ff] px-6 py-2 text-sm font-bold text-white shadow-md shadow-[#5b38ff]/20 hover:bg-[#4524db] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}