"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // <-- Importamos el router
import { AuthContext } from "./auth-context";
import { authService } from "@/features/auth/services/auth.service";
import type { User } from "@/features/auth/types/auth.types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // <-- Inicializamos el router

  const isAuthenticated = !!user;

  // 1. Login Tradicional
  const login = async (email: string, password?: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user ?? null);
    router.push("/dashboard"); // <-- Redirigimos al éxito
  };

  // 2. Login con Google
  const loginWithGoogle = async (idToken: string) => {
    const response = await authService.loginWithGoogle({ id_token: idToken });
    setUser(response.user ?? null);
    router.push("/dashboard"); // <-- Redirigimos al éxito
  };

  // 3. Cerrar sesión
  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push("/login"); // <-- Redirigimos al login al salir
  };
const register = async (name: string, email: string, password?: string) => {
    const response = await authService.register({ name, email, password });
    setUser(response.user ?? null);
    router.push("/dashboard"); // Redirigimos directo a la app
  };
  // 4. Validar sesión al cargar la página
useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await authService.getMe();
        setUser(data.user ?? null);
      } catch {
        setUser(null);
        // Si no estamos en el login o register, y no hay usuario, mandamos al login
        if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        loginWithGoogle,
        register, // <-- La proveemos aquí
        logout,
        setUser,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}