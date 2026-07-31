"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AreaService } from "@/services/area.service";
import { EdificioService } from "@/services/edificio.service";
import Link from "next/link";

export default function CreateAreaPage() {
  const router = useRouter();
  const [edificios, setEdificios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    id_edificio: "",
  });

  // Cargar edificios para el select con manejo de errores
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      setError(err.response?.data?.message || err.message || "Error al registrar el área");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Encabezado con el mismo estilo de Usuario */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Crear Nueva Área</h1>
        <Link href="/dashboard/areas" className="text-slate-500 hover:text-slate-700 text-sm">
          ← Cancelar
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre del Área */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Área</label>
            <input
              type="text"
              required
              placeholder="Ej. Departamento de TI"
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          {/* Edificio correspondiente */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Edificio / Ubicación</label>
            <select
              required
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white transition-all"
              value={formData.id_edificio}
              onChange={(e) => setFormData({ ...formData, id_edificio: e.target.value })}
            >
              <option value="">Seleccione un edificio...</option>
              {edificios.map((ed: any) => (
                <option key={ed.id_edificio} value={ed.id_edificio}>
                  {ed.nombre} {ed.planta ? `- ${ed.planta}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
            <textarea
              rows={3}
              placeholder="Breve descripción de las funciones de esta área..."
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full mt-8 py-3 rounded-lg text-white font-bold transition-all shadow-md ${
            loading ? "bg-slate-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
          }`}
        >
          {loading ? "Registrando..." : "Guardar Área"}
        </button>
      </form>
    </div>
  );
}