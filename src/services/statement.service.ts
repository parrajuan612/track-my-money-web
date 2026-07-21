import api from "./api";
export interface MovementRequestDTO {
  date: string;
  description: string;
  category_id: number;
  amount: number;
  type: string;
}

export interface SaveStatementRequest {
  period_month: string;
  file_name: string;
  movements: MovementRequestDTO[];
}
export const statementService = {
  async parseStatement(file: File, bankId: string, password?: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bank_id", bankId);
    
    if (password) {
      formData.append("password", password);
    }

    // Enviamos la petición como multipart/form-data
    const response = await api.post("/statements/parse", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  },
  async saveStatement(data: SaveStatementRequest) {
    // Apuntamos al endpoint que me indicaste
    const response = await api.post("/movements/bulk", data);
    return response.data;
  }
};