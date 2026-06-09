import { api } from "./api";

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

// 2. Definimos la estructura de la respuesta (Datos + Paginación)
export interface MovementsResponse {
  data: Movement[];
  meta: {
    page: number;
    page_size: number;
    total: number;
  };
}

export const movementService = {
  // Pedimos solo los últimos movimientos (ej: últimos 5)
  async getRecentMovements(): Promise<MovementsResponse> {
    // Le pasamos un page_size pequeño. Si tu backend requiere fechas por defecto, 
    // se las puedes agregar a esta URL.
    const response = await api.get<MovementsResponse>(
      "/movements?page=1&page_size=5"
    );
    return response.data;
  },
};