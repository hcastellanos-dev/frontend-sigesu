"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api"; // Usamos tu instancia de axios configurada
import { ClipboardList, Search, Edit, Calendar, Loader2 } from "lucide-react";

export default function BitacoraListPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bitacora");
      // Validación defensiva: si no es array, ponemos array vacío
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar bitácora", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrado seguro con encadenamiento opcional (?.)
  const filteredData = data.filter((item: any) =>
    item.vale?.producto?.nombre_producto?.toLowerCase().includes(filter.toLowerCase()) ||
    item.observaciones?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <ClipboardList className="text-blue-600" /> Bitácora de Auditoría
          </h1>
          <p className="text-gray-500">Registro histórico de movimientos de inventario</p>
        </div>
      </div>

      <div className="flex items-center bg-white p-4 rounded-lg shadow-sm gap-4 border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por producto u observación..."
            className="w-full pl-10 pr-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Producto</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Área / Edificio</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Observaciones</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin" />
                    Cargando registros...
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400 italic">
                  No se encontraron registros.
                </td>
              </tr>
            ) : (
              filteredData.map((item: any) => (
                <tr key={item.id_bitacora} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400" />
                      {new Date(item.fecha_reporte).toLocaleString()}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <div className="font-semibold text-slate-800">{item.vale?.producto?.nombre_producto}</div>
                    <div className="text-xs text-slate-400">SKU: {item.vale?.producto?.sku}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {item.vale?.area?.nombre}
                    <span className="block text-xs text-slate-400">{item.vale?.area?.edificio?.nombre}</span>
                  </td>
                  <td className="p-4 text-sm italic text-slate-500 max-w-xs truncate">
                    "{item.observaciones}"
                  </td>
                  <td className="p-4 text-center">
                    <Link 
                      href={`/dashboard/bitacora/edit/${item.id_bitacora}`} 
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
