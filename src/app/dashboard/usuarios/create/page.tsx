"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { UsuarioService } from "@/services/usuario.service";
import { 
  Save, 
  ArrowLeft, 
  User, 
  Shield, 
  AlertCircle, 
  KeyRound,
  Mail,
  UserCheck
} from "lucide-react";

interface Rol {
  id_rol: number;
  nombre: string;
  permiso_crud: string;
}

export default function CreateUsuarioPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    email: "",
    password: "",
    id_rol: "",
  });

  // Cargar roles para el select
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get("/roles");
        setRoles(res.data);
      } catch (err) {
        console.error("Error al cargar roles", err);
        setError("No se pudieron cargar los roles del sistema.");
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.id_rol) {
        throw new Error("Debe seleccionar un rol para el usuario.");
      }

      await UsuarioService.create({
        ...formData,
        id_rol: Number(formData.id_rol),
      });

      router.push("/dashboard/usuarios");
      router.refresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Error al crear usuario.";
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
            Crear <span className="text-indigo-600">Nuevo Usuario</span>
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
          
          {/* Tarjeta 1: Datos Personales */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <User className="text-indigo-500" size={20} />
              <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Datos Personales</h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Nombre(s)</label>
                <input 
                  required 
                  type="text"
                  name="nombre" 
                  placeholder="Escriba el nombre"
                  value={formData.nombre} 
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Apellido Paterno</label>
                <input 
                  required 
                  type="text"
                  name="apellido_paterno" 
                  placeholder="Primer apellido"
                  value={formData.apellido_paterno} 
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase ml-1">Apellido Materno</label>
                <input 
                  type="text"
                  name="apellido_materno" 
                  placeholder="Segundo apellido (opcional)"
                  value={formData.apellido_materno} 
                  onChange={handleChange}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Credenciales y Seguridad */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
                <Shield className="text-emerald-500" size={20} />
                <h2 className="font-black text-slate-700 uppercase tracking-wider text-sm">Credenciales y Acceso</h2>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <input 
                      required 
                      type="email"
                      name="email" 
                      placeholder="correo@ejemplo.com"
                      value={formData.email} 
                      onChange={handleChange}
                      className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 placeholder:text-slate-300"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Mail size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Contraseña</label>
                  <div className="relative">
                    <input 
                      required 
                      type="password"
                      name="password" 
                      placeholder="••••••••"
                      value={formData.password} 
                      onChange={handleChange}
                      className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-700 placeholder:text-slate-300"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <KeyRound size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase ml-1">Asignar Rol de Usuario</label>
                  <div className="relative">
                    <select 
                      required 
                      name="id_rol" 
                      value={formData.id_rol} 
                      onChange={handleChange}
                      className="w-full p-4 pr-12 bg-indigo-50/50 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-800 appearance-none"
                    >
                      <option value="">Seleccione un rol...</option>
                      {roles.map((rol) => (
                        <option key={rol.id_rol} value={rol.id_rol}>
                          {rol.nombre} ({rol.permiso_crud})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                      <UserCheck size={18} />
                    </div>
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
            onClick={() => router.push("/dashboard/usuarios")} 
            className="px-8 py-4 font-black text-slate-500 hover:bg-slate-100 rounded-2xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Registrando...
              </>
            ) : (
              <>
                <Save size={20} /> Crear Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}