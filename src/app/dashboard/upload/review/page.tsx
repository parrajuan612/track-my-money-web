"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Save, AlertCircle } from "lucide-react";
import { statementService } from "@/services/statement.service";

// Como aún no tenemos el endpoint de categorías, simulamos las de tu base de datos (según tu JSON)
const CATEGORIES_DB = [
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

export default function ReviewImportPage() {
  const router = useRouter();
  
  const [movements, setMovements] = useState<any[]>([]);
  const [metadata, setMetadata] = useState<{ periodMonth: string; fileName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. Cargar datos de la memoria al entrar a la página
  useEffect(() => {
    const storedData = sessionStorage.getItem("parsedStatement");
    if (!storedData) {
      // Si no hay datos (ej. entró directo a la URL), lo devolvemos al dashboard
      router.push("/dashboard");
      return;
    }

    try {
      const parsed = JSON.parse(storedData);
      setMovements(parsed.data || []);
      setMetadata({
        periodMonth: parsed.period_month,
        fileName: parsed.file_name,
      });
    } catch (error) {
      console.error("Error leyendo datos:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 2. Función para eliminar una fila
  const handleDelete = (idToRemove: string) => {
    setMovements(movements.filter((mov) => mov.id !== idToRemove));
  };

  // 3. Función para cambiar la categoría de una fila
  const handleCategoryChange = (movementId: string, newCategoryId: number) => {
    setMovements(movements.map(mov => {
      if (mov.id === movementId) {
        // Buscamos el nombre de la nueva categoría seleccionada
        const newCat = CATEGORIES_DB.find(c => c.id === newCategoryId);
        return { ...mov, category_id: newCategoryId, category_name: newCat?.name || "" };
      }
      return mov;
    }));
  };

  // 4. Formateadores
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 2 }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("es-CO", { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(dateString));
  };

  // 5. Función para Guardar en la DB
const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Armamos el payload exacto que pide Go (SaveStatementRequest)
const payload = {
        period_month: metadata?.periodMonth || "",
        file_name: metadata?.fileName || "",
        movements: movements.map(mov => ({
          date: mov.date,
          description: mov.description,
          
          category_id: (mov.category_id && mov.category_id > 0) ? Number(mov.category_id) : 12, 

          amount: Number(mov.amount),
          type: mov.type
        }))
      };

      console.log("Datos enviados a Go:", payload);
      
      // 2. Llamamos al endpoint
      await statementService.saveStatement(payload);

      // 3. Limpiamos la memoria temporal
      sessionStorage.removeItem("parsedStatement");
      
      // 4. Redirigimos al dashboard (¡donde se verán reflejados los nuevos datos!)
      router.push("/dashboard");
      
    } catch (error) {
      console.error("Error guardando:", error);
      alert("Hubo un error al guardar los movimientos en la base de datos.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#8c8ca5]">Cargando movimientos...</div>;

  return (
    <div className="mx-auto max-w-5xl pb-20">
      
      {/* Header Superior */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              sessionStorage.removeItem("parsedStatement");
              router.push("/dashboard");
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#1f1f35] shadow-sm hover:bg-[#f8f9fc] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-[#1f1f35]">Revisar Movimientos</h1>
            <p className="text-sm text-[#8c8ca5]">Archivo: {metadata?.fileName}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || movements.length === 0}
          className="flex items-center gap-2 rounded-xl bg-[#5b38ff] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-[#4620ff] disabled:opacity-50 transition-all"
        >
          <Save size={18} />
          {saving ? "Guardando..." : `Guardar ${movements.length} Movimientos`}
        </button>
      </div>

      {/* Tabla Interactiva */}
      <div className="rounded-[24px] border border-[#ece9f6] bg-white shadow-sm overflow-hidden">
        
        {movements.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <AlertCircle size={40} className="text-[#b5b5c3] mb-4" />
            <p className="font-bold text-[#1f1f35]">No hay movimientos para guardar</p>
            <p className="text-sm text-[#8c8ca5] mb-4">Has eliminado todos los registros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fc] text-[#8c8ca5] border-b border-[#ece9f6]">
                <tr>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Fecha</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Descripción</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs">Categoría</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-right">Monto</th>
                  <th className="px-6 py-4 font-bold uppercase tracking-wider text-xs text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece9f6]">
{movements.map((mov) => {
    const isIncome = mov.type === "income" || mov.amount > 0;
    return (
      <tr key={mov.id} className="hover:bg-[#f8f9fc]/50 transition-colors group">
                      {/* Fecha */}
                      <td className="px-6 py-4 whitespace-nowrap text-[#8c8ca5] font-medium">
                        {formatDate(mov.date)}
                      </td>
                      
                      {/* Descripción (Input editable si lo deseas, por ahora solo texto) */}
                      <td className="px-6 py-4 font-bold text-[#1f1f35]">
                        {mov.description}
                      </td>

                      {/* Select de Categoría */}
                      <td className="px-6 py-4">
                        <select
                          value={mov.category_id}
                          onChange={(e) => handleCategoryChange(mov.id, Number(e.target.value))}
                          className="w-full appearance-none rounded-lg border border-[#ece9f6] bg-white px-3 py-2 text-sm font-medium text-[#1f1f35] outline-none focus:border-[#5b38ff] focus:ring-1 focus:ring-[#5b38ff] cursor-pointer"
                        >
                          {CATEGORIES_DB.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </td>

                      {/* Monto */}
                      <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${isIncome ? "text-green-500" : "text-[#1f1f35]"}`}>
                        {isIncome ? "+ " : "- "}{formatCurrency(Math.abs(mov.amount))}
                      </td>

                      {/* Botón Eliminar */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(mov.id)}
                          className="text-[#b5b5c3] hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Eliminar registro"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}