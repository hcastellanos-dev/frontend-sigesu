"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Menu, 
  X, 
  LogOut,
  LayoutDashboard, 
  ShieldCheck, 
  Users, 
  Building2, 
  MapPin, 
  Tags, 
  Truck, 
  Package, 
  FileText, 
  History 
} from "lucide-react";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = (user?.rol?.nombre || user?.rol || "").toString().toUpperCase();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="h-16 flex items-center justify-between px-4 md:px-8">
        
        {/* Sección Izquierda: Botón Hamburguesa en Móvil + Identificación */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden focus:outline-none transition-colors"
            aria-label="Abrir Menú"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-slate-900 font-black tracking-wider text-lg md:hidden">SIGESU</span>
            <span className="hidden md:inline text-gray-400 font-medium">Panel</span>
            <span className="hidden md:inline text-gray-300">/</span>
            <h1 className="text-slate-700 font-semibold tracking-tight text-xs sm:text-sm md:text-base truncate max-w-[140px] sm:max-w-none">
              Administración de Sistema
            </h1>
          </div>
        </div>

        {/* Sección Derecha: Info de Usuario y Salida */}
        <div className="flex items-center space-x-3 md:space-x-6">
          <div className="flex flex-col text-right border-r pr-3 md:pr-6 border-gray-100">
            <span className="text-xs md:text-sm font-bold text-slate-800 leading-tight truncate max-w-[120px] sm:max-w-none">
              {user?.nombre ? `${user.nombre} ${user.apellido_paterno || ''}` : "Cargando..."}
            </span>
            <span className="text-[10px] md:text-xs text-indigo-600 font-medium uppercase tracking-wider">
              {userRole || "Sin Rol"}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-50 text-red-600 p-2 md:px-4 md:py-2 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-all duration-200 border border-red-100 flex items-center gap-2"
            title="Cerrar Sesión"
          >
            <LogOut size={16} className="md:hidden" />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Acordeón Móvil (Solo visible en pantallas pequeñas al presionar el botón hamburguesa) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-1 animate-in slide-in-from-top duration-200 shadow-2xl">
          <MobileMenuItem 
            href="/dashboard" 
            icon={<LayoutDashboard size={18} />} 
            active={pathname === "/dashboard"}
            onClick={closeMenu}
          >
            Dashboard
          </MobileMenuItem>

          {userRole === "ADMINISTRADOR" && (
            <>
              <MobileMenuItem 
                href="/dashboard/roles" 
                icon={<ShieldCheck size={18} />} 
                active={pathname.startsWith("/dashboard/roles")}
                onClick={closeMenu}
              >
                Roles
              </MobileMenuItem>
              <MobileMenuItem 
                href="/dashboard/usuarios" 
                icon={<Users size={18} />} 
                active={pathname.startsWith("/dashboard/usuarios")}
                onClick={closeMenu}
              >
                Usuarios
              </MobileMenuItem>
            </>
          )}

          {(userRole === "ADMINISTRADOR" || userRole === "SISTEMAS") && (
            <>
              <MobileMenuItem 
                href="/dashboard/edificios" 
                icon={<Building2 size={18} />} 
                active={pathname.startsWith("/dashboard/edificios")}
                onClick={closeMenu}
              >
                Edificios
              </MobileMenuItem>
              <MobileMenuItem 
                href="/dashboard/areas" 
                icon={<MapPin size={18} />} 
                active={pathname.startsWith("/dashboard/areas")}
                onClick={closeMenu}
              >
                Áreas
              </MobileMenuItem>
            </>
          )}

          <MobileMenuItem 
            href="/dashboard/categorias" 
            icon={<Tags size={18} />} 
            active={pathname.startsWith("/dashboard/categorias")}
            onClick={closeMenu}
          >
            Categorías
          </MobileMenuItem>

          <MobileMenuItem 
            href="/dashboard/proveedores" 
            icon={<Truck size={18} />} 
            active={pathname.startsWith("/dashboard/proveedores")}
            onClick={closeMenu}
          >
            Proveedores
          </MobileMenuItem>

          <MobileMenuItem 
            href="/dashboard/productos" 
            icon={<Package size={18} />} 
            active={pathname.startsWith("/dashboard/productos")}
            onClick={closeMenu}
          >
            Productos
          </MobileMenuItem>

          {(userRole === "ADMINISTRADOR" || userRole === "SISTEMAS") && (
            <MobileMenuItem 
              href="/dashboard/vales" 
              icon={<FileText size={18} />} 
              active={pathname.startsWith("/dashboard/vales")}
              onClick={closeMenu}
            >
              Vales
            </MobileMenuItem>
          )}

          {userRole === "ADMINISTRADOR" && (
            <MobileMenuItem 
              href="/dashboard/bitacora" 
              icon={<History size={18} />} 
              active={pathname.startsWith("/dashboard/bitacora")}
              onClick={closeMenu}
            >
              Bitácora
            </MobileMenuItem>
          )}
        </div>
      )}
    </header>
  );
}

function MobileMenuItem({ 
  href, 
  icon, 
  children, 
  active,
  onClick 
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        active 
          ? "bg-indigo-600 text-white font-bold" 
          : "text-slate-300 hover:text-white hover:bg-slate-800"
      }`}
    >
      <span className={active ? "text-white" : "text-slate-400"}>
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
}