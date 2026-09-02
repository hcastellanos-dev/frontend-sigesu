"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
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

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  const userRole = (user?.rol?.nombre || user?.rol || "").toString().toUpperCase();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen border-r border-slate-800 hidden md:block">
      <div className="p-4 text-xl font-bold border-b border-slate-800 tracking-wider">
        SIGESU
      </div>

      <nav className="p-4 space-y-1">
        <MenuItem 
          href="/dashboard" 
          icon={<LayoutDashboard size={20} />} 
          active={pathname === "/dashboard"}
        >
          Dashboard
        </MenuItem>

        {/* Solo ADMINISTRADOR */}
        {userRole === "ADMINISTRADOR" && (
          <>
            <MenuItem 
              href="/dashboard/roles" 
              icon={<ShieldCheck size={20} />} 
              active={pathname.startsWith("/dashboard/roles")}
            >
              Roles
            </MenuItem>
            <MenuItem 
              href="/dashboard/usuarios" 
              icon={<Users size={20} />} 
              active={pathname.startsWith("/dashboard/usuarios")}
            >
              Usuarios
            </MenuItem>
          </>
        )}

        {/* ADMINISTRADOR o SISTEMAS */}
        {(userRole === "ADMINISTRADOR" || userRole === "SISTEMAS") && (
          <>
            <MenuItem 
              href="/dashboard/edificios" 
              icon={<Building2 size={20} />} 
              active={pathname.startsWith("/dashboard/edificios")}
            >
              Edificios
            </MenuItem>
            <MenuItem 
              href="/dashboard/areas" 
              icon={<MapPin size={20} />} 
              active={pathname.startsWith("/dashboard/areas")}
            >
              Áreas
            </MenuItem>
          </>
        )}

        <MenuItem 
          href="/dashboard/categorias" 
          icon={<Tags size={20} />} 
          active={pathname.startsWith("/dashboard/categorias")}
        >
          Categorías
        </MenuItem>

        <MenuItem 
          href="/dashboard/proveedores" 
          icon={<Truck size={20} />} 
          active={pathname.startsWith("/dashboard/proveedores")}
        >
          Proveedores
        </MenuItem>

        <MenuItem 
          href="/dashboard/productos" 
          icon={<Package size={20} />} 
          active={pathname.startsWith("/dashboard/productos")}
        >
          Productos
        </MenuItem>

        {/* ADMINISTRADOR o SISTEMAS */}
        {(userRole === "ADMINISTRADOR" || userRole === "SISTEMAS") && (
          <MenuItem 
            href="/dashboard/vales" 
            icon={<FileText size={20} />} 
            active={pathname.startsWith("/dashboard/vales")}
          >
            Vales
          </MenuItem>
        )}

        {/* Solo ADMINISTRADOR */}
        {userRole === "ADMINISTRADOR" && (
          <MenuItem 
            href="/dashboard/bitacora" 
            icon={<History size={20} />} 
            active={pathname.startsWith("/dashboard/bitacora")}
          >
            Bitácora
          </MenuItem>
        )}
      </nav>
    </aside>
  );
}

function MenuItem({ 
  href, 
  icon, 
  children, 
  active 
}: { 
  href: string; 
  icon: React.ReactNode; 
  children: React.ReactNode; 
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
        active 
          ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30" 
          : "text-slate-300 hover:text-white hover:bg-slate-800"
      }`}
    >
      <span className={active ? "text-white" : "text-slate-400 group-hover:text-indigo-400"}>
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
}