"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import DataTable from "@/components/dashboard/DataTable";
import Link from "next/link";
import * as XLSX from "xlsx";
import { useAuth } from "@/hooks/useAuth"; // Importante: Asegúrate de que esta sea tu ruta de useAuth
import { 
  Plus, Search, Layers, FileSpreadsheet, 
  ChevronLeft, ChevronRight, Tag
} from "lucide-react";

export default function CategoriasPage() {
  const { user } = useAuth(); // Obtenemos el usuario y su rol
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const loadCategorias = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categorias");
      setCategorias(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  // Filtrado dinámico por nombre o descripción
  const filteredCategorias = useMemo(() => {
    const term = search.toLowerCase();
    return categorias.filter((c: any) => 
      c.nombre.toLowerCase().includes(term) ||
      (c.descripcion && c.descripcion.toLowerCase().includes(term))
    );
  }, [categorias, search]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredCategorias.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCategorias.slice(start, start + itemsPerPage);
  }, [filteredCategorias, currentPage]);

  // Exportación a Excel
  const exportToExcel = () => {
    const dataToExport = filteredCategorias.map((cat: any) => ({
      "ID CATEGORIA": cat.id_categoria,
      "NOMBRE": cat.nombre,
      "DESCRIPCION": cat.descripcion || "Sin descripción",
      "TOTAL PRODUCTOS": cat._count?.productos || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categorias");
    XLSX.writeFile(workbook, `Reporte_Categorias_Inventario.xlsx`);
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`¿Deseas eliminar la categoría "${item.nombre}"?`)) return;
    try {
      await api.delete(`/categorias/${item.id_categoria}`);
      loadCategorias();
    } catch (err) {
      alert("Error al eliminar. Verifique si la categoría tiene productos asociados.");
    }
  };

  // Validación de Rol para eliminar
  const puedeEliminar = user?.rol?.nombre === 'ADMINISTRADOR' || user?.rol?.nombre === 'SISTEMAS';

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-semibold animate-pulse">Cargando categorías...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Layers className="text-indigo-600" size={32} />
            Categorías de Inventario
          </h1>
          <p className="text-slate-500 font-medium">Clasificación y organización de productos y activos.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
          >
            <FileSpreadsheet size={20} /> Exportar Excel
          </button>
          <Link 
            href="/dashboard/categorias/create" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Nueva Categoría
          </Link>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar categorías por nombre o descripción..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <DataTable
          columns={[
            { 
              key: "id_categoria", 
              label: "ID",
              render: (item) => (
                <span className="bg-slate-100 text-slate-600 p-2 rounded-lg font-mono text-xs font-bold border border-slate-200">
                  #{item.id_categoria.toString().padStart(3, '0')}
                </span>
              )
            },
            { 
              key: "nombre", 
              label: "NOMBRE DE CATEGORÍA",
              render: (item) => (
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Tag size={16} />
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                    {item.nombre}
                  </span>
                </div>
              )
            },
            { 
              key: "descripcion", 
              label: "DESCRIPCIÓN",
              render: (item) => (
                <p className="text-xs text-slate-500 font-medium max-w-xs truncate">
                  {item.descripcion || "Sin descripción disponible."}
                </p>
              )
            },
            { 
              key: "_count", 
              label: "PRODUCTOS VINCULADOS",
              render: (item) => (
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    item._count?.productos > 0 
                    ? "bg-indigo-100 text-indigo-700" 
                    : "bg-slate-100 text-slate-400"
                  }`}>
                    {item._count?.productos || 0} items
                  </span>
                </div>
              )
            }
          ]}
          data={paginatedData}
          onEdit={(item) => router.push(`/dashboard/categorias/edit/${item.id_categoria}`)}
          {...(puedeEliminar && { onDelete: (item) => handleDelete(item) })}
        />

        {/* Paginación */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando <span className="text-indigo-600 font-bold">{paginatedData.length}</span> de <span className="font-bold">{filteredCategorias.length}</span> categorías
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