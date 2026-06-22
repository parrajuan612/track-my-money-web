import { api } from "./api";


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
  
  async getMonthlySummary(month: string): Promise<MonthlySummaryResponse> {
    const response = await api.get<MonthlySummaryResponse>(
      `/analysis?type=monthly-summary&month=${month}`
    );
    return response.data;
  },
async getCategoryDistribution(startDate: string, endDate: string) {
    const response = await api.get("/analysis", {
      params: {
        type: "category-distribution", 
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  },
  async getMoneyFlow(range: string, accountId?: string): Promise<MoneyFlowData[]> {
    
    const url = accountId 
      ? `/analysis?type=money-flow&range=${range}&account_id=${accountId}`
      : `/analysis?type=money-flow&range=${range}`;
      
    const response = await api.get<MoneyFlowData[]>(url);
    return response.data;},
  async getExpenseTrends(startDate: string, endDate: string, categoryId?: number) {
    const response = await api.get("/analysis", {
      params: {
        type: "trends",
        start_date: startDate,
        end_date: endDate,
        category_id: categoryId, 
      },
    });
    return response.data;
  }
};

