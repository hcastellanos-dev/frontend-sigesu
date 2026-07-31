"use client";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { logout } = useAuth();
  return (
    <div className="bg-white shadow p-4 flex justify-end">
      <button
        onClick={logout}
        className="text-red-600 font-semibold"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
