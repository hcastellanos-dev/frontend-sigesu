"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Sidebar() {
  const { user } = useAuth();
  return (
    <aside className="w-64 bg-slate-900 text-white hidden md:block">
      <div className="p-4 text-xl font-bold border-b border-slate-700">
        SIGESU
      </div>

      <nav className="p-4 space-y-2">
        <MenuItem href="/dashboard">Dashboard</MenuItem>
        {/* Solo mostrar si es ADMINISTRADOR */}
        {(user?.rol?.nombre === 'ADMINISTRADOR') && (
          <>
          <MenuItem href="/dashboard/roles">Roles</MenuItem>
          <MenuItem href="/dashboard/usuarios">Usuarios</MenuItem>
          </>
        )}
        {(user?.rol?.nombre === 'ADMINISTRADOR' || user?.rol?.nombre === 'SISTEMAS') && (
          <>
          <MenuItem href="/dashboard/edificios">Edificios</MenuItem>
          <MenuItem href="/dashboard/areas">Áreas</MenuItem>
          </>
        )}
        <MenuItem href="/dashboard/categorias">Categorias</MenuItem>
        <MenuItem href="/dashboard/proveedores">Proveedores</MenuItem>
        <MenuItem href="/dashboard/productos">Productos</MenuItem>
        {(user?.rol?.nombre === 'ADMINISTRADOR' || user?.rol?.nombre === 'SISTEMAS') && (
          <>
          <MenuItem href="/dashboard/vales">Vales</MenuItem>
          </>
        )}
        {user?.rol?.nombre === 'ADMINISTRADOR' && (
          <>
          <MenuItem href="/dashboard/bitacora">Bitacora</MenuItem>
          </>
        )}
      </nav>
    </aside>
  );
}

function MenuItem({ href, children }: any) {
  return (
    <Link
      href={href}
      className="block p-2 rounded hover:bg-slate-700"
    >
      {children}
    </Link>
  );
}
