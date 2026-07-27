import axios from "axios";

const api = axios.create({
  // Aquí está la magia: Usa la variable de Vercel, o localhost si estás en tu PC
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9080/api/v1", 
});

// Este "Interceptor" se ejecuta ANTES de que la petición salga hacia Go
api.interceptors.request.use(
  (config) => {
    // Buscamos el token donde lo hayas guardado al hacer Login (ej. localStorage)
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    
    // Si hay token, se lo pegamos en los Headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
