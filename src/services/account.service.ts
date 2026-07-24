import api from "./api";

export interface Bank {
  id: number;
  name: string;
}

export interface Account {
  id: string;
  user_id: string;
  bank_id: number;
  name: string;
  created_at: string;
  bank?: Bank; // Los datos del banco que vienen cruzados desde Go
}

export const accountService = {
  // Obtener la lista de bancos disponibles
  async getBanks(): Promise<Bank[]> {
    const response = await api.get("/banks");
    return response.data.data;
  },

  // Obtener las cuentas creadas por el usuario
  async getAccounts(): Promise<Account[]> {
    const response = await api.get("/accounts");
    return response.data.data;
  },

  // Crear una nueva cuenta
  async createAccount(data: { bank_id: number; name: string }): Promise<Account> {
    const response = await api.post("/accounts", data);
    return response.data.data;
  }
};