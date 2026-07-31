"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Save, ArrowLeft, AlertCircle, Building2, User, Phone, Mail, MapPin 
} from "lucide-react";

export default function EditProveedorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  // Cargar datos actuales del proveedor
  useEffect(() => {
    const fetchProveedor = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/proveedores/${id}`);
        const p = res.data;
        
        setFormData({
          nombre: p.nombre || "",
          contacto: p.contacto || "",
          telefono: p.telefono || "",
          email: p.email || "",
          direccion: p.direccion || "",
        });
      } catch (err: any) {
        setError("No se pudo cargar la información del proveedor.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProveedor();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      // Payload limpio basado en schema.prisma
      const payload = {
        nombre: formData.nombre,
        contacto: formData.contacto || null,
        telefono: formData.telefono || null,
        email: formData.email || null,
        direccion: formData.direccion || null,
      };

      // Mantenemos PUT como mencionaste en tu controlador de NestJS
      await api.put(`/proveedores/${id}`, payload);
      router.push("/dashboard/proveedores");
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
      <p className="text-slate-500 font-bold animate-pulse">Cargando información del socio comercial...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header Estilo Dashboard */}
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2"
          >
            <ArrowLeft size={20} /> Volver al directorio
          </button>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Editar Proveedor: <span className="text-indigo-600">{formData.nombre || "..."}</span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold shadow-sm">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS DE LA EMPRESA */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <Building2 className="text-indigo-500" size={20} />
            <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Identidad Corporativa</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Nombre Legal / Razón Social</label>
              <input 
                required 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange}
                placeholder="Ej. Suministros Industriales S.A."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 transition-all" 
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: CONTACTO Y COMUNICACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <User className="text-amber-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Persona de Contacto</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Nombre del Representante</label>
                <input 
                  name="contacto" 
                  value={formData.contacto} 
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1 flex items-center gap-1">
                  <Phone size={12} /> Teléfono Directo
                </label>
                <input 
                  name="telefono" 
                  value={formData.telefono} 
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-mono font-bold text-indigo-700" 
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Mail className="text-emerald-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Medios Digitales</h2>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Correo Electrónico</label>
              <input 
                type="email"
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                placeholder="contacto@empresa.com"
                className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl font-bold text-emerald-700 outline-none focus:ring-2 focus:ring-emerald-500" 
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium px-2">
              * Este correo se utilizará para el envío de órdenes de compra y facturación.
            </p>
          </div>
        </div>

        {/* SECCIÓN 3: LOCALIZACIÓN */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <MapPin className="text-rose-500" size={20} />
            <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Ubicación Física</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase ml-1">Dirección Completa</label>
            <textarea 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleChange}
              rows={3}
              placeholder="Calle, Número, Colonia, C.P., Ciudad..."
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-600 resize-none"
            />
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pb-12">
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/proveedores")} 
            className="px-8 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
          >
            Cancelar y salir
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
                <Save size={20} /> Actualizar Proveedor
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}