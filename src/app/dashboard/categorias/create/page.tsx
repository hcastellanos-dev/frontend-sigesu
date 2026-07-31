"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";

export default function CreateCategoriaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/categorias", formData);
      router.push("/dashboard/categorias");
      router.refresh();
    } catch (err: any) {
      setError(
        err.response?.data?.message || 
        "Error al registrar la categoría. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Encabezado con estilo de Usuario */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Crear Nueva Categoría</h1>
          <p className="text-slate-500 text-sm">Defina una nueva clasificación para sus productos.</p>
        </div>
        <Link 
          href="/dashboard/categorias" 
          className="text-slate-500 hover:text-slate-700 text-sm transition-colors"
        >
          ← Cancelar
        </Link>
      </div>

      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-xl shadow-sm border border-slate-200"
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {/* Nombre de la Categoría */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre de la Categoría
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Electrónica, Papelería..."
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descripción (Opcional)
            </label>
            <textarea
              rows={4}
              placeholder="Describa brevemente qué productos pertenecen a esta categoría..."
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
            loading 
              ? "bg-slate-400 cursor-not-allowed" 
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
          }`}
        >
          {loading ? "Registrando..." : "Guardar Categoría"}
        </button>
      </form>
    </div>
  );
}