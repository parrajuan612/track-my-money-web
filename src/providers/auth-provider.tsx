"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // ¡Agregamos usePathname!
import { AuthContext } from "./auth-context";
import { authService } from "@/features/auth/services/auth.service";
import type { User } from "@/features/auth/types/auth.types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // Nos dice exactamente en qué página estamos

  const isAuthenticated = !!user;

  // 1. Login Tradicional
  const login = async (email: string, password?: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user ?? null);
    router.push("/dashboard");
  };

  // 2. Login con Google
  const loginWithGoogle = async (idToken: string) => {
    const response = await authService.loginWithGoogle({ id_token: idToken });
    setUser(response.user ?? null);
    router.push("/dashboard");
  };

  // 3. Cerrar sesión
  const logout = async () => {
    await authService.logout();
    setUser(null);
    router.push("/login");
  };

  const register = async (name: string, email: string, password?: string) => {
    const response = await authService.register({ name, email, password });
    setUser(response.user ?? null);
    router.push("/dashboard");
  };

  // 4. Validar sesión al cargar la página
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Asegurarnos de que estamos en el cliente (navegador)
        if (typeof window === "undefined") {
          return; 
        }

        const token = localStorage.getItem("token");
        const isPublicRoute = pathname === "/login" || pathname === "/register";

        // Si no hay token Y estamos en una ruta pública, no hay problema, solo detenemos la carga.
        if (!token) {
          if (!isPublicRoute) {
             // Solo redirigimos si intenta entrar al dashboard sin token
             router.push("/login");
          }
          setLoading(false);
          return;
        }

        // Si hay token, preguntamos a Go si sigue siendo válido
        const data = await authService.getMe();
        setUser(data.user ?? null);

        // Opcional: Si está logueado e intenta entrar al /login, lo devolvemos al dashboard
        if (isPublicRoute && data.user) {
          router.push("/dashboard");
        }
        
      } catch (error) {
        console.error("Sesión inválida o expirada:", error);
        setUser(null);
        
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        
        if (pathname !== "/login" && pathname !== "/register") {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router, pathname]); // Reaccionamos también si cambia la URL

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        setUser,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}