"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { AreaService } from "@/services/area.service";
import { EdificioService } from "@/services/edificio.service";
import { 
  Save, ArrowLeft, Layout, FileText, MapPin, AlertCircle 
} from "lucide-react";

export default function EditAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = Number(resolvedParams.id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [edificios, setEdificios] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    id_edificio: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Carga paralela de dependencias y datos del registro
        const [resEdificios, resArea] = await Promise.all([
          EdificioService.findAll(),
          AreaService.findOne(id)
        ]);

        setEdificios(resEdificios);
        setFormData({
          nombre: resArea.nombre,
          descripcion: resArea.descripcion || "",
          id_edificio: resArea.id_edificio.toString(),
        });
      } catch (err: any) {
        setError("No se pudo cargar la información del área o los edificios.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      // Mismo patrón: Limpieza de datos antes de enviar
      const payload = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        id_edificio: parseInt(formData.id_edificio),
      };

      await AreaService.update(id, payload);
      
      router.push("/dashboard/areas");
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
      <p className="text-slate-500 font-bold animate-pulse">Sincronizando ubicación...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Estilo Productos */}
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2"
          >
            <ArrowLeft size={20} /> Volver a Áreas
          </button>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Editar Área: <span className="text-indigo-600">{formData.nombre}</span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS GENERALES */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Layout className="text-indigo-500" size={20} />
            <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Información General</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Nombre del Área / Depto</label>
              <input 
                required 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Edificio Asignado</label>
              <div className="relative">
                <select 
                  required 
                  name="id_edificio" 
                  value={formData.id_edificio} 
                  onChange={handleChange}
                  className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none font-bold text-indigo-700 appearance-none"
                >
                  <option value="">Seleccione un edificio...</option>
                  {edificios.map((ed: any) => (
                    <option key={ed.id_edificio} value={ed.id_edificio}>
                      🏢 {ed.nombre} {ed.planta ? `(${ed.planta})` : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MapPin size={18} className="text-indigo-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase ml-1">
              <FileText size={14} /> Notas o Descripción
            </div>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange}
              rows={4}
              placeholder="Describa la función o ubicación específica del área..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600 resize-none"
            />
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pb-12">
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/areas")} 
            className="px-8 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
          >
            Descartar
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