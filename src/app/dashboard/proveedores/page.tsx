"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import DataTable from "@/components/dashboard/DataTable";
import Link from "next/link";
import * as XLSX from "xlsx";
import { useAuth } from "@/hooks/useAuth"; // Importación del hook de autenticación
import { 
  Plus, Search, Truck, FileSpreadsheet, 
  ChevronLeft, ChevronRight, Building2, 
  Mail, Phone, MapPin 
} from "lucide-react";

export default function ProveedoresPage() {
  const { user } = useAuth(); // Obtención del usuario actual
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const loadProveedores = async () => {
    try {
      setLoading(true);
      const res = await api.get("/proveedores");
      setProveedores(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar proveedores:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProveedores();
  }, []);

  // Filtrado dinámico (Empresa, Contacto, Email)
  const filteredProveedores = useMemo(() => {
    const term = search.toLowerCase();
    return proveedores.filter((p: any) => 
      p.nombre.toLowerCase().includes(term) ||
      (p.contacto && p.contacto.toLowerCase().includes(term)) ||
      (p.email && p.email.toLowerCase().includes(term))
    );
  }, [proveedores, search]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredProveedores.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProveedores.slice(start, start + itemsPerPage);
  }, [filteredProveedores, currentPage]);

  // Exportación a Excel basada en schema.prisma
  const exportToExcel = () => {
    const dataToExport = filteredProveedores.map((p: any) => ({
      "ID PROVEEDOR": p.id_proveedor,
      "EMPRESA": p.nombre,
      "CONTACTO": p.contacto || "N/A",
      "TELÉFONO": p.telefono || "N/A",
      "EMAIL": p.email || "N/A",
      "DIRECCIÓN": p.direccion || "N/A",
      "TOTAL PRODUCTOS": p._count?.productos || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Proveedores");
    XLSX.writeFile(workbook, `Directorio_Proveedores_${new Date().getFullYear()}.xlsx`);
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`¿Desea eliminar al proveedor "${item.nombre}"?`)) return;
    try {
      await api.delete(`/proveedores/${item.id_proveedor}`);
      loadProveedores();
    } catch (err) {
      alert("Error al eliminar. Verifique si el proveedor tiene productos vinculados.");
    }
  };

  // Validación de Rol para habilitar borrado
  const puedeEliminar = user?.rol?.nombre === 'ADMINISTRADOR' || user?.rol?.nombre === 'SISTEMAS';

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-semibold animate-pulse">Cargando directorio de proveedores...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header con diseño unificado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Truck className="text-indigo-600" size={32} />
            Directorio de Proveedores
          </h1>
          <p className="text-slate-500 font-medium">Gestión de empresas y contactos de suministro.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
          >
            <FileSpreadsheet size={20} /> Exportar Excel
          </button>
          <Link 
            href="/dashboard/proveedores/create" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Nuevo Proveedor
          </Link>
        </div>
      </div>

      {/* Buscador Dinámico mejorado */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por empresa, contacto o correo electrónico..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Tabla con Estilo de Vales */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <DataTable
          columns={[
            { 
              key: "nombre", 
              label: "EMPRESA / DIRECCIÓN",
              render: (item) => (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 rounded-xl text-slate-500">
                    <Building2 size={20} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-slate-800 leading-tight uppercase">{item.nombre}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                      <MapPin size={10} /> {item.direccion || 'Sin dirección registrada'}
                    </span>
                  </div>
                </div>
              )
            },
            { 
              key: "contacto", 
              label: "CONTACTO PRINCIPAL",
              render: (item) => (
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-700">{item.contacto || 'N/A'}</span>
                  <span className="text-[11px] text-indigo-600 flex items-center gap-1 font-medium italic">
                    <Mail size={10} /> {item.email || 'S/C'}
                  </span>
                </div>
              )
            },
            { 
              key: "telefono", 
              label: "TELÉFONO",
              render: (item) => (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" /> {item.telefono || '---'}
                  </span>
                </div>
              )
            },
            { 
              key: "_count", 
              label: "CATÁLOGO",
              render: (item) => (
                <div className="flex flex-col items-center">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black border border-indigo-100 uppercase tracking-tighter">
                    {item._count?.productos || 0} Productos
                  </span>
                </div>
              )
            }
          ]}
          data={paginatedData}
          onEdit={(item) => router.push(`/dashboard/proveedores/edit/${item.id_proveedor}`)}
          // Solo se pasa la función onDelete si el rol coincide, permitiendo que DataTable oculte el botón automáticamente
          {...(puedeEliminar && { onDelete: (item) => handleDelete(item) })}
        />

        {/* Footer con Paginación Profesional */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando <span className="text-indigo-600 font-bold">{paginatedData.length}</span> de <span className="font-bold">{filteredProveedores.length}</span> registros
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all text-slate-600 shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-slate-700 px-4 bg-white py-1.5 rounded-lg border border-slate-200">
              Página {currentPage} de {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all text-slate-600 shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}