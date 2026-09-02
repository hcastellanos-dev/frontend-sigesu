"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Save, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  AlertCircle, 
  Layout,
  Lock
} from "lucide-react";

export default function CreateRolPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    permiso_crud: "R",
    descripcion: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "nombre" ? value.toUpperCase() : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      
      await api.post("/roles", formData);
      
      router.push("/dashboard/roles");
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || "No se pudo crear el rol.";
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
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2"
          >
            <ArrowLeft size={20} /> Volver
          </button>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Crear <span className="text-indigo-600">Nuevo Rol</span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta de Identificación */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <ShieldCheck className="text-indigo-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Identificación</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Nombre del Rol</label>
                <input 
                  required 
                  type="text"
                  name="nombre" 
                  placeholder="EJ: SUPER_ADMIN"
                  value={formData.nombre} 
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Nivel de Acceso (CRUD)</label>
                <div className="relative">
                  <select 
                    required 
                    name="permiso_crud" 
                    value={formData.permiso_crud} 
                    onChange={handleChange}
                    className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-800 appearance-none"
                  >
                    <option value="CRUD">Acceso Total (Escritura/Lectura/Borrado)</option>
                    <option value="CRU">Crear, Leer y Editar (Sin Borrado)</option>
                    <option value="R">Solo Lectura</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                    <Lock size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Detalles */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <FileText className="text-emerald-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Información Adicional</h2>
            </div>
            
            <div className="space-y-2 flex-1">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Descripción de Funciones</label>
              <textarea 
                name="descripcion" 
                rows={5}
                placeholder="Describa los alcances de este perfil..."
                value={formData.descripcion} 
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 resize-none h-full"
              />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/roles")} 
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
                <Save size={20} /> Crear Rol
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}