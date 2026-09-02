"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Save, ArrowLeft, ShieldCheck, AlertCircle, Layout, FileText, Fingerprint 
} from "lucide-react";

export default function EditRolPage({ params }: { params: Promise<{ id: string }> }) {
  // Desenvolvemos los parámetros según estándar Next.js 15
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    permiso_crud: "R",
    descripcion: "",
  });

  // 1. Cargar datos actuales del Rol
  useEffect(() => {
    const fetchRol = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/roles/${id}`);
        const { nombre, permiso_crud, descripcion } = res.data;
        
        setFormData({
          nombre: nombre || "",
          permiso_crud: permiso_crud || "R",
          descripcion: descripcion || "",
        });
      } catch (err: any) {
        setError("Error al cargar los datos del rol. Verifique la conexión.");
      } finally {
        setLoading(false);
      }
    };
    fetchRol();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Forzamos mayúsculas en el nombre para mantener consistencia
    const finalValue = name === "nombre" ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      // Payload limpio basado en schema.prisma
      const payload = {
        nombre: formData.nombre.trim(),
        permiso_crud: formData.permiso_crud,
        descripcion: formData.descripcion.trim() || null,
      };

      await api.patch(`/roles/${id}`, payload);
      router.push("/dashboard/roles");
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
      <p className="text-slate-500 font-bold animate-pulse">Cargando privilegios del sistema...</p>
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
            Editar Rol: <span className="text-indigo-600 font-mono">{formData.nombre || "..."}</span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold animate-shake">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: CONFIGURACIÓN GENERAL */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <ShieldCheck className="text-indigo-500" size={20} />
            <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Configuración de Seguridad</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1 flex items-center gap-1">
                <Fingerprint size={14} /> Nombre del Rol
              </label>
              <input 
                required 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange}
                placeholder="Ej. ADMINISTRADOR"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all uppercase" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Nivel de Acceso (CRUD)</label>
              <select 
                name="permiso_crud" 
                value={formData.permiso_crud} 
                onChange={handleChange}
                className="w-full p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl outline-none font-bold text-indigo-700 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CRUD">✅ ACCESO TOTAL (CRUD)</option>
                <option value="CRU">⚠️ CREAR, LEER Y EDITAR (CRU)</option>
                <option value="R">👁️ SOLO LECTURA (R)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase ml-1">
              <FileText size={14} /> Descripción de Funciones
            </div>
            <textarea 
              name="descripcion" 
              value={formData.descripcion} 
              onChange={handleChange}
              rows={4}
              placeholder="Describa las responsabilidades asociadas a este rol..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600 resize-none transition-all"
            />
          </div>
        </div>

        {/* INFO ADICIONAL (ESTÁTICA) */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
          <Layout className="text-amber-500 shrink-0" size={20} />
          <p className="text-sm text-amber-800 font-medium">
            <span className="font-bold">Nota:</span> Los cambios en los permisos afectarán a todos los usuarios vinculados a este rol de manera inmediata tras la siguiente sincronización de sesión.
          </p>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pb-12">
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
                <Save size={20} /> Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}