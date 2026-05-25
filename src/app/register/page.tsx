// 1. Importa tu componente Hero (ajusta la ruta si se llama diferente en tu proyecto)
import { LoginHero } from "@/features/auth/components/login-hero"; 
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    // Usamos el mismo contenedor principal que en el login
    <main className="flex min-h-screen items-center justify-center bg-[#ece9f9] p-4 md:p-8">
      
      {/* Contenedor de dos columnas */}
      <div className="flex w-full max-w-[1200px] flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* 2. Lado izquierdo: Agregamos el componente Hero */}
        <div className="hidden lg:flex w-full justify-center lg:w-1/2">
           <LoginHero /> 
        </div>

        {/* Lado derecho: El Formulario de Registro */}
        <div className="flex w-full justify-center lg:w-1/2">
          <RegisterForm />
        </div>

      </div>
    </main>
  );
}