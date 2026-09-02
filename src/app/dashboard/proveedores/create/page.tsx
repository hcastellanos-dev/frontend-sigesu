"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Save, 
  ArrowLeft, 
  Building2, 
  UserCheck, 
  Phone, 
  Mail, 
  MapPin, 
  AlertCircle 
} from "lucide-react";

export default function CreateProveedorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      await api.post("/proveedores", formData);

      router.push("/dashboard/proveedores");
      router.refresh();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Error al registrar el proveedor.";
      setError(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoading(false);
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
            Crear <span className="text-indigo-600">Nuevo Proveedor</span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold">
          <AlertCircle size={24} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tarjeta 1: Información de la Empresa */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Building2 className="text-indigo-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">
                Datos de la Empresa
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">
                  Nombre de la Empresa / Razón Social
                </label>
                <input 
                  required 
                  type="text"
                  name="nombre" 
                  placeholder="EJ: TECNOLOGÍA Y SERVICIOS S.A."
                  value={formData.nombre} 
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">
                  Persona de Contacto
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    name="contacto" 
                    placeholder="Ej. Ing. Juan Pérez"
                    value={formData.contacto} 
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 placeholder:text-slate-300 pr-11"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <UserCheck size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Datos de Contacto y Ubicación */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Phone className="text-emerald-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">
                Contacto y Ubicación
              </h2>
            </div>
            
            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">
                    Teléfono
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      name="telefono" 
                      placeholder="951 123 4567"
                      value={formData.telefono} 
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700 placeholder:text-slate-300 pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Phone size={16} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <input 
                      type="email"
                      name="email" 
                      placeholder="contacto@empresa.com"
                      value={formData.email} 
                      onChange={handleChange}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-700 placeholder:text-slate-300 pr-10"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Mail size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">
                  Dirección Física
                </label>
                <div className="relative">
                  <textarea 
                    name="direccion" 
                    rows={2}
                    placeholder="Av. Universidad #123, Col. Centro..."
                    value={formData.direccion} 
                    onChange={handleChange}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-slate-600 resize-none pr-10"
                  />
                  <div className="absolute right-3 top-4 pointer-events-none text-slate-400">
                    <MapPin size={18} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Acciones */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/proveedores")} 
            className="px-8 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={20} /> Crear Proveedor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}