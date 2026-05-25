import { LoginHero } from "./login-hero";
import { LoginForm } from "./login-form";

export function LoginScreen() {
  return (
    // Agregamos pt-12 lg:pt-20 para dar espacio desde arriba
    <main className="min-h-screen bg-[#ece9f9] flex justify-center p-4 pt-12 md:p-8 lg:p-12 lg:pt-20">
      {/* Cambiamos items-center por items-start para que ambos lados se alineen arriba */}
      <div className="w-full max-w-[1150px] grid gap-10 lg:gap-16 lg:grid-cols-[1fr_0.8fr] items-start mx-auto">
        <LoginHero />
        <LoginForm />
      </div>
    </main>
  );
}