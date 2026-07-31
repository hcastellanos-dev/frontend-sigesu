"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Save, ArrowLeft, User, ShieldCheck, Mail, Lock, AlertCircle 
} from "lucide-react";

interface Rol {
  id_rol: number;
  nombre: string;
}

export default function EditUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    password: "",
    id_rol: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resUser, resRoles] = await Promise.all([
          api.get(`/usuarios/${id}`),
          api.get("/roles")
        ]);

        const u = resUser.data;
        setFormData({
          nombre: u.nombre || "",
          apellido_paterno: u.apellido_paterno || "",
          apellido_materno: u.apellido_materno || "",
          email: u.email || "",
          password: "", // No se carga por seguridad
          id_rol: u.id_rol?.toString() || "",
        });
        
        setRoles(resRoles.data);
      } catch (err) {
        setError("Error al cargar los datos del usuario.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      // Construcción del payload limpio según el esquema
      const payload: any = {
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno || null,
        email: formData.email,
        id_rol: parseInt(formData.id_rol),
      };

      // Solo enviar password si el usuario escribió algo
      if (formData.password.trim() !== "") {
        payload.password = formData.password;
      }

      await api.patch(`/usuarios/${id}`, payload);
      router.push("/dashboard/usuarios");
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
      <p className="text-slate-500 font-bold animate-pulse">Cargando perfil de usuario...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-indigo-600 font-bold hover:gap-3 transition-all mb-2"
          >
            <ArrowLeft size={20} /> Volver al listado
          </button>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            Editar Usuario: <span className="text-indigo-600">{formData.nombre}</span>
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECCIÓN 1: DATOS PERSONALES */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
            <User className="text-indigo-500" size={20} />
            <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Información Personal</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Nombre(s)</label>
              <input 
                required 
                name="nombre" 
                value={formData.nombre} 
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Apellido Paterno</label>
              <input 
                required 
                name="apellido_paterno" 
                value={formData.apellido_paterno} 
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Apellido Materno</label>
              <input 
                name="apellido_materno" 
                value={formData.apellido_materno} 
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SECCIÓN 2: ACCESO */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <Mail className="text-emerald-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Credenciales y Contacto</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase">Correo Electrónico</label>
                <input 
                  required 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl font-bold text-emerald-700" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-slate-500 uppercase">Contraseña</label>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Solo para cambiar</span>
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold" 
                  />
                  <Lock className="absolute right-4 top-4 text-slate-300" size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: ROL */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <ShieldCheck className="text-amber-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Privilegios de Sistema</h2>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase ml-1">Rol Asignado</label>
              <select 
                required 
                name="id_rol" 
                value={formData.id_rol} 
                onChange={handleChange}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-700 appearance-none focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Seleccione un rol...</option>
                {roles.map((r) => (
                  <option key={r.id_rol} value={r.id_rol}>
                    🛡️ {r.nombre}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 font-medium px-2">
                El rol determina los permisos CRUD y acceso a módulos específicos.
              </p>
            </div>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex flex-col md:flex-row justify-end gap-4 pb-12">
          <button 
            type="button" 
            onClick={() => router.push("/dashboard/usuarios")} 
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
                <Save size={20} /> Guardar Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}