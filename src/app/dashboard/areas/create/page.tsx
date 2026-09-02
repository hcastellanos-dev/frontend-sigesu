"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AreaService } from "@/services/area.service";
import { EdificioService } from "@/services/edificio.service";
import { 
  Save, 
  ArrowLeft, 
  Building2, 
  FileText, 
  AlertCircle, 
  MapPin,
  Layers
} from "lucide-react";

interface Edificio {
  id_edificio: number;
  nombre: string;
  planta?: string;
}

export default function CreateAreaPage() {
  const router = useRouter();
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    id_edificio: "",
  });

  // Cargar edificios para el select
  useEffect(() => {
    const fetchEdificios = async () => {
      try {
        const data = await EdificioService.findAll();
        setEdificios(data);
      } catch (err) {
        console.error("Error al cargar edificios", err);
        setError("No se pudieron cargar los edificios. Verifique su conexión.");
      }
    };
    fetchEdificios();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!formData.id_edificio) {
        throw new Error("Debe seleccionar un edificio de la lista.");
      }

      await AreaService.create({
        ...formData,
        id_edificio: Number(formData.id_edificio),
      });

      router.push("/dashboard/areas");
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error al registrar el área.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Estilo Sigesu */}
      <div className="flex justify-between items-center">
        <div>
          <button 
            type="button"
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2 cursor-pointer"
          >
            <ArrowLeft size={20} /> Volver
          </button>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Crear <span className="text-indigo-600">Nueva Área</span>
          </h1>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold">
          <AlertCircle size={24} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta de Ubicación e Identificación */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Building2 className="text-indigo-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Ubicación e Identificación</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Nombre del Área</label>
                <input 
                  required 
                  type="text"
                  name="nombre" 
                  placeholder="EJ: DEPARTAMENTO DE TI"
                  value={formData.nombre} 
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Edificio / Ubicación</label>
                <div className="relative">
                  <select 
                    required 
                    name="id_edificio" 
                    value={formData.id_edificio} 
                    onChange={handleChange}
                    className="w-full p-4 pr-12 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-800 appearance-none"
                  >
                    <option value="">Seleccione un edificio...</option>
                    {edificios.map((ed) => (
                      <option key={ed.id_edificio} value={ed.id_edificio}>
                        {ed.nombre} {ed.planta ? `- ${ed.planta}` : ""}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                    <MapPin size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Descripción de Funciones */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <FileText className="text-emerald-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Información Adicional</h2>
            </div>
            
            <div className="space-y-2 flex-1 flex flex-col">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Descripción de Funciones</label>
              <textarea 
                name="descripcion" 
                rows={5}
                placeholder="Breve descripción de las funciones de esta área..."
                value={formData.descripcion} 
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 resize-none flex-1"
              />
            </div>
          </div>
        </div>

        {/* Acciones del Formulario */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/areas")} 
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
                <Save size={20} /> Crear Área
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}