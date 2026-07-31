"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import DataTable from "@/components/dashboard/DataTable";
import Link from "next/link";
import * as XLSX from "xlsx";
import { 
  Plus, 
  Search, 
  Box, 
  FileSpreadsheet, 
  ChevronLeft, 
  ChevronRight, 
  Filter,
  AlertCircle
} from "lucide-react";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [search, setSearch] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const router = useRouter();

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [resProd, resCat] = await Promise.all([
        api.get("/productos"),
        api.get("/categorias")
      ]);
      setProductos(resProd.data);
      setCategorias(resCat.data);
    } catch (err) {
      setError("No se pudo cargar la lista de productos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProductos = useMemo(() => {
    return productos.filter((p: any) => {
      const matchesSearch = 
        (p.nombre_producto || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.marca || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategoria === "" || String(p.id_categoria) === selectedCategoria;

      return matchesSearch && matchesCategory;
    });
  }, [productos, search, selectedCategoria]);

  const totalPages = Math.ceil(filteredProductos.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProductos.slice(start, start + itemsPerPage);
  }, [filteredProductos, currentPage]);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      await api.delete(`/productos/${id}`);
      loadData();
    } catch (err) {
      alert("Error al eliminar el producto.");
    }
  };

  const exportToExcel = () => {
    // --- CÓDIGO NUEVO: Verificación de datos antes de exportar ---
    if (filteredProductos.length === 0) return alert("No hay datos para exportar");
    // -------------------------------------------------------------

    const dataToExport = filteredProductos.map((p: any) => ({
      "ID": p.id_producto,
      "SKU": p.sku || "N/A",
      "CÓDIGO BARRAS": p.codigo_barra || "N/A",
      "PRODUCTO": p.nombre_producto,
      "DESCRIPCIÓN": p.descripcion || "",
      "CATEGORÍA": p.categoria?.nombre || "N/A",
      "PROVEEDOR": p.proveedor?.nombre || "N/A",
      "MARCA": p.marca || "N/A",
      "MODELO": p.modelo || "N/A",
      "U. MEDIDA": p.unidad_medida || "PZ",
      "CANT. DISPONIBLE": p.cantidad_disponible,
      "CANT. MÍNIMA": p.cantidad_minima,
      "COSTO UNITARIO": p.costo_unitario ? `$${p.costo_unitario}` : "$0.00",
      "PRECIO VENTA": p.precio_venta ? `$${p.precio_venta}` : "$0.00",
      "MONEDA": p.moneda || "MXN",
      "UBICACIÓN": p.ubicacion_almacen || "ALMACÉN",
      "ESTADO FÍSICO": p.estado_fisico || "BUENO",
      "COMPOSICIÓN": p.composicion || "OTROS",
      "ESTATUS MOVIMIENTO": p.area_movimiento || "ALTA",
      "ESTADO LÓGICO": p.estado || "ACTIVO",
      "FECHA CREACIÓN": p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString() : "N/A", // --- CÓDIGO NUEVO: Validación de fecha ---
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
    
    const maxWidths = Object.keys(dataToExport[0] || {}).map(key => ({ wch: key.length + 5 }));
    worksheet["!cols"] = maxWidths;

    XLSX.writeFile(workbook, `Inventario_Productos_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-semibold animate-pulse">Cargando inventario de productos...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Box className="text-indigo-600" size={32} />
            </div>
            Inventario de Productos
          </h1>
          <p className="text-slate-500 font-medium">Gestión de activos, existencias y control de almacén.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={exportToExcel} 
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <FileSpreadsheet size={20} /> Exportar Excel
          </button>
          <Link 
            href="/dashboard/productos/create" 
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU, marca o modelo..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none font-semibold text-slate-700 cursor-pointer"
            value={selectedCategoria}
            onChange={(e) => { setSelectedCategoria(e.target.value); setCurrentPage(1); }}
          >
            <option value="">Todas las Categorías</option>
            {categorias.map((c: any) => (
              <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <DataTable
          columns={[
            { 
              key: "nombre_producto", 
              label: "PRODUCTO / IDENTIFICACIÓN",
              render: (item) => (
                <div className="flex flex-col py-2">
                  <span className="font-extrabold text-slate-800 text-sm">{item.nombre_producto}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-mono font-bold border border-slate-200">
                      SKU: {item.sku || 'S/N'}
                    </span>
                    {item.marca && (
                      <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider">{item.marca}</span>
                    )}
                  </div>
                </div>
              )
            },
            {
              key: "modelo",
              label: "DETALLES TÉCNICOS",
              render: (item) => (
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-slate-700">{item.modelo || "Genérico"}</span>
                   <span className="text-[10px] text-slate-400 font-medium italic">{item.categoria?.nombre}</span>
                </div>
              )
            },
            { 
              key: "estado_fisico", 
              label: "ESTADO FÍSICO",
              render: (item) => {
                const colores: any = {
                  BUENO: "bg-emerald-100 text-emerald-700 border-emerald-200",
                  REGULAR: "bg-amber-100 text-amber-700 border-amber-200",
                  MALO: "bg-rose-100 text-rose-700 border-rose-200",
                };
                return (
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${colores[item.estado_fisico] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                    {item.estado_fisico}
                  </span>
                );
              }
            },
            { 
              key: "cantidad_disponible", 
              label: "STOCK",
              render: (item) => {
                const isLow = item.cantidad_disponible <= (item.cantidad_minima || 0);
                return (
                  <div className="flex flex-col items-center justify-center">
                    <span className={`text-lg font-black leading-none ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                      {item.cantidad_disponible}
                    </span>
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1">
                      {item.unidad_medida || 'PZA'}
                    </span>
                  </div>
                );
              }
            },
            { 
              key: "area_movimiento", 
              label: "ESTATUS",
              render: (item) => (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.area_movimiento}</span>
                  <span className={`text-[9px] font-medium ${item.estado === 'ACTIVO' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    ● {item.estado}
                  </span>
                </div>
              )
            },
          ]}
          data={paginatedData}
          onEdit={(item) => router.push(`/dashboard/productos/edit/${item.id_producto}`)}
          onDelete={(item) => handleDelete(item.id_producto)}
        />
        
        {error && (
          <div className="p-8 flex flex-col items-center justify-center text-rose-500 bg-rose-50">
            <AlertCircle size={40} className="mb-2" />
            <p className="font-bold">{error}</p>
          </div>
        )}

        {!loading && filteredProductos.length === 0 && (
          <div className="p-20 text-center">
            <Box size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium italic">No se encontraron productos con los criterios de búsqueda.</p>
          </div>
        )}

        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando <span className="text-indigo-600 font-bold">{paginatedData.length}</span> de <span className="font-bold">{filteredProductos.length}</span> productos
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 transition-all text-slate-600 shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
               <span className="text-xs font-bold text-slate-400 mr-2">PÁGINA</span>
               <span className="text-sm font-black text-indigo-600">{currentPage}</span>
               <span className="text-xs font-bold text-slate-400 mx-2">DE</span>
               <span className="text-sm font-black text-slate-700">{totalPages || 1}</span>
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-40 transition-all text-slate-600 shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}