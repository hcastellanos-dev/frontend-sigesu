"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AreaService } from "@/services/area.service";
import DataTable from "@/components/dashboard/DataTable";
import Link from "next/link";
import * as XLSX from "xlsx";
import { 
  Plus, Search, Landmark, FileSpreadsheet, 
  ChevronLeft, ChevronRight, MapPin, Info 
} from "lucide-react";

export default function AreasPage() {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const loadAreas = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await AreaService.findAll();
      setAreas(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error cargando áreas:", err);
      setError("No se pudo conectar con el servidor o no tienes permisos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAreas();
  }, []);

  // Filtrado dinámico (Busca en nombre de área, descripción o nombre del edificio)
  const filteredAreas = useMemo(() => {
    const term = search.toLowerCase();
    return areas.filter((a: any) => 
      a.nombre.toLowerCase().includes(term) ||
      (a.descripcion && a.descripcion.toLowerCase().includes(term)) ||
      (a.edificio?.nombre && a.edificio.nombre.toLowerCase().includes(term))
    );
  }, [areas, search]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAreas.slice(start, start + itemsPerPage);
  }, [filteredAreas, currentPage]);

  // Exportar a Excel (Campos definidos en schema.prisma)
  const exportToExcel = () => {
    const dataToExport = filteredAreas.map((area: any) => ({
      "ID AREA": area.id_area,
      "NOMBRE AREA": area.nombre,
      "DESCRIPCION": area.descripcion || "N/A",
      "ID EDIFICIO": area.id_edificio,
      "EDIFICIO (UBICACION)": area.edificio?.nombre || "No asignado",
      "PLANTA": area.edificio?.planta || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Areas");
    XLSX.writeFile(workbook, `Reporte_Areas_Institucionales.xlsx`);
  };

  const handleDelete = async (item: any) => {
    if (!confirm(`¿Deseas eliminar el área "${item.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await AreaService.remove(item.id_area);
      loadAreas();
    } catch (err) { 
      alert("Error al eliminar el área. Verifica si tiene productos o vales asociados."); 
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-semibold animate-pulse">Cargando catálogo de áreas...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Estilo Vales */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Landmark className="text-indigo-600" size={32} />
            Áreas y Departamentos
          </h1>
          <p className="text-slate-500 font-medium">Gestión de unidades organizativas y su adscripción física.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
          >
            <FileSpreadsheet size={20} /> Exportar Excel
          </button>
          <Link 
            href="/dashboard/areas/create" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Agregar Área
          </Link>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm">
          <p className="font-bold flex items-center gap-2">
            <Info size={18} /> {error}
          </p>
        </div>
      )}

      {/* Buscador Profesional */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre de área, edificio o descripción..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Contenedor de Tabla con diseño mejorado */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <DataTable
          columns={[
            { 
              key: "id_area", 
              label: "ID",
              render: (item) => (
                <span className="bg-slate-100 text-slate-600 p-2 rounded-lg font-mono text-xs font-bold border border-slate-200">
                  #{item.id_area.toString().padStart(3, '0')}
                </span>
              )
            },
            { 
              key: "nombre", 
              label: "NOMBRE DEL ÁREA",
              render: (item) => (
                <span className="text-sm font-extrabold text-slate-800 uppercase">
                  {item.nombre}
                </span>
              )
            },
            { 
              key: "edificio", 
              label: "UBICACIÓN (EDIFICIO)",
              render: (item) => (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-sm">
                    <MapPin size={14} />
                    {item.edificio?.nombre || "No asignado"}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-5">
                    {item.edificio?.planta || "Nivel General"}
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
            }
          ]}
          data={paginatedData}
          onEdit={(item) => router.push(`/dashboard/areas/edit/${item.id_area}`)}
          onDelete={(item) => handleDelete(item)}
        />

        {/* Footer con Paginación Profesional */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando <span className="text-indigo-600 font-bold">{paginatedData.length}</span> de <span className="font-bold">{filteredAreas.length}</span> áreas
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