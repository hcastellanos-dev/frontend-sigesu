"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Save, ArrowLeft, Layout, FileText, AlertCircle, Tag 
} from "lucide-react";

export default function EditCategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  // Resolvemos los parámetros asíncronos (Next.js 15)
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  // Cargar los datos actuales de la categoría
  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/categorias/${id}`);
        const { nombre, descripcion } = res.data;
        
        setFormData({
          nombre: nombre || "",
          descripcion: descripcion || "",
        });
      } catch (err: any) {
        setError("No se pudo cargar la información de la categoría.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoria();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Aplicando la lógica de "payload limpio" del diseño de productos
      const payload = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
      };

      await api.patch(`/categorias/${id}`, payload);
      router.push("/dashboard/categorias");
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
      <p className="text-slate-500 font-bold animate-pulse">Obteniendo clasificación...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2"
          >
            <ArrowLeft size={20} /> Volver
          </button>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Editar Categoría: <span className="text-indigo-600 font-mono uppercase">{formData.nombre || "..."}</span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN ÚNICA: DATOS DE LA CATEGORÍA */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Tag className="text-indigo-500" size={20} />
            <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Información General</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase ml-1">Nombre de la Categoría</label>
            <input 
              required 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange}
              placeholder="Ej. Equipo de Cómputo"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase ml-1">
              <FileText size={14} /> Descripción de la Clasificación
            </div>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange}
              rows={5}
              placeholder="Describe qué tipos de productos pertenecen a esta categoría..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600 resize-none transition-all"
            />
          </div>
        </div>

        {/* ACCIONES (Estilo unificado con Dashboard) */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pb-12">
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/categorias")} 
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