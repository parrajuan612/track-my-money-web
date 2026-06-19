import { api } from "./api";

// 1. Definimos la estructura exacta que nos devuelve Go
export interface MonthlySummaryResponse {
  current_month: {
    income: number;
    expense: number;
  };
  previous_month: {
    income: number;
    expense: number;
  };
  variations: {
    income_percentage: number;
    expense_percentage: number;
  };
}
export interface CategoryData {
  category_name: string;
  amount: number;
  percentage: number;
}

export interface CategoryDistributionResponse {
  total_expenses: number;
  categories: CategoryData[];
}
export interface MoneyFlowData {
  label: string;
  income: number;
  expense: number;
}
export const analysisService = {
  // 2. Función para obtener el resumen pasándole el mes (ej: "2025-09")
  async getMonthlySummary(month: string): Promise<MonthlySummaryResponse> {
    const response = await api.get<MonthlySummaryResponse>(
      `/analysis?type=monthly-summary&month=${month}`
    );
    return response.data;
  },
async getCategoryDistribution(startDate: string, endDate: string) {
    const response = await api.get("/analysis", {
      params: {
        type: "category-distribution", // El type que espera Go
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },
  async getMoneyFlow(range: string, accountId?: string): Promise<MoneyFlowData[]> {
    // Si tenemos un accountId específico lo mandamos, si no, traemos el global
    const url = accountId 
      ? `/analysis?type=money-flow&range=${range}&account_id=${accountId}`
      : `/analysis?type=money-flow&range=${range}`;
      
    const response = await api.get<MoneyFlowData[]>(url);
    return response.data;},
};

