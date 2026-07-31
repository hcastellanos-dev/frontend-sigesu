"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UsuarioService } from "@/services/usuario.service";
import DataTable from "@/components/dashboard/DataTable";
import * as XLSX from "xlsx";
import { 
  Users, Plus, Search, FileSpreadsheet, 
  ChevronLeft, ChevronRight, Mail, ShieldCheck 
} from "lucide-react";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  // Función para cargar usuarios
  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await UsuarioService.findAll();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error al cargar usuarios:", err);
      if (err.response?.status === 401) {
        setError("Sesión expirada. Redirigiendo al login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError("Error de conexión con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  // Filtrado lógico (Nombre, Email o Rol)
  const filteredUsuarios = useMemo(() => {
    const term = search.toLowerCase();
    return usuarios.filter((u) => 
      u.nombre.toLowerCase().includes(term) ||
      u.apellido_paterno.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.rol?.nombre.toLowerCase().includes(term)
    );
  }, [usuarios, search]);

  // Paginación
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsuarios.slice(start, start + itemsPerPage);
  }, [filteredUsuarios, currentPage]);

  // Exportar a Excel basado en Schema.prisma (sin password)
  const exportToExcel = () => {
    const dataToExport = filteredUsuarios.map((u) => ({
      "ID USUARIO": u.id_usuario,
      "NOMBRE": u.nombre,
      "APELLIDO PATERNO": u.apellido_paterno,
      "APELLIDO MATERNO": u.apellido_materno || "",
      "EMAIL": u.email,
      "ROL ASIGNADO": u.rol?.nombre || "SIN ROL",
      "PERMISOS ROL": u.rol?.permiso_crud || "",
      "DESCRIPCION ROL": u.rol?.descripcion || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    XLSX.writeFile(workbook, `Reporte_Personal_Sistema.xlsx`);
  };

  const handleDelete = async (user: any) => {
    if (confirm(`¿Estás seguro de eliminar a ${user.nombre}? Esta acción es irreversible.`)) {
      try {
        await UsuarioService.remove(user.id_usuario);
        loadUsuarios();
      } catch (err: any) {
        alert(err.response?.data?.message || "Error al eliminar");
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-semibold animate-pulse">Cargando Personal...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Estilo Vales */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600" size={32} />
            Gestión de Usuarios
          </h1>
          <p className="text-slate-500 font-medium">Administración de cuentas de acceso y roles del sistema.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
          >
            <FileSpreadsheet size={20} /> Exportar Excel
          </button>
          <Link 
            href="/dashboard/usuarios/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Nuevo Usuario
          </Link>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-red-700 font-bold">{error}</p>
        </div>
      )}

      {/* Buscador Estilo Vales */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, correo o rol..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Contenedor Tabla Estilo Vales */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <DataTable
          columns={[
            { 
              key: "id_usuario", 
              label: "ID",
              render: (u) => (
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono text-xs font-bold">
                  #{u.id_usuario.toString().padStart(3, '0')}
                </span>
              )
            },
            { 
              key: "nombre", 
              label: "NOMBRE COMPLETO",
              render: (u) => (
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-800 uppercase leading-tight">
                    {u.nombre} {u.apellido_paterno}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400 italic">
                    {u.apellido_materno || ""}
                  </span>
                </div>
              )
            },
            { 
              key: "email", 
              label: "CORREO ELECTRÓNICO",
              render: (u) => (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-sm font-semibold">{u.email}</span>
                </div>
              )
            },
            { 
              key: "rol", 
              label: "ROL Y PERMISOS",
              render: (u) => (
                <div className="flex flex-col gap-1">
                  <div className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                    u.rol?.nombre === 'ADMINISTRADOR' 
                    ? 'bg-purple-50 text-purple-700 border-purple-100' 
                    : 'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    <ShieldCheck size={12} />
                    {u.rol?.nombre || "SIN ROL"}
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold pl-1 uppercase tracking-tighter">
                    CRUD: {u.rol?.permiso_crud || "N/A"}
                  </span>
                </div>
              )
            }
          ]}
          data={paginatedData}
          onEdit={(u) => router.push(`/dashboard/usuarios/edit/${u.id_usuario}`)}
          onDelete={(u) => handleDelete(u)}
        />

        {/* Paginación Estilo Vales */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando <span className="text-blue-600 font-bold">{paginatedData.length}</span> de <span className="font-bold">{filteredUsuarios.length}</span> usuarios
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-slate-700 px-4">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all text-slate-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}