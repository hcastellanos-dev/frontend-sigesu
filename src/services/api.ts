import axios from "axios";

const api = axios.create({
  //baseURL: "http://localhost:3001/api",
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://172.16.5.79:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para enviar token automáticamente
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token) {
      // Usar config.headers.set garantiza compatibilidad con versiones nuevas de Axios
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;