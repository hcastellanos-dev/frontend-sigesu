"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth(); // Extraemos 'user' y la función 'logout' del contexto
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm">
      {/* Sección Izquierda: Identificación del Panel */}
      <div className="flex items-center space-x-2">
        <span className="text-gray-400 font-medium">Panel</span>
        <span className="text-gray-300">/</span>
        <h1 className="text-slate-700 font-semibold tracking-tight">
          Administración de Sistema
        </h1>
      </div>

      {/* Sección Derecha: Info de Usuario y Salida */}
      <div className="flex items-center space-x-6">
        <div className="flex flex-col text-right border-r pr-6 border-gray-100">
          <span className="text-sm font-bold text-slate-800 leading-tight">
            {/* Si el objeto user tiene 'nombre', lo muestra; si no, pone un fallback */}
            {user?.nombre ? `${user.nombre} ${user.apellido_paterno || ''}` : "Cargando usuario..."}
          </span>
          <span className="text-xs text-indigo-600 font-medium uppercase tracking-wider">
            {user?.rol?.nombre || "Rol no asignado"}
          </span>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-all duration-200 border border-red-100"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
}