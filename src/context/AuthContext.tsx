"use client";

import { createContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  nombre: string;
  apellido_paterno: string;
  rol: {
    nombre: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

// Tiempo de inactividad permitido en milisegundos (5 minutos)
const INACTIVITY_TIMEOUT = 5 * 60 * 1000;

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Referencia para almacenar el id del temporizador
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para cerrar sesión y redirigir a la raíz (http://localhost:3000/)
  const logout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
    router.push("/");
  }, [router]);

  // Función para reiniciar el temporizador de inactividad
  const resetInactivityTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Solo activamos el temporizador si el usuario tiene sesión iniciada
    if (token) {
      timeoutRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [token, logout]);

  // Carga inicial del token y usuario desde localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        localStorage.removeItem("refreshToken");
      }
    }
    setLoading(false);
  }, []);

  // Escuchadores de eventos globales para rastrear la actividad del usuario
  useEffect(() => {
    if (!token) return;

    // Eventos que indican que el usuario está activo
    const events = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    // Iniciar el temporizador al cargar con sesión activa
    resetInactivityTimer();

    // Agregar listeners
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Limpieza al desmontar o cuando el token cambia
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [token, resetInactivityTimer]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("accessToken", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}