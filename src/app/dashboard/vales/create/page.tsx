"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Save, ArrowLeft, PlusCircle, Package, Users, MapPin, Trash2, Plus, Info 
} from "lucide-react";

export default function CreateValePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [productos, setProductos] = useState([]);
  const [valesExistentes, setValesExistentes] = useState<number[]>([]);
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([""]);

  const [generalData, setGeneralData] = useState({
    id_area: "",
    id_usuario_entrego: "",
    id_usuario_recibio: "",
    id_usuario_vobo: "",
    estado: "ENTREGADO"
  });

  const [items, setItems] = useState([
    { id_producto: "", cantidad: 1, unidad: "PZA" }
  ]);

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [p, a, u, v] = await Promise.all([
          api.get("/productos"),
          api.get("/areas"),
          api.get("/usuarios"),
          api.get("/vales")
        ]);

        const idsAsignados = v.data.map((vale: any) => vale.id_producto);
        
        setProductos(p.data);
        setValesExistentes(idsAsignados);
        setAreas(a.data);
        setUsuarios(u.data);
      } catch (err) {
        console.error("Error al cargar catálogos", err);
      } finally {
        setLoading(false);
      }
    };
    loadCatalogs();
  }, []);

  const addItem = () => {
    setItems([...items, { id_producto: "", cantidad: 1, unidad: "PZA" }]);
    setSearchTerms([...searchTerms, ""]);
  };
  
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      setSearchTerms(searchTerms.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const updateSearch = (index: number, value: string) => {
    const newSearch = [...searchTerms];
    newSearch[index] = value;
    setSearchTerms(newSearch);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        items: items.map(item => ({
          ...generalData,
          ...item,
          id_producto: Number(item.id_producto),
          id_area: Number(generalData.id_area),
          id_usuario_entrego: Number(generalData.id_usuario_entrego),
          id_usuario_recibio: Number(generalData.id_usuario_recibio),
          id_usuario_vobo: Number(generalData.id_usuario_vobo),
        }))
      };

      await api.post("/vales/bulk", payload);
      router.push("/dashboard/vales");
      router.refresh();
    } catch (err: any) {
      alert(err.response?.data?.message || "Error al procesar el vale.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold animate-pulse">Preparando formulario de vales...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2">
            <ArrowLeft size={20} /> Volver a vales
          </button>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <PlusCircle className="text-indigo-600" size={32} /> Generar Vale de Resguardo
          </h1>
          <p className="text-slate-500 font-medium ml-11">Asigne activos disponibles a un responsable.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="text-indigo-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Equipos y Mobiliario (Disponibles)</h2>
            </div>
            <button 
              type="button" 
              onClick={addItem} 
              className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-100 transition-colors text-sm"
            >
              <Plus size={18} /> Agregar Fila
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const filteredProducts = productos.filter((p: any) => {
                const term = searchTerms[index].toLowerCase();
                const isNotAssigned = !valesExistentes.includes(p.id_producto);
                const hasStock = p.cantidad_disponible > 0;
                const matchesSearch = (
                  p.sku?.toLowerCase().includes(term) ||
                  p.nombre_producto?.toLowerCase().includes(term) ||
                  p.marca?.toLowerCase().includes(term) ||
                  p.modelo?.toLowerCase().includes(term)
                );

                return isNotAssigned && hasStock && matchesSearch;
              });

              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 items-end group relative">
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Filtrar Producto</label>
                    <input 
                      type="text"
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-medium"
                      placeholder="Ingrese SKU o Marca..."
                      value={searchTerms[index]}
                      onChange={(e) => updateSearch(index, e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-6 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Seleccionar Activo Disponible *</label>
                    <select 
                      required 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-700" 
                      value={item.id_producto} 
                      onChange={(e) => updateItem(index, "id_producto", e.target.value)}
                    >
                      <option value="">Seleccione un producto del catálogo...</option>
                      {filteredProducts.map((p: any) => (
                        <option key={p.id_producto} value={p.id_producto}>
                          {p.marca} {p.modelo} ({p.nombre_producto}, {p.sku || 'S/SKU'}) - {p.cantidad_disponible}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cantidad</label>
                    <input 
                      type="number" 
                      min="1" 
                      required 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-black text-indigo-600 text-center" 
                      value={item.cantidad} 
                      onChange={(e) => updateItem(index, "cantidad", Number(e.target.value))} 
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-center">
                    {items.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeItem(index)} 
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <MapPin className="text-amber-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Destino del Vale</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Área o Departamento *</label>
                <select 
                  required 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={generalData.id_area} 
                  onChange={(e) => setGeneralData({...generalData, id_area: e.target.value})}
                >
                  <option value="">Seleccione el área de destino...</option>
                  {areas.map((a: any) => <option key={a.id_area} value={a.id_area}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Estado del Proceso</label>
                <select 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500" 
                  value={generalData.estado} 
                  onChange={(e) => setGeneralData({...generalData, estado: e.target.value})}
                >
                  <option value="ENTREGADO">✅ ENTREGADO</option>
                  <option value="PENDIENTE">⏳ PENDIENTE</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Info className="text-blue-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Validación</h2>
            </div>
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
              <p className="text-xs text-blue-800 font-medium leading-relaxed">
                El sistema solo muestra equipos que **no están asignados** actualmente a otro resguardo y que cuentan con existencia física en el inventario.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Users className="text-emerald-500" size={20} />
            <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Firmas de Responsabilidad</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Entrega</label>
              <select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={generalData.id_usuario_entrego} onChange={(e) => setGeneralData({...generalData, id_usuario_entrego: e.target.value})}>
                <option value="">Seleccione...</option>
                {usuarios.map((u: any) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} {u.apellido_paterno}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Resguardante</label>
              <select required className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl font-bold" value={generalData.id_usuario_recibio} onChange={(e) => setGeneralData({...generalData, id_usuario_recibio: e.target.value})}>
                <option value="">Seleccione...</option>
                {usuarios.map((u: any) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} {u.apellido_paterno}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Vo.Bo.</label>
              <select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={generalData.id_usuario_vobo} onChange={(e) => setGeneralData({...generalData, id_usuario_vobo: e.target.value})}>
                <option value="">Seleccione...</option>
                {usuarios.map((u: any) => <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} {u.apellido_paterno}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-end gap-4 pb-12">
          <button type="button" onClick={() => router.push("/dashboard/vales")} className="px-8 py-4 font-black text-slate-500">Cancelar</button>
          <button type="submit" disabled={saving} className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl disabled:opacity-50 transition-all">
            {saving ? "Procesando..." : `Generar Vale (${items.length})`}
          </button>
        </div>
      </form>
    </div>
  );
}