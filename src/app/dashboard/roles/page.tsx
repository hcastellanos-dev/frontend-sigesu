"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import DataTable from "@/components/dashboard/DataTable";
import Link from "next/link";
import * as XLSX from "xlsx";
import { 
  ShieldCheck, Plus, Search, FileSpreadsheet,
  ChevronLeft, ChevronRight, KeyRound, TextCursorInput
} from "lucide-react";

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  // Función para cargar los roles desde el backend
  const loadRoles = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/roles");
      // Validamos que la respuesta sea un arreglo
      setRoles(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Error al cargar roles:", err);
      setError("No se pudieron cargar los roles de seguridad.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  // Lógica de filtrado profesional (Busca en Nombre, Permisos o Descripción)
  const filteredRoles = useMemo(() => {
    const term = search.toLowerCase();
    return roles.filter((r) => 
      r.nombre.toLowerCase().includes(term) ||
      r.permiso_crud.toLowerCase().includes(term) ||
      (r.descripcion && r.descripcion.toLowerCase().includes(term))
    );
  }, [roles, search]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(start, start + itemsPerPage);
  }, [filteredRoles, currentPage]);

  // Exportar a Excel basado en Schema.prisma (Todos los campos definidos)
  const exportToExcel = () => {
    const dataToExport = filteredRoles.map((role) => ({
      "ID ROL": role.id_rol,
      "NOMBRE DEL ROL": role.nombre,
      "PERMISOS (CRUD)": role.permiso_crud,
      "DESCRIPCIÓN": role.descripcion || "Sin descripción"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RolesSeguridad");
    XLSX.writeFile(workbook, `Reporte_Roles_Acceso.xlsx`);
  };

  // Función para eliminar un rol
  const handleDelete = async (role: any) => {
    if (confirm(`¿Está seguro de eliminar el rol "${role.nombre}"? Esta acción no se puede deshacer.`)) {
      try {
        await api.delete(`/roles/${role.id_rol}`);
        // Recargamos la lista localmente
        loadRoles();
      } catch (err: any) {
        const msg = err.response?.data?.message || "Error al eliminar el rol";
        alert(msg);
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-semibold animate-pulse">Cargando niveles de acceso...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Encabezado Estilo Vales */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-indigo-600" size={32} />
            Configuración de Roles
          </h1>
          <p className="text-slate-500 font-medium">Administra los niveles de acceso y permisos de seguridad del sistema.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
          >
            <FileSpreadsheet size={20} /> Exportar Excel
          </button>
          <Link 
            href="/dashboard/roles/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Nuevo Rol
          </Link>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm">
          <p className="font-bold">{error}</p>
        </div>
      )}

      {/* Buscador Estilo Vales */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, permisos (C, R, U, D) o descripción..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Tabla de Datos Estilo Vales */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <DataTable
          columns={[
            { 
              key: "id_rol", 
              label: "ID",
              render: (r) => (
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-mono text-xs font-bold border border-slate-200">
                  #{r.id_rol.toString().padStart(3, '0')}
                </span>
              )
            },
            { 
              key: "nombre", 
              label: "NOMBRE DEL ROL",
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${r.nombre === 'ADMINISTRADOR' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    <KeyRound size={16} />
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">{r.nombre}</span>
                </div>
              )
            },
            { 
              key: "permiso_crud", 
              label: "PERMISOS (CRUD)",
              render: (r) => (
                <div className="flex gap-1">
                  {['C', 'R', 'U', 'D'].map(p => (
                    <span key={p} className={`px-2.5 py-0.5 rounded-md font-black text-xs ${
                      r.permiso_crud.includes(p) 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      {p}
                    </span>
                  ))}
                </div>
              )
            },
            { 
              key: "descripcion", 
              label: "DESCRIPCIÓN",
              render: (r) => (
                <div className="flex items-start gap-2 max-w-md">
                   <TextCursorInput size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                   <p className="text-xs text-slate-600 leading-relaxed font-medium">
                     {r.descripcion || <span className="text-slate-400 italic">Sin descripción definida.</span>}
                   </p>
                </div>
              )
            },
          ]}
          data={paginatedData}
          // El DataTable genérico ahora gestiona los iconos limpios internamente
          onEdit={(r) => router.push(`/dashboard/roles/edit/${r.id_rol}`)}
          onDelete={(r) => handleDelete(r)}
        />

        {/* Paginación Estilo Vales */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando <span className="text-indigo-600 font-bold">{paginatedData.length}</span> de <span className="font-bold">{filteredRoles.length}</span> roles definidos
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    currentPage === i + 1 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                    : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

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