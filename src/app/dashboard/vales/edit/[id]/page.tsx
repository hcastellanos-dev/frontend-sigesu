"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Save, 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  AlertCircle, 
  Trash2, 
  Plus,
  Search
} from "lucide-react";

export default function EditValePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id_referencia = Number(resolvedParams.id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Catálogos
  const [productos, setProductos] = useState([]);
  const [areas, setAreas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [valesExistentes, setValesExistentes] = useState<number[]>([]);

  // Datos generales del vale
  const [generalData, setGeneralData] = useState({
    id_area: "",
    id_usuario_entrego: "",
    id_usuario_recibio: "",
    id_usuario_vobo: "",
    estado: "ENTREGADO",
  });

  const [items, setItems] = useState<any[]>([]);
  const [originalIds, setOriginalIds] = useState<number[]>([]);
  
  const [busquedas, setBusquedas] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resVale, resProd, resArea, resUser, resTodos] = await Promise.all([
          api.get(`/vales/${id_referencia}`),
          api.get("/productos"),
          api.get("/areas"),
          api.get("/usuarios"),
          api.get("/vales")
        ]);

        const valeBase = resVale.data;
        setProductos(resProd.data);
        setAreas(resArea.data);
        setUsuarios(resUser.data);

        // Guardamos los IDs de productos ya asignados en el sistema
        const idsAsignados = resTodos.data.map((v: any) => v.id_producto);
        setValesExistentes(idsAsignados);

        const fechaRef = new Date(valeBase.fecha_entrega).toISOString().slice(0, 16);
        
        const grupoVales = resTodos.data.filter((v: any) => {
          const fechaV = new Date(v.fecha_entrega).toISOString().slice(0, 16);
          return (
            v.id_usuario_recibio === valeBase.id_usuario_recibio &&
            v.id_area === valeBase.id_area &&
            fechaV === fechaRef
          );
        });

        setGeneralData({
          id_area: valeBase.id_area.toString(),
          id_usuario_entrego: valeBase.id_usuario_entrego.toString(),
          id_usuario_recibio: valeBase.id_usuario_recibio.toString(),
          id_usuario_vobo: valeBase.id_usuario_vobo.toString(),
          estado: valeBase.estado || "ENTREGADO",
        });

        const itemsMapeados = grupoVales.map((v: any) => ({
          id_vale: v.id_vale,
          id_producto: v.id_producto.toString(),
          cantidad: v.cantidad,
          unidad: v.unidad || "PZA"
        }));

        setItems(itemsMapeados);
        setOriginalIds(itemsMapeados.map((i: any) => i.id_vale));
        setBusquedas(new Array(itemsMapeados.length).fill(""));

      } catch (err) {
        setError("Error al cargar los datos del vale de resguardo.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_referencia]);

  const handleChangeGeneral = (e: any) => {
    const { name, value } = e.target;
    setGeneralData(prev => ({ ...prev, [name]: value }));
  };

  const addItem = () => {
    setItems([...items, { id_vale: null, id_producto: "", cantidad: 1, unidad: "PZA" }]);
    setBusquedas([...busquedas, ""]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      setBusquedas(busquedas.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleBusquedaChange = (index: number, value: string) => {
    const newBusquedas = [...busquedas];
    newBusquedas[index] = value;
    setBusquedas(newBusquedas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const currentIds = items.map(i => i.id_vale).filter(id => id !== null);
      const idsToDelete = originalIds.filter(id => !currentIds.includes(id));
      if (idsToDelete.length > 0) {
        await Promise.all(idsToDelete.map(id => api.delete(`/vales/${id}`)));
      }

      const nuevaFecha = new Date().toISOString();

      const promesas = items.map(item => {
        const payload = {
          cantidad: parseInt(item.cantidad),
          unidad: item.unidad,
          id_producto: parseInt(item.id_producto),
          id_area: parseInt(generalData.id_area),
          id_usuario_entrego: parseInt(generalData.id_usuario_entrego),
          id_usuario_recibio: parseInt(generalData.id_usuario_recibio),
          id_usuario_vobo: parseInt(generalData.id_usuario_vobo),
          estado: generalData.estado,
          fecha_entrega: nuevaFecha
        };

        return item.id_vale 
          ? api.patch(`/vales/${item.id_vale}`, payload)
          : api.post(`/vales`, payload);
      });

      await Promise.all(promesas);
      router.push("/dashboard/vales");
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || "No se pudieron guardar los cambios.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSaving(false);
    }
  };

  // Filtrado avanzado solicitado
  const getProductosFiltrados = (termino: string, idProductoActual: string) => {
    const lowerTerm = termino.toLowerCase();
    
    return productos.filter((p: any) => {
      // 1. Debe coincidir con la búsqueda (si existe)
      const matchesSearch = !termino || (
        p.nombre_producto?.toLowerCase().includes(lowerTerm) ||
        p.marca?.toLowerCase().includes(lowerTerm) ||
        p.modelo?.toLowerCase().includes(lowerTerm) ||
        p.sku?.toLowerCase().includes(lowerTerm)
      );

      // 2. No debe estar en otros vales (permitir si es el que ya tiene seleccionado esta fila)
      const isNotAssigned = !valesExistentes.includes(p.id_producto) || p.id_producto.toString() === idProductoActual;

      // 3. Debe tener stock disponible
      const hasStock = p.cantidad_disponible > 0;

      return matchesSearch && isNotAssigned && hasStock;
    });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold animate-pulse">Recuperando vale de resguardo...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <button onClick={() => router.back()} className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2">
            <ArrowLeft size={20} /> Volver a la lista
          </button>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Editar Vale: <span className="text-indigo-600 font-mono">#{id_referencia}</span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: RESPONSABLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <User className="text-indigo-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Responsables del Resguardo</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Quien Recibe (Resguardante)</label>
                <select required name="id_usuario_recibio" value={generalData.id_usuario_recibio} onChange={handleChangeGeneral}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700">
                  {usuarios.map((u: any) => (
                    <option key={u.id_usuario} value={u.id_usuario}>
                      {u.nombre} {u.apellido_paterno} {u.apellido_materno || ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Entrega</label>
                  <select required name="id_usuario_entrego" value={generalData.id_usuario_entrego} onChange={handleChangeGeneral}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold">
                    {usuarios.map((u: any) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre} {u.apellido_paterno}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Vo.Bo.</label>
                  <select required name="id_usuario_vobo" value={generalData.id_usuario_vobo} onChange={handleChangeGeneral}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold">
                    {usuarios.map((u: any) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nombre} {u.apellido_paterno}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <MapPin className="text-emerald-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Ubicación y Estado</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Área Destino</label>
                <select required name="id_area" value={generalData.id_area} onChange={handleChangeGeneral}
                  className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-800">
                  {areas.map((a: any) => <option key={a.id_area} value={a.id_area}>{a.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Estado del Vale</label>
                <select name="estado" value={generalData.estado} onChange={handleChangeGeneral}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-indigo-600">
                  <option value="ENTREGADO">📦 ENTREGADO</option>
                  <option value="PENDIENTE">⏳ PENDIENTE</option>
                  <option value="CANCELADO">🚫 CANCELADO</option>
                  <option value="DEVUELTO">↩️ DEVUELTO</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: LISTA DE EQUIPOS */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="text-amber-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Equipos Asignados</h2>
            </div>
            <button type="button" onClick={addItem} 
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-black text-xs hover:bg-indigo-100 transition-colors">
              <Plus size={16} /> AGREGAR OTRO EQUIPO
            </button>
          </div>

          <div className="space-y-6">
            {items.map((item, index) => (
              <div key={index} className="space-y-2 p-6 bg-slate-50 border border-slate-200 rounded-3xl relative group">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                  
                  {/* Buscador de Producto */}
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-black text-indigo-500 uppercase flex items-center gap-1">
                      <Search size={10} /> Filtrar Catálogo
                    </label>
                    <input 
                      type="text" 
                      placeholder="SKU, Marca..."
                      value={busquedas[index]}
                      onChange={(e) => handleBusquedaChange(index, e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {/* Selector de Producto con Formato y Filtros */}
                  <div className="md:col-span-5 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Seleccionar Equipo Disponible *</label>
                    <select required value={item.id_producto} onChange={(e) => updateItem(index, "id_producto", e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                      <option value="">Seleccionar equipo...</option>
                      {getProductosFiltrados(busquedas[index], item.id_producto).map((p: any) => (
                        <option key={p.id_producto} value={p.id_producto}>
                          {p.marca} {p.modelo} ({p.nombre_producto}, {p.sku || 'S/SKU'}) - {p.cantidad_disponible}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-1 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase text-center block">Cant.</label>
                    <input type="number" min="1" value={item.cantidad} onChange={(e) => updateItem(index, "cantidad", e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl font-black text-center" />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase text-center block">Unidad</label>
                    <input value={item.unidad} onChange={(e) => updateItem(index, "unidad", e.target.value)}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl font-bold text-center uppercase" />
                  </div>

                  <div className="md:col-span-1">
                    <button type="button" onClick={() => removeItem(index)}
                      className="w-full p-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all flex justify-center">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACCIONES FINALES */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pb-12">
          <button type="button" onClick={() => router.push("/dashboard/vales")} 
            className="px-8 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">
            Descartar cambios
          </button>
          <button type="submit" disabled={saving} 
            className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50">
            {saving ? "Actualizando..." : <><Save size={20} /> Guardar Cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
}