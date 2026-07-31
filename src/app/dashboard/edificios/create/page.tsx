"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import { 
  Building2, 
  Map, 
  FileText, 
  Save, 
  ArrowLeft, 
  AlertCircle 
} from "lucide-react";

export default function CreateEdificioPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    planta: "una", // Valor inicial por defecto
    descripcion: "",
  });

  // Manejador de cambios genérico para Input, Select y Textarea
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Forzamos mayúsculas solo en el nombre
    const finalValue = name === "nombre" ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        planta: formData.planta, // Enviará "una" o "dos"
        descripcion: formData.descripcion.trim() || null,
      };

      await api.post("/edificios", payload);
      router.push("/dashboard/edificios");
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Error al registrar el edificio.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Estilo Vales */}
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2"
          >
            <ArrowLeft size={20} /> Volver
          </button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Registrar Edificio</h1>
          <p className="text-slate-500 text-sm">Configure una nueva ubicación física para las áreas.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold animate-shake">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECCIÓN ÚNICA: DATOS GENERALES */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Building2 className="text-indigo-500" size={20} />
            <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Información Estructural</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre del Edificio */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">
                Nombre del Edificio
              </label>
              <input
                required
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="EJ. EDIFICIO A"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all uppercase"
              />
              <p className="text-[10px] text-slate-400 ml-1">Mínimo 3 caracteres.</p>
            </div>

            {/* Planta / Nivel (Combobox) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1 flex items-center gap-1">
                <Map size={14} /> Niveles del Edificio
              </label>
              <select
                required
                name="planta"
                value={formData.planta}
                onChange={handleChange}
                className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer appearance-none"
              >
                <option value="una">Una planta (P.B.)</option>
                <option value="dos">Dos plantas (P.B. y P.A.)</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase ml-1 flex items-center gap-1">
              <FileText size={14} /> Descripción Adicional
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={4}
              placeholder="Notas opcionales sobre el edificio..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600 resize-none transition-all"
            />
          </div>
        </div>

        {/* Acciones Finales */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pb-12">
          <Link
            href="/dashboard/edificios"
            className="px-8 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all text-center"
          >
            Cancelar
          </Link>
          
          <button
            type="submit"
            disabled={saving}
            className={`px-12 py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
              saving 
                ? "bg-slate-400 text-white cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 shadow-lg"
            }`}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Registrando...
              </>
            ) : (
              <>
                <Save size={20} /> Guardar Edificio
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}