import { createContext, useContext } from "react";
import type { AuthState, User } from "@/features/auth/types/auth.types";


export interface AuthContextType extends AuthState {

  login: (email: string, password?: string) => Promise<void>;
register: (name: string, email: string, password?: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}