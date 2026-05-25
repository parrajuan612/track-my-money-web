"use client";
import { Eye } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/providers/auth-context";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";


export function LoginForm() {
  const { login, loginWithGoogle } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || "Credenciales incorrectas");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="flex justify-center lg:justify-end w-full">
      <div className="w-full max-w-[460px] rounded-[32px] bg-white px-6 py-8 shadow-[0_32px_90px_rgba(83,63,149,0.12)] md:px-10 md:py-10">
        <h2 className="text-[1.8rem] font-extrabold text-[#1f1f35]">Bienvenido</h2>
        <p className="text-[0.95rem] text-[#8c8ca5]">Inicia sesión para continuar</p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          {/* Campo de Correo */}
          <div>
            <label className="text-[0.85rem] font-bold text-[#1f1f35]">Correo electrónico</label>
            <input
              type="email"
              placeholder="tu-correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full rounded-xl border border-transparent bg-[#f6f4fa] px-4 py-3.5 text-[0.95rem] text-[#1f1f35] outline-none transition-all focus:border-[#5b38ff] focus:bg-white"
            />
          </div>

          {/* Campo de Contraseña */}
          <div>
            <label className="text-[0.85rem] font-bold text-[#1f1f35]">Contraseña</label>
            <div className="relative mt-2">
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-transparent bg-[#f6f4fa] px-4 py-3.5 pr-10 text-[0.95rem] text-[#1f1f35] outline-none transition-all focus:border-[#5b38ff] focus:bg-white"
              />
              <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8ca5]">
                <Eye size={18} />
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <div className="flex justify-end">
            <button type="button" className="text-[0.85rem] font-medium text-[#5b38ff] hover:underline">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 w-full rounded-xl bg-[#5b38ff] py-3.5 text-[0.95rem] font-bold text-white transition-all hover:bg-[#4620ff] hover:shadow-[0_8px_25px_rgba(91,56,255,0.3)] disabled:opacity-70"
          >
            {isSubmitting ? "Iniciando..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Divisor */}
        <div className="mt-8 relative flex items-center justify-center">
          <span className="absolute bg-white px-3 text-[0.85rem] text-[#8c8ca5]">
            o continua con
          </span>
          <div className="w-full h-[1px] bg-[#ece9f6]" />
        </div>

        {/* Botones Sociales */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex justify-center w-full overflow-hidden">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                if (credentialResponse.credential) {
                  await loginWithGoogle(credentialResponse.credential);
                }
              }}
              onError={() => setError("Error al conectar con Google")}
              theme="outline"
              size="large"
              shape="pill"
              width="380"
              text="continue_with"
            />
          </div>
          
          <button className="flex items-center justify-center gap-3 w-full rounded-full border border-[#ece9f6] bg-white py-2.5 text-[0.95rem] font-bold text-[#26263d] transition-all hover:bg-[#f6f4fa]">
             Apple
          </button>
        </div>

<p className="mt-8 text-center text-[0.9rem] text-[#8c8ca5]">
  ¿No tienes cuenta?{" "}
  <Link href="/register" className="font-bold text-[#5b38ff] hover:underline">
    Regístrate
  </Link>
</p>
      </div>
    </section>
  );
}