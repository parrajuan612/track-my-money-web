import api from "@/services/api"; // O import api from "./api" dependiendo de tu carpeta

// 1. Definimos la estructura del Movimiento
export interface Movement {
  ID: string;
  Date: string;
  Description: string;
  Amount: number;
  Type: "income" | "expense";
  category_name: string;
  account_name: string;
  bank_name: string;
}

// 2. Definimos las estructuras de Paginación y Filtros
export interface MovementsResponse {
  data: Movement[];
  meta: {
    page: number;
    page_size: number;
    total: number;
  };
}

export interface PaginatedMovements {
  data: any[]; 
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface MovementFilters {
  start_date?: string;
  end_date?: string;
  bank_id?: number;
  account_id?: string;
  category_id?: number;
  type?: string; 
  query?: string;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: string; 
}

// 3. El Servicio Completo (Aquí están TODAS las funciones)
export const movementService = {
  
  // Obtener recientes (Dashboard)
  async getRecentMovements(): Promise<MovementsResponse> {
    const response = await api.get<MovementsResponse>("/movements?page=1&page_size=5");
    return response.data;
  },

  // Obtener todos con filtros (Tabla)
  async getMovements(filters: MovementFilters = {}): Promise<PaginatedMovements> {
    const response = await api.get("/movements", { params: filters });
    return response.data;
  },

  // EDITAR 
  async updateMovement(id: string, data: { description: string; amount: number; type: string; category_id: number }) {
    const response = await api.put(`/movements/${id}`, data);
    return response.data;
  },


// CREAR
  async createMovement(data: { date: string; account_id: string; description: string; amount: number; type: string; category_id: number }) {
    const response = await api.post(`/movements`, data);
    return response.data;
  },
  // ELIMINAR
  async deleteMovement(id: string) {
    const response = await api.delete(`/movements/${id}`);
    return response.data;
  }
};