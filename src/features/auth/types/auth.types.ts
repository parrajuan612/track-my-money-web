export interface User {
  id: string;
  name: string;
  email: string;
}

// ---> ESTA ES LA INTERFAZ QUE FALTABA <---
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface GoogleLoginRequest {
  id_token: string;
}