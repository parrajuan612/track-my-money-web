import { api } from "@/services/api";

// Agregamos 'User' a la importación
import {
  User,
  LoginRequest,
  LoginResponse,
  GoogleLoginRequest,
} from "../types/auth.types";

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  async loginWithGoogle(data: GoogleLoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/google", data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  // Ahora 'User' ya será reconocido aquí
  async getMe(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data;
  },
};