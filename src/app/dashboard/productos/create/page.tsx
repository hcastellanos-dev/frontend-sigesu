"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Save, ArrowLeft, BarChart4, AlertCircle, Layout, Database, FileText, PlusCircle 
} from "lucide-react";

export default function CreateProductoPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    sku: "",
    codigo_barra: "",
    nombre_producto: "",
    descripcion: "",
    id_categoria: "",
    id_proveedor: "",
    unidad_medida: "PZA",
    cantidad_disponible: 0,
    cantidad_minima: 0,
    ubicacion_almacen: "",
    fecha_caducidad: "",
    costo_unitario: 0,
    precio_venta: 0,
    moneda: "MXN",
    estado: "ACTIVO",
    estado_fisico: "BUENO",
    composicion: "OTROS",
    area_movimiento: "ALTA",
    modelo: "",
    marca: ""
  });

  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        setLoading(true);
        const [resCat, resProv] = await Promise.all([
          api.get("/categorias"),
          api.get("/proveedores")
        ]);
        setCategorias(resCat.data);
        setProveedores(resProv.data);
      } catch (err) {
        setError("Error al cargar los catálogos de categorías y proveedores.");
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogos();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      
      // Transformación de datos para cumplir con el esquema (Prisma/PostgreSQL)
      const payload = {
        ...formData,
        sku: formData.sku || null,
        codigo_barra: formData.codigo_barra || null,
        id_categoria: parseInt(formData.id_categoria),
        id_proveedor: parseInt(formData.id_proveedor),
        cantidad_disponible: parseInt(formData.cantidad_disponible.toString()),
        cantidad_minima: parseInt(formData.cantidad_minima.toString()),
        costo_unitario: parseFloat(formData.costo_unitario.toString()),
        precio_venta: parseFloat(formData.precio_venta.toString()),
        fecha_caducidad: formData.fecha_caducidad ? new Date(formData.fecha_caducidad).toISOString() : null,
        descripcion: formData.descripcion || null,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        ubicacion_almacen: formData.ubicacion_almacen || null,
      };

      await api.post("/productos", payload);
      router.push("/dashboard/productos");
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || "No se pudo registrar el nuevo producto.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold animate-pulse">Preparando formulario de registro...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2">
            <ArrowLeft size={20} /> Volver al inventario
          </button>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <PlusCircle className="text-indigo-600" size={32} /> Registrar Nuevo Producto
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: IDENTIFICACIÓN PRINCIPAL */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Layout className="text-indigo-500" size={20} />
            <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Información de Identificación</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Nombre del Producto *</label>
              <input required name="nombre_producto" value={formData.nombre_producto} onChange={handleChange}
                placeholder="Ej. Laptop Dell Latitude 3420"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">SKU / Clave Interna</label>
              <input name="sku" value={formData.sku} onChange={handleChange}
                placeholder="Opcional"
                className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none font-mono font-bold text-indigo-700 placeholder:text-indigo-300" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase ml-1">
              <FileText size={14} /> Descripción del Activo
            </div>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange}
              rows={3}
              placeholder="Características técnicas, estado inicial o notas..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Marca</label>
              <input name="marca" value={formData.marca} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Modelo</label>
              <input name="modelo" value={formData.modelo} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Código Barras</label>
              <input name="codigo_barra" value={formData.codigo_barra} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">U. Medida</label>
              <input name="unidad_medida" value={formData.unidad_medida} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl uppercase font-bold text-center" />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2 y 3: ATRIBUTOS Y FINANZAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Físico y Movimiento */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Database className="text-amber-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Estado y Composición</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Estado Físico</label>
                <select name="estado_fisico" value={formData.estado_fisico} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                  <option value="BUENO">✅ BUENO</option>
                  <option value="REGULAR">⚠️ REGULAR</option>
                  <option value="MALO">❌ MALO</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Composición</label>
                <select name="composicion" value={formData.composicion} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                  <option value="METAL">METAL</option>
                  <option value="MADERA">MADERA</option>
                  <option value="PLASTICO">PLASTICO</option>
                  <option value="OTROS">OTROS</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Movimiento</label>
                <select name="area_movimiento" value={formData.area_movimiento} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                  <option value="ALTA">ALTA</option>
                  <option value="BAJA">BAJA</option>
                  <option value="TRASPASO">TRASPASO</option>
                  <option value="CAMBIO">CAMBIO</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Moneda</label>
                <select name="moneda" value={formData.moneda} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                  <option value="MXN">MXN - Pesos</option>
                  <option value="USD">USD - Dólares</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stock y Costos */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <BarChart4 className="text-emerald-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Inventario y Precios</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Stock Inicial</label>
                <input type="number" name="cantidad_disponible" value={formData.cantidad_disponible} onChange={handleChange} className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-2xl font-black text-emerald-700" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Alerta Stock Mínimo</label>
                <input type="number" name="cantidad_minima" value={formData.cantidad_minima} onChange={handleChange} className="w-full p-4 bg-rose-50 border border-rose-100 rounded-2xl font-black text-rose-700" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Costo Unitario</label>
                <input type="number" step="0.01" name="costo_unitario" value={formData.costo_unitario} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Precio Venta</label>
                <input type="number" step="0.01" name="precio_venta" value={formData.precio_venta} onChange={handleChange} className="w-full p-4 bg-indigo-50 border border-indigo-200 rounded-2xl font-black text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: ASIGNACIÓN Y UBICACIÓN */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">Categoría *</label>
            <select required name="id_categoria" value={formData.id_categoria} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
              <option value="">Seleccionar...</option>
              {categorias.map((c: any) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">Proveedor *</label>
            <select required name="id_proveedor" value={formData.id_proveedor} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
              <option value="">Seleccionar...</option>
              {proveedores.map((p: any) => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">Pasillo / Estante</label>
            <input name="ubicacion_almacen" value={formData.ubicacion_almacen} onChange={handleChange} placeholder="Ej. A-12" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">Fecha Caducidad</label>
            <input type="date" name="fecha_caducidad" value={formData.fecha_caducidad} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium" />
          </div>
        </div>

        {/* ACCIONES FINAL */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pb-12">
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/productos")} 
            className="px-8 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
          >
            Descartar registro
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Registrando...
              </>
            ) : (
              <>
                <Save size={20} /> Crear Producto
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}