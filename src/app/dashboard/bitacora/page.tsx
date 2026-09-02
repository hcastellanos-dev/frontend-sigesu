"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import DataTable from "@/components/dashboard/DataTable";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  ClipboardList,
  Plus,
  Search,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
  MapPin,
  TextCursorInput,
} from "lucide-react";

export default function BitacoraListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  // Función para cargar los registros de bitácora desde el backend
  const loadBitacora = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/bitacora");
      // Validación defensiva: si la respuesta es un arreglo se asigna, de lo contrario un arreglo vacío
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Error al cargar bitácora:", err);
      setError("No se pudieron cargar los registros de auditoría de la bitácora.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBitacora();
  }, []);

  // Lógica de filtrado seguro con encadenamiento opcional
  const filteredData = useMemo(() => {
    const term = search.toLowerCase();
    return data.filter((item) => {
      const producto = item.vale?.producto?.nombre_producto?.toLowerCase() || "";
      const sku = item.vale?.producto?.sku?.toLowerCase() || "";
      const observaciones = item.observaciones?.toLowerCase() || "";
      const area = item.vale?.area?.nombre?.toLowerCase() || "";
      const edificio = item.vale?.area?.edificio?.nombre?.toLowerCase() || "";

      return (
        producto.includes(term) ||
        sku.includes(term) ||
        observaciones.includes(term) ||
        area.includes(term) ||
        edificio.includes(term)
      );
    });
  }, [data, search]);

  // Lógica de Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  // Exportar a Excel con estructura detallada
  const exportToExcel = () => {
    const dataToExport = filteredData.map((item) => ({
      "ID BITÁCORA": item.id_bitacora,
      "FECHA REPORTE": item.fecha_reporte
        ? new Date(item.fecha_reporte).toLocaleString()
        : "N/A",
      "PRODUCTO": item.vale?.producto?.nombre_producto || "N/A",
      "SKU": item.vale?.producto?.sku || "N/A",
      "ÁREA": item.vale?.area?.nombre || "N/A",
      "EDIFICIO": item.vale?.area?.edificio?.nombre || "N/A",
      "OBSERVACIONES": item.observaciones || "Sin observaciones",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BitacoraAuditoria");
    XLSX.writeFile(workbook, `Reporte_Bitacora_Auditoria.xlsx`);
  };

  // Función para eliminar un registro de bitácora
  const handleDelete = async (item: any) => {
    if (
      confirm(
        `¿Está seguro de eliminar este registro de bitácora (#${item.id_bitacora})? Esta acción no se puede deshacer.`
      )
    ) {
      try {
        await api.delete(`/bitacora/${item.id_bitacora}`);
        loadBitacora();
      } catch (err: any) {
        const msg =
          err.response?.data?.message || "Error al eliminar el registro de la bitácora";
        alert(msg);
      }
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-semibold animate-pulse">
          Cargando registros de bitácora...
        </p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Encabezado Estilo Vales */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-indigo-600" size={32} />
            Bitácora de Auditoría
          </h1>
          <p className="text-slate-500 font-medium">
            Registro histórico y trazabilidad de los movimientos de inventario.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95"
          >
            <FileSpreadsheet size={20} /> Exportar Excel
          </button>
          <Link
            href="/dashboard/bitacora/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Nuevo Registro
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
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
          size={20}
        />
        <input
          type="text"
          placeholder="Buscar por producto, SKU, área, edificio u observaciones..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Tabla de Datos Estilo Vales */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <DataTable
          columns={[
            {
              key: "id_bitacora",
              label: "ID",
              render: (item) => (
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-mono text-xs font-bold border border-slate-200">
                  #{item.id_bitacora.toString().padStart(3, "0")}
                </span>
              ),
            },
            {
              key: "fecha_reporte",
              label: "FECHA",
              render: (item) => (
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={15} className="text-indigo-500 flex-shrink-0" />
                  <span className="text-xs font-semibold">
                    {item.fecha_reporte
                      ? new Date(item.fecha_reporte).toLocaleString()
                      : "Sin Fecha"}
                  </span>
                </div>
              ),
            },
            {
              key: "producto",
              label: "PRODUCTO",
              render: (item) => (
                <div className="flex items-start gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0 mt-0.5">
                    <Package size={16} />
                  </div>
                  <div>
                    <span className="text-sm font-extrabold text-slate-800 tracking-tight block">
                      {item.vale?.producto?.nombre_producto || "Producto no asignado"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      SKU: {item.vale?.producto?.sku || "N/A"}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              key: "ubicacion",
              label: "ÁREA / EDIFICIO",
              render: (item) => (
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      {item.vale?.area?.nombre || "Sin área"}
                    </span>
                    <span className="text-xs text-slate-400 block">
                      {item.vale?.area?.edificio?.nombre || "Sin edificio"}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              key: "observaciones",
              label: "OBSERVACIONES",
              render: (item) => (
                <div className="flex items-start gap-2 max-w-xs">
                  <TextCursorInput size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-slate-600 leading-relaxed font-medium italic truncate">
                    {item.observaciones ? (
                      `"${item.observaciones}"`
                    ) : (
                      <span className="text-slate-400 not-italic">Sin observaciones</span>
                    )}
                  </p>
                </div>
              ),
            },
          ]}
          data={paginatedData}
          onEdit={(item) => router.push(`/dashboard/bitacora/edit/${item.id_bitacora}`)}
          onDelete={(item) => handleDelete(item)}
        />

        {/* Paginación Estilo Vales */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando <span className="text-indigo-600 font-bold">{paginatedData.length}</span> de{" "}
            <span className="font-bold">{filteredData.length}</span> registros registrados
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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