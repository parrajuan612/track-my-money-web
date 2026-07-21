import api from "@/services/api";

// Agregamos 'User' a la importación
import {
  User,
  LoginRequest,
  LoginResponse,
  GoogleLoginRequest,
  RegisterRequest,
} from "../types/auth.types";

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", data);
    
    // ¡NUEVO!: Guardamos el token inmediatamente si el login fue exitoso
    if (typeof window !== "undefined" && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
  },

  async loginWithGoogle(data: GoogleLoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/google", data);
    
    // ¡NUEVO!: Guardamos el token también al entrar con Google
    if (typeof window !== "undefined" && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token"); 
    }
    return Promise.resolve();
  },

  async getMe(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>("/auth/me");
    return response.data;
  },
  
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/register", data);
    
    // ¡NUEVO!: Guardamos el token si el registro auto-loguea al usuario
    if (typeof window !== "undefined" && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    
    return response.data;
  },
};