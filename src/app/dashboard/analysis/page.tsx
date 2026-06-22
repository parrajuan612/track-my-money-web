"use client";

import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { List, Calendar, AlertCircle, Filter, ArrowDown, ArrowUp, Activity, Hash, CreditCard } from "lucide-react";
import { analysisService } from "@/services/analysis.service";
import { movementService } from "@/services/movement.service";

const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
const getLastDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

const COLORS = ["#5b38ff", "#a58cf6", "#00d084", "#ffb800", "#ff4d4d", "#00d9e1", "#ff7ac6", "#7a9cff", "#ff9d7a", "#7affb8", "#c87aff", "#ffc87a"];

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

export default function AnalysisPage() {
  const today = new Date();
  const [startDate, setStartDate] = useState(getFirstDayOfMonth(today));
  const [endDate, setEndDate] = useState(getLastDayOfMonth(today));
  const [activeRange, setActiveRange] = useState("este_mes");
  
  const [data, setData] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const [movements, setMovements] = useState<any[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5; 

  const [sortBy, setSortBy] = useState("date"); 
  const [sortOrder, setSortOrder] = useState("DESC"); 

  const [trendData, setTrendData] = useState<any[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);

  // 1. Cargar Resumen de la Dona
  const fetchAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const result = await analysisService.getCategoryDistribution(startDate, endDate);
      setData(result);
      setSelectedCategory(null);
      setPage(1); 
    } catch (error) {
      console.error("Error cargando análisis:", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [startDate, endDate]);

  // 2. Cargar Tabla Cruzada
  const fetchTableMovements = useCallback(async () => {
    setLoadingMovements(true);
    try {
      const filters: any = {
        start_date: startDate,
        end_date: endDate,
        type: "expense",
        page: page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      if (selectedCategory) {
        const catObj = CATEGORIES.find(c => c.name === selectedCategory.category_name);
        if (catObj) filters.category_id = catObj.id;
      }

      const result: any = await movementService.getMovements(filters);
      setMovements(result.data || []);
      
      if (result.meta && result.meta.total) {
        setTotalRecords(result.meta.total);
      } else {
        setTotalRecords(0);
      }
    } catch (error) {
      console.error("Error cargando tabla de movimientos:", error);
    } finally {
      setLoadingMovements(false);
    }
  }, [startDate, endDate, selectedCategory, page, sortBy, sortOrder]);

  useEffect(() => {
    fetchTableMovements();
  }, [fetchTableMovements]);

  // 3. Cargar Gráfico de Tendencias Real (OPTIMIZADO PARA UX)
  const fetchTrends = useCallback(async () => {
    setLoadingTrends(true);
    try {
      let catId = undefined;
      if (selectedCategory) {
        const catObj = CATEGORIES.find(c => c.name === selectedCategory.category_name);
        if (catObj) catId = catObj.id;
      }

      const result = await analysisService.getExpenseTrends(startDate, endDate, catId);
      
      const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

      let formattedTrends: any[] = [];

      if (diffDays <= 35) {
        formattedTrends = (result || []).map((item: any) => {
          const rawDate = item.name || item.Name || item.date || item.Date;
          if (!rawDate) return { ...item, xLabel: "-", tooltipLabel: "Sin fecha" };
          const d = new Date(rawDate + 'T00:00:00');
          if (isNaN(d.getTime())) return { ...item, xLabel: "-", tooltipLabel: rawDate };
          
          return {
            ...item,
            // xLabel: Solo el número del día (Ej: "15") para que no se apriete el eje X
            xLabel: d.getDate().toString(), 
            // tooltipLabel: La fecha bonita para la caja negra (Ej: "15 may")
            tooltipLabel: d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) 
          };
        });
      } else {
        const monthlyData: { [key: string]: { amount: number, label: string, shortLabel: string } } = {};
        
        (result || []).forEach((item: any) => {
          const rawDate = item.name || item.Name || item.date || item.Date;
          if (!rawDate) return;
          const d = new Date(rawDate + 'T00:00:00');
          if (isNaN(d.getTime())) return;

          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          const monthLabel = d.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' });
          const shortLabel = d.toLocaleDateString('es-CO', { month: 'short' });

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { amount: 0, label: monthLabel, shortLabel: shortLabel };
          }
          
          monthlyData[monthKey].amount += Number(item.amount || item.Amount || 0);
        });

        formattedTrends = Object.keys(monthlyData)
          .sort()
          .map(key => ({
            name: key,
            // xLabel: Mes abreviado (Ej: "May") para el eje X
            xLabel: monthlyData[key].shortLabel.charAt(0).toUpperCase() + monthlyData[key].shortLabel.slice(1), 
            // tooltipLabel: Mes y año (Ej: "May 2026") para la caja negra
            tooltipLabel: monthlyData[key].label.charAt(0).toUpperCase() + monthlyData[key].label.slice(1),
            amount: monthlyData[key].amount
          }));
      }

      setTrendData(formattedTrends);
    } catch (error) {
      console.error("Error cargando tendencias:", error);
      setTrendData([]);
    } finally {
      setLoadingTrends(false);
    }
  }, [startDate, endDate, selectedCategory]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);


  const handleQuickRange = (range: string) => {
    setActiveRange(range);
    const now = new Date();
    if (range === "este_mes") {
      setStartDate(getFirstDayOfMonth(now)); setEndDate(getLastDayOfMonth(now));
    } else if (range === "mes_anterior") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      setStartDate(getFirstDayOfMonth(lastMonth)); setEndDate(getLastDayOfMonth(lastMonth));
    } else if (range === "ultimos_3_meses") {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      setStartDate(getFirstDayOfMonth(threeMonthsAgo)); setEndDate(getLastDayOfMonth(now));
    } else if (range === "este_ano") {
      const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
      setStartDate(getFirstDayOfMonth(firstDayOfYear)); setEndDate(getLastDayOfMonth(now));
    }
  };

  const handleSort = (column: string) => {
    if (sortBy === column) setSortOrder(prev => prev === "DESC" ? "ASC" : "DESC");
    else { setSortBy(column); setSortOrder("DESC"); }
    setPage(1); 
  };

  const totalPages = Math.ceil(totalRecords / pageSize);

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-[#ece9f6] bg-white p-4 shadow-lg outline-none">
          <p className="mb-1 font-bold text-[#1f1f35]">{payload[0].name}</p>
          <p className="text-sm font-medium text-[#5b38ff]">{formatCurrency(payload[0].value)}</p>
          <p className="text-xs text-[#8c8ca5]">{payload[0].payload.percentage?.toFixed(1)}% del total</p>
        </div>
      );
    }
    return null;
  };

  // TOOLTIP DE BARRAS ACTUALIZADO PARA LEER tooltipLabel
  const BarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-[#ece9f6] bg-[#1f1f35] p-3 shadow-lg outline-none text-white">
          <p className="mb-1 font-bold text-xs text-white/70 uppercase tracking-wider">{data.tooltipLabel}</p>
          <p className="text-sm font-extrabold text-[#5b38ff]">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const validCategories = data?.categories || [];
  const currentTotalBase = selectedCategory ? selectedCategory.amount : (data?.total_expenses || 0);

  const diffTime = Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  const averagePerDay = currentTotalBase / diffDays;

  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto pb-10">
      
      {/* 1. CABECERA */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1f1f35]">Análisis de Gastos</h1>
        <p className="text-sm text-[#8c8ca5]">Audita tus movimientos y descubre patrones de gasto.</p>
      </div>

      {/* 2. MOTOR DEL TIEMPO */}
      <div className="rounded-[24px] border border-[#ece9f6] bg-white p-4 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => handleQuickRange("este_mes")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeRange === "este_mes" ? "bg-[#5b38ff] text-white" : "bg-[#f8f9fc] text-[#8c8ca5] hover:bg-[#ece9f6]"}`}>Este mes</button>
          <button onClick={() => handleQuickRange("mes_anterior")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeRange === "mes_anterior" ? "bg-[#5b38ff] text-white" : "bg-[#f8f9fc] text-[#8c8ca5] hover:bg-[#ece9f6]"}`}>Mes anterior</button>
          <button onClick={() => handleQuickRange("ultimos_3_meses")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeRange === "ultimos_3_meses" ? "bg-[#5b38ff] text-white" : "bg-[#f8f9fc] text-[#8c8ca5] hover:bg-[#ece9f6]"}`}>Últimos 3 meses</button>
          <button onClick={() => handleQuickRange("este_ano")} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${activeRange === "este_ano" ? "bg-[#5b38ff] text-white" : "bg-[#f8f9fc] text-[#8c8ca5] hover:bg-[#ece9f6]"}`}>Este año</button>
        </div>
        <div className="flex items-center gap-2 bg-[#f8f9fc] p-1.5 rounded-2xl border border-[#ece9f6]">
          <Calendar size={16} className="text-[#b5b5c3] ml-2" />
          <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setActiveRange("manual"); }} className="rounded-xl border-none bg-transparent p-2 text-xs font-bold text-[#1f1f35] outline-none cursor-pointer" />
          <span className="text-[#8c8ca5] font-bold text-xs">-</span>
          <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setActiveRange("manual"); }} className="rounded-xl border-none bg-transparent p-2 text-xs font-bold text-[#1f1f35] outline-none cursor-pointer" />
        </div>
      </div>

      {/* 3. ZONA SUPERIOR: GRÁFICOS Y RESUMEN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DONA INTERACTIVA */}
        <div className="rounded-[24px] border border-[#ece9f6] bg-white p-6 shadow-sm min-h-[400px] flex flex-col relative">
          <h3 className="text-lg font-extrabold text-[#1f1f35] mb-2">Distribución</h3>
          
          {loadingAnalysis ? (
             <div className="flex-1 flex items-center justify-center">
               <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#5b38ff] border-t-transparent"></div>
             </div>
          ) : validCategories.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-[#8c8ca5]">
               <AlertCircle size={40} className="mb-2 text-[#ece9f6]" />
               <p className="text-sm font-medium">No hay gastos en este periodo</p>
             </div>
          ) : (
<div className="flex-1 flex flex-col">
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={validCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="amount"
                      nameKey="category_name"
                      onClick={(data) => {
                        if (selectedCategory?.category_name === data.payload.category_name) setSelectedCategory(null); 
                        else setSelectedCategory(data.payload);
                        setPage(1); 
                      }}
                      className="cursor-pointer"
                    >
                      {validCategories.map((entry: any, index: number) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]}
                          opacity={!selectedCategory || selectedCategory.category_name === entry.category_name ? 1 : 0.3} 
                          className="transition-opacity duration-300 outline-none hover:opacity-100"
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* LEYENDA DETALLADA (Igual a la del Dashboard inicial) */}
              <div className="mt-4 mb-4 grid grid-cols-2 gap-3 overflow-y-auto max-h-[160px] pr-2">
                {validCategories.map((category: any, index: number) => {
                  // Verificamos si esta categoría es la que está seleccionada
                  const isSelected = selectedCategory?.category_name === category.category_name;
                  const isOpacated = selectedCategory && !isSelected;

                  return (
                    <div 
                      key={category.category_name} 
                      onClick={() => {
                        if (isSelected) setSelectedCategory(null);
                        else setSelectedCategory(category);
                        setPage(1);
                      }}
                      className={`flex items-center gap-2 cursor-pointer transition-opacity duration-300 hover:opacity-100 ${isOpacated ? 'opacity-30' : 'opacity-100'}`}
                    >
                      <div 
                        className="h-3 w-3 rounded-full shrink-0" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-xs font-bold text-[#1f1f35]" title={category.category_name}>
                          {category.category_name}
                        </span>
                        <span className="text-xs text-[#8c8ca5]">
                          {category.percentage?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-auto pt-4 border-t border-[#ece9f6] text-center">
                <p className="text-xs font-bold text-[#8c8ca5] uppercase tracking-wider">Total Gastado</p>
                <p className="text-xl font-extrabold text-[#ff4d4d]">{formatCurrency(data?.total_expenses || 0)}</p>
              </div>
            </div>
          )}
        </div>

        {/* FASE 5: TENDENCIAS REALES */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-[24px] bg-[#5b38ff] p-5 shadow-lg shadow-[#5b38ff]/20 text-white flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 text-white/80">
                <CreditCard size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Total Seleccionado</span>
              </div>
              <h3 className="text-2xl font-extrabold">{formatCurrency(currentTotalBase)}</h3>
            </div>

            <div className="rounded-[24px] border border-[#ece9f6] bg-white p-5 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 text-[#8c8ca5]">
                <Activity size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Promedio Diario</span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#1f1f35]">{formatCurrency(currentTotalBase === 0 ? 0 : averagePerDay)}</h3>
            </div>

            <div className="rounded-[24px] border border-[#ece9f6] bg-white p-5 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2 text-[#8c8ca5]">
                <Hash size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Transacciones</span>
              </div>
              <h3 className="text-2xl font-extrabold text-[#1f1f35]">{loadingMovements ? "-" : totalRecords}</h3>
            </div>
          </div>

          <div className="rounded-[24px] border border-[#ece9f6] bg-white p-6 shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-[#1f1f35]">
                {selectedCategory ? `Tendencia: ${selectedCategory.category_name}` : 'Tendencia: Todas las categorías'}
              </h3>
              {selectedCategory && (
                <button 
                  onClick={() => { setSelectedCategory(null); setPage(1); }}
                  className="text-xs font-bold text-[#5b38ff] bg-[#f0edff] px-3 py-1.5 rounded-lg hover:bg-[#e4dfff] transition-colors"
                >
                  Ver todas
                </button>
              )}
            </div>
            
            <div className="flex-1 w-full min-h-[200px]">
              {loadingTrends ? (
                <div className="h-full flex items-center justify-center text-[#8c8ca5] animate-pulse">Calculando tendencias...</div>
              ) : trendData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[#8c8ca5] text-sm">Sin datos para graficar</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ece9f6" />
                    {/* EJE X ACTUALIZADO: Usa xLabel en lugar de shortDate */}
                    <XAxis dataKey="xLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8c8ca5', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8c8ca5' }} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                    <RechartsTooltip cursor={{fill: '#f8f9fc'}} content={<BarTooltip />} />
                    <Bar dataKey="amount" fill="#5b38ff" radius={[6, 6, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. ZONA INFERIOR: TABLA DE DETALLE */}
      <div className="rounded-[24px] border border-[#ece9f6] bg-white shadow-sm overflow-hidden flex flex-col min-h-[300px]">
        <div className="p-6 border-b border-[#ece9f6] flex justify-between items-center bg-[#f8f9fc]/50">
          <h3 className="text-lg font-extrabold text-[#1f1f35]">
            Mayores Gastos: <span className="text-[#5b38ff]">{selectedCategory ? selectedCategory.category_name : 'Panorama General'}</span>
          </h3>
        </div>

        {loadingMovements ? (
          <div className="flex flex-col items-center justify-center p-14 text-[#8c8ca5] flex-1">
             <div className="h-6 w-6 animate-spin rounded-full border-4 border-[#5b38ff] border-t-transparent mb-3"></div>
             <p className="text-sm font-medium">Cargando detalles...</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm text-[#8c8ca5]">
              <thead className="border-b border-[#ece9f6] bg-white text-[11px] font-extrabold uppercase tracking-wider text-[#b5b5c3]">
                <tr>
                  <th className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors group" onClick={() => handleSort("date")}>
                    <div className="flex items-center gap-1">
                      Fecha {sortBy === "date" ? (sortOrder === "DESC" ? <ArrowDown size={14} className="text-[#5b38ff]"/> : <ArrowUp size={14} className="text-[#5b38ff]"/>) : <ArrowDown size={14} className="opacity-0 group-hover:opacity-100"/>}
                    </div>
                  </th>
                  <th className="px-6 py-4">Descripción</th>
                  <th className="px-6 py-4 hidden md:table-cell w-1/4">Impacto</th>
                  <th className="px-6 py-4 text-right cursor-pointer hover:bg-gray-50 transition-colors group flex justify-end" onClick={() => handleSort("amount")}>
                    <div className="flex items-center gap-1">
                      {sortBy === "amount" ? (sortOrder === "DESC" ? <ArrowDown size={14} className="text-[#5b38ff]"/> : <ArrowUp size={14} className="text-[#5b38ff]"/>) : <ArrowDown size={14} className="opacity-0 group-hover:opacity-100"/>} Monto
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ece9f6]">
                {movements.length > 0 ? (
                  movements.map((mov, idx) => {
                    const amount = Math.abs(mov.Amount || mov.amount || 0);
                    const description = mov.Description || mov.description || "Sin descripción";
                    const date = mov.Date || mov.date;
                    const impactPercentage = currentTotalBase > 0 ? (amount / currentTotalBase) * 100 : 0;

                    return (
                      <tr key={mov.ID || mov.id || idx} className="hover:bg-[#f8f9fc]/50 transition-colors">
                        <td className="whitespace-nowrap px-6 py-3 font-medium text-[#8c8ca5]">{formatDate(date)}</td>
                        <td className="px-6 py-3"><p className="font-bold text-[#1f1f35]">{description}</p></td>
                        <td className="px-6 py-3 hidden md:table-cell align-middle">
                          <div className="w-full flex items-center gap-2">
                            <div className="h-2 w-full bg-[#f0edff] rounded-full overflow-hidden">
                              <div className="h-full bg-[#ff4d4d] rounded-full transition-all duration-500" style={{ width: `${Math.min(impactPercentage, 100)}%` }} />
                            </div>
                            <span className="text-[10px] font-bold text-[#8c8ca5] w-10 text-right">{impactPercentage.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-3 text-right font-bold text-[15px] text-[#ff4d4d]">
                          {formatCurrency(amount)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-14 text-center">
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
        )}

        {!loadingMovements && movements.length > 0 && (
          <div className="mt-auto flex items-center justify-between border-t border-[#ece9f6] bg-white px-6 py-4">
            <p className="text-xs font-medium text-[#8c8ca5]">Página <span className="font-bold text-[#1f1f35]">{page}</span> de <span className="font-bold text-[#1f1f35]">{totalPages || 1}</span> ({totalRecords} reg.)</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg border border-[#ece9f6] bg-[#f8f9fc] px-3 py-1.5 text-xs font-bold text-[#1f1f35] hover:bg-[#f0edff] hover:text-[#5b38ff] disabled:opacity-50">Anterior</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} className="rounded-lg border border-[#ece9f6] bg-[#f8f9fc] px-3 py-1.5 text-xs font-bold text-[#1f1f35] hover:bg-[#f0edff] hover:text-[#5b38ff] disabled:opacity-50">Siguiente</button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}