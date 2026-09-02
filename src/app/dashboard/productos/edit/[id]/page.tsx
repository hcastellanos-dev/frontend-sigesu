"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/services/api";
import { 
  Save, ArrowLeft, BarChart4, AlertCircle, Layout, Database, FileText 
} from "lucide-react";

export default function EditProductoPage() {
  const { id } = useParams();
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
    id_usuario: null as number | null, // Preservamos la autoría del producto
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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resProd, resCat, resProv] = await Promise.all([
          api.get(`/productos/${id}`),
          api.get("/categorias"),
          api.get("/proveedores")
        ]);

        const p = resProd.data;
        const fechaCad = p.fecha_caducidad ? new Date(p.fecha_caducidad).toISOString().split('T')[0] : "";

        setFormData({
          ...p,
          id_usuario: p.id_usuario ?? null, // Retenemos el id_usuario existente
          descripcion: p.descripcion || "",
          id_categoria: p.id_categoria?.toString() || "",
          id_proveedor: p.id_proveedor?.toString() || "",
          fecha_caducidad: fechaCad,
          costo_unitario: Number(p.costo_unitario),
          precio_venta: Number(p.precio_venta)
        });
        
        setCategorias(resCat.data);
        setProveedores(resProv.data);
      } catch (err) {
        setError("Error al cargar los datos del producto.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      
      const payload = {
        sku: formData.sku || null,
        codigo_barra: formData.codigo_barra || null,
        nombre_producto: formData.nombre_producto,
        descripcion: formData.descripcion || null,
        id_categoria: parseInt(formData.id_categoria),
        id_proveedor: parseInt(formData.id_proveedor),
        id_usuario: formData.id_usuario ? Number(formData.id_usuario) : null, // Mantenemos la relación en la actualización
        unidad_medida: formData.unidad_medida,
        cantidad_disponible: parseInt(formData.cantidad_disponible.toString()),
        cantidad_minima: parseInt(formData.cantidad_minima.toString()),
        ubicacion_almacen: formData.ubicacion_almacen || null,
        costo_unitario: parseFloat(formData.costo_unitario.toString()),
        precio_venta: parseFloat(formData.precio_venta.toString()),
        moneda: formData.moneda,
        estado: formData.estado,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        estado_fisico: formData.estado_fisico,
        composicion: formData.composicion,
        area_movimiento: formData.area_movimiento,
        fecha_caducidad: formData.fecha_caducidad ? new Date(formData.fecha_caducidad).toISOString() : null,
      };

      await api.patch(`/productos/${id}`, payload);
      router.push("/dashboard/productos");
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || "No se pudieron guardar los cambios.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold animate-pulse">Sincronizando con el almacén...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2">
            <ArrowLeft size={20} /> Volver
          </button>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
             Editar Activo: <span className="text-indigo-600 font-mono">{formData.sku || "S/N"}</span>
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
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Nombre del Producto</label>
              <input required name="nombre_producto" value={formData.nombre_producto} onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">SKU / ID</label>
              <input name="sku" value={formData.sku || ""} onChange={handleChange}
                className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none font-mono font-bold text-indigo-700" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase ml-1">
              <FileText size={14} /> Descripción del Activo
            </div>
            <textarea 
              name="descripcion" 
              value={formData.descripcion || ""} 
              onChange={handleChange}
              rows={3}
              placeholder="Detalles adicionales..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Marca</label>
              <input name="marca" value={formData.marca || ""} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Modelo</label>
              <input name="modelo" value={formData.modelo || ""} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Código Barras</label>
              <input name="codigo_barra" value={formData.codigo_barra || ""} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">U. Medida</label>
              <input name="unidad_medida" value={formData.unidad_medida} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl uppercase font-bold text-center" />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2 y 3: GRID DOBLE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <label className="text-xs font-black text-slate-500 uppercase">Estado Lógico</label>
                <select name="estado" value={formData.estado} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <BarChart4 className="text-emerald-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Inventario y Finanzas</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Stock Disponible</label>
                <input type="number" name="cantidad_disponible" value={formData.cantidad_disponible} onChange={handleChange} className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-2xl font-black text-emerald-700" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Stock Mínimo</label>
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

        {/* SECCIÓN 4: UBICACIÓN Y ASIGNACIÓN */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">Categoría</label>
            <select required name="id_categoria" value={formData.id_categoria} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
              <option value="">Seleccionar...</option>
              {categorias.map((c: any) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">Proveedor</label>
            <select required name="id_proveedor" value={formData.id_proveedor} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
              <option value="">Seleccionar...</option>
              {proveedores.map((p: any) => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">Ubicación Almacén</label>
            <input name="ubicacion_almacen" value={formData.ubicacion_almacen || ""} onChange={handleChange} placeholder="Ej. Estante A-1" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase">Fecha Caducidad</label>
            <input type="date" name="fecha_caducidad" value={formData.fecha_caducidad} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl" />
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pb-12">
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/productos")} 
            className="px-8 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}