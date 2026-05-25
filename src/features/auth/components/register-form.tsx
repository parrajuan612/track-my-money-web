"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-context";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export function RegisterForm() {
   const { loginWithGoogle, register } = useAuth(); 

    
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

    
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setIsSubmitting(true);

try {
 
      await register(name, email, password);
 
    } catch (err: any) {
      setError(err.response?.data?.error || "Ocurrió un error al registrar la cuenta.");
    } finally {
      setIsSubmitting(false);
    }
  };
    return (
        <section className="flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-[460px] rounded-[32px] bg-white px-6 py-8 shadow-[0_32px_90px_rgba(83,63,149,0.12)] md:px-10 md:py-10">
                <h2 className="text-[1.8rem] font-extrabold text-[#1f1f35]">Crea tu cuenta</h2>
                <p className="text-[0.95rem] text-[#8c8ca5]">Únete a Track My Money y toma el control</p>

                <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
                    {/* Campo de Nombre */}
                    <div>
                        <label className="text-[0.85rem] font-bold text-[#1f1f35]">Nombre completo</label>
                        <input
                            type="text"
                            placeholder="Tu nombre y apellido"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-2 w-full rounded-xl border border-transparent bg-[#f6f4fa] px-4 py-3.5 text-[0.95rem] text-[#1f1f35] outline-none transition-all focus:border-[#5b38ff] focus:bg-white"
                        />
                    </div>

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
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-xl border border-transparent bg-[#f6f4fa] px-4 py-3.5 pr-10 text-[0.95rem] text-[#1f1f35] outline-none transition-all focus:border-[#5b38ff] focus:bg-white"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8c8ca5] hover:text-[#5b38ff]"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {/* Campo de Confirmar Contraseña */}
                    <div>
                        <label className="text-[0.85rem] font-bold text-[#1f1f35]">Confirmar contraseña</label>
                        <input
                            type="password"
                            placeholder="••••••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            // Pequeño truco visual: Si las contraseñas no coinciden y ya escribió algo, el borde se resalta sutilmente en rojo
                            className={`mt-2 w-full rounded-xl border bg-[#f6f4fa] px-4 py-3.5 text-[0.95rem] text-[#1f1f35] outline-none transition-all focus:bg-white ${confirmPassword && password !== confirmPassword
                                    ? "border-red-400 focus:border-red-500"
                                    : "border-transparent focus:border-[#5b38ff]"
                                }`}
                        />
                    </div>

                    {/* Alertas de error */}
                    {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

                    {/* Botón de Enviar */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-4 w-full rounded-xl bg-[#5b38ff] py-3.5 text-[0.95rem] font-bold text-white transition-all hover:bg-[#4620ff] hover:shadow-[0_8px_25px_rgba(91,56,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

                {/* Divisor social */}
                <div className="mt-8 relative flex items-center justify-center">
                    <span className="absolute bg-white px-3 text-[0.85rem] text-[#8c8ca5]">
                        o regístrate con
                    </span>
                    <div className="w-full h-[1px] bg-[#ece9f6]" />
                </div>

                {/* Botón de Google */}
                <div className="mt-8 flex justify-center w-full overflow-hidden">
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
                        text="signup_with" // Cambia el texto del botón a "Registrarse con"
                    />
                </div>

                {/* Enlace para volver al Login */}
                <p className="mt-8 text-center text-[0.9rem] text-[#8c8ca5]">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="font-bold text-[#5b38ff] hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </section>
    );
}