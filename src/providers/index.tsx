"use client"; // Muy importante porque los contextos usan hooks de React

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // 1. Primero envolvemos con Google
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "TU_CLIENT_ID"}>
      {/* 2. Luego envolvemos con nuestro AuthProvider */}
      <AuthProvider>
        {children}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}