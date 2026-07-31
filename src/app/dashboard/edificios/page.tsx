"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EdificioService } from "@/services/edificio.service";
import DataTable from "@/components/dashboard/DataTable";
import Link from "next/link";
import * as XLSX from "xlsx";
import { 
  Building2, Plus, Search, FileSpreadsheet, 
  ChevronLeft, ChevronRight, Map, Layers 
} from "lucide-react";

export default function EdificiosPage() {
  const [edificios, setEdificios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const loadEdificios = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await EdificioService.findAll();
      setEdificios(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Error cargando edificios:", err);
      setError("No se pudo conectar con el servidor para cargar la infraestructura.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEdificios();
  }, []);

  // Función auxiliar para transformar el valor de la DB a texto legible
  const formatPlanta = (planta: string) => {
    if (planta === "una") return "Una planta (P.B.)";
    if (planta === "dos") return "Dos plantas (P.B. y P.A.)";
    return planta || "No especificado";
  };

  // Lógica de Filtrado mejorada para incluir los nuevos términos
  const filteredEdificios = useMemo(() => {
    const term = search.toLowerCase();
    return edificios.filter((e) => {
      const plantaTexto = formatPlanta(e.planta).toLowerCase();
      return (
        e.nombre.toLowerCase().includes(term) ||
        plantaTexto.includes(term) ||
        (e.descripcion && e.descripcion.toLowerCase().includes(term))
      );
    });
  }, [edificios, search]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredEdificios.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEdificios.slice(start, start + itemsPerPage);
  }, [filteredEdificios, currentPage]);

  // Exportar a Excel con nombres descriptivos
  const exportToExcel = () => {
    const dataToExport = filteredEdificios.map((e) => ({
      "ID EDIFICIO": e.id_edificio,
      "NOMBRE": e.nombre,
      "NIVELES DEL EDIFICIO": formatPlanta(e.planta),
      "DESCRIPCIÓN": e.descripcion || "Sin descripción",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Infraestructura");
    XLSX.writeFile(workbook, `Reporte_Edificios_UPN.xlsx`);
  };

  const handleDelete = async (item: any) => {
    if (confirm(`¿Estás seguro de eliminar el edificio "${item.nombre}"? Se eliminarán también las áreas asociadas.`)) {
      try {
        await EdificioService.remove(item.id_edificio);
        loadEdificios();
      } catch (err) {
        alert("Error al eliminar. Verifique que el edificio no tenga áreas con vales activos.");
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-semibold animate-pulse">Cargando infraestructura...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Encabezado Profesional */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Building2 className="text-indigo-600" size={32} />
            Gestión de Edificios
          </h1>
          <p className="text-slate-500 font-medium">Administración de inmuebles, niveles y plantas físicas.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportToExcel} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
          >
            <FileSpreadsheet size={20} /> Exportar Excel
          </button>
          <Link 
            href="/dashboard/edificios/create" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Nuevo Edificio
          </Link>
        </div>
      </div>

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
          placeholder="Buscar por nombre de edificio, niveles o descripción..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Tabla de Datos con Diseño de Vales */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <DataTable
          columns={[
            { 
              key: "id_edificio", 
              label: "ID",
              render: (item) => (
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-mono text-xs font-bold border border-slate-200">
                  #{item.id_edificio.toString().padStart(3, '0')}
                </span>
              )
            },
            { 
              key: "nombre", 
              label: "EDIFICIO",
              render: (item) => (
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                    <Map size={18} />
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                    {item.nombre}
                  </span>
                </div>
              )
            },
            { 
              key: "planta", 
              label: "NIVELES DEL EDIFICIO", // Título actualizado
              render: (item) => (
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-indigo-400" />
                  <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    {formatPlanta(item.planta)}
                  </span>
                </div>
              )
            },
            { 
              key: "descripcion", 
              label: "NOTAS ADICIONALES",
              render: (item) => (
                <p className="text-xs text-slate-500 max-w-xs truncate font-medium">
                  {item.descripcion || "Sin observaciones adicionales."}
                </p>
              )
            },
          ]}
          data={paginatedData}
          onEdit={(item) => router.push(`/dashboard/edificios/edit/${item.id_edificio}`)}
          onDelete={(item) => handleDelete(item)}
        />

        {/* Paginación Profesional */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando <span className="text-indigo-600 font-bold">{paginatedData.length}</span> de <span className="font-bold">{filteredEdificios.length}</span> edificios registrados
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