"use client";

import React, { useEffect, useState, useCallback, cloneElement } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { 
  Users, Package, Building, Map, Tags, Building2, MapPin, Box, FileSignature, 
  Truck, FileText, ShieldCheck, LayoutDashboard, 
  AlertCircle, ArrowRight, History, Calendar, MessageSquare
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bitacoras, setBitacoras] = useState<any[]>([]);
  const [stats, setStats] = useState({
    roles: 0, usuarios: 0, edificios: 0, areas: 0,
    categorias: 0, proveedores: 0, productos: 0, vales: 0,
  });

  const { user } = useAuth();
  
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const fetchCount = async (url: string) => {
        try {
          const res = await api.get(url);
          return Array.isArray(res.data) ? res.data.length : 0;
        } catch (e) {
          console.warn(`No se pudo obtener conteo de ${url}`);
          return 0;
        }
      };

      const [
        roles, usuarios, edificios, areas, 
        categorias, proveedores, productos, vales, resBitacoras
      ] = await Promise.all([
        fetchCount("/roles"),
        fetchCount("/usuarios"),
        fetchCount("/edificios"),
        fetchCount("/areas"),
        fetchCount("/categorias"),
        fetchCount("/proveedores"),
        fetchCount("/productos"),
        fetchCount("/vales"),
        api.get("/bitacoras").catch(() => ({ data: [] }))
      ]);

      setStats({
        roles, usuarios, edificios, areas,
        categorias, proveedores, productos, vales
      });

      setBitacoras(Array.isArray(resBitacoras.data) ? resBitacoras.data.slice(0, 5) : []);

    } catch (err) {
      setError("Error en la conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    loadDashboardData();
  }, [router, loadDashboardData]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-xs">Sincronizando Sistema...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-indigo-600" size={36} /> Panel General
          </h1>
          <p className="text-slate-500 font-bold ml-1">Gestión de Activos y Resguardos</p>
        </div>
        <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-3">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
          <p className="text-emerald-700 font-black text-sm uppercase">Sistema Activo</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl flex items-center gap-3 text-rose-700 font-bold">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      {/* Grid de tarjetas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(user?.rol?.nombre === 'ADMINISTRADOR') && (
          <>
          <StatCard title="Roles" value={stats.roles} icon={<ShieldCheck />} color="sky" link="/dashboard/roles" />
          <StatCard title="Usuarios" value={stats.usuarios} icon={<Users />} color="blue" link="/dashboard/usuarios" />
          </>
        )}
        {(user?.rol?.nombre === 'ADMINISTRADOR' || user?.rol?.nombre === 'SISTEMAS') && (
          <>
          <StatCard title="Edificios" value={stats.edificios} icon={<Building2 />} color="amber" link="/dashboard/edificios" />
          <StatCard title="Areas" value={stats.areas} icon={<MapPin />} color="rose" link="/dashboard/areas" />
          </>
        )}
        <StatCard title="Categorias" value={stats.categorias} icon={<Tags />} color="indigo" link="/dashboard/categorias" />
        <StatCard title="Proveedores" value={stats.proveedores} icon={<Truck />} color="orange" link="/dashboard/proveedores" />
        <StatCard title="Productos" value={stats.productos} icon={<Box />} color="violet" link="/dashboard/productos" />
        {(user?.rol?.nombre === 'ADMINISTRADOR' || user?.rol?.nombre === 'SISTEMAS') && (
          <>
          <StatCard title="Vales de Resguardo" value={stats.vales} icon={<FileSignature />} color="emerald" link="/dashboard/vales" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Building className="text-slate-400" size={20} />
            <h2 className="font-black text-slate-500 uppercase tracking-widest text-xs">Infraestructura</h2>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {(user?.rol?.nombre === 'ADMINISTRADOR') && (
              <>
              <StatSmall title="Roles" value={stats.roles} icon={<ShieldCheck />} />
              <StatSmall title="Usuarios" value={stats.usuarios} icon={<Users />} />
              </>
            )}
            {(user?.rol?.nombre === 'ADMINISTRADOR' || user?.rol?.nombre === 'SISTEMAS') && (
              <>
              <StatSmall title="Edificios" value={stats.edificios} icon={<Building2 />} />
              <StatSmall title="Areas" value={stats.areas} icon={<MapPin />} />
              </>
            )}
            <StatSmall title="Categorías" value={stats.categorias} icon={<Tags />} />
            <StatCard title="Proveedores" value={stats.proveedores} icon={<Truck />} />
            <StatCard title="Productos" value={stats.productos} icon={<Box />} />
            {(user?.rol?.nombre === 'ADMINISTRADOR' || user?.rol?.nombre === 'SISTEMAS') && (
              <>
              <StatCard title="Vales de Resguardo" value={stats.vales} icon={<FileSignature />} />
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <History className="text-slate-400" size={20} />
            <h2 className="font-black text-slate-500 uppercase tracking-widest text-xs">Últimos Movimientos</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {bitacoras.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {bitacoras.map((b: any) => (
                  <div key={b.id_bitacora} className="p-5 hover:bg-slate-50 transition-colors flex items-start gap-4">
                    <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600">
                      <MessageSquare size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-slate-700">{b.observaciones || "Sin detalle"}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(b.fecha_reporte).toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight size={18} className="text-slate-200" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center">
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No hay actividad registrada</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, link }: any) {
  const router = useRouter();
  const theme: any = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    sky: "text-sky-600 bg-sky-50 border-sky-100",
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
    violet: "text-violet-600 bg-violet-50 border-violet-100"
  };

  const colorClasses = theme[color] || theme.indigo;

  return (
    <div 
      onClick={() => router.push(link)}
      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all cursor-pointer group hover:border-indigo-300 active:scale-95 flex items-center gap-4"
    >
      <div className={`p-3 rounded-xl flex-shrink-0 ${colorClasses} group-hover:scale-110 transition-transform`}>
        {cloneElement(icon, { size: 20 })}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">
          {title}
        </p>
        <p className="text-xl font-black text-slate-800 leading-none mt-0.5">
          {value}
        </p>
      </div>
      
      <ArrowRight 
        size={16} 
        className="text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all flex-shrink-0" 
      />
    </div>
  );
}

function StatSmall({ title, value, icon }: any) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-white hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-white rounded-xl text-slate-400 group-hover:text-indigo-500 shadow-sm transition-colors">
          {icon}
        </div>
        <span className="font-bold text-slate-600">{title}</span>
      </div>
      <span className="font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg text-sm">{value}</span>
    </div>
  );
}
