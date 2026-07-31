"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/services/api";
import { Save, X, Loader2 } from "lucide-react";

export default function CreateBitacoraPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ id_vale: "", observaciones: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/bitacora", { 
        ...form, 
        id_vale: Number(form.id_vale) 
      });
      router.push("/dashboard/bitacora");
      router.refresh();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al crear registro");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Registrar en Bitácora</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">ID del Vale Relacionado</label>
            <input
              type="number"
              required
              placeholder="Ej. 101"
              className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setForm({ ...form, id_vale: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Observaciones / Motivo</label>
            <textarea
              required
              rows={4}
              placeholder="Describa el motivo del registro o incidencia..."
              className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-md flex justify-center items-center gap-2 hover:bg-blue-700 disabled:bg-slate-400 transition-all font-bold"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} 
              Guardar Registro
            </button>
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-md flex justify-center items-center gap-2 hover:bg-slate-200 transition-all"
            >
              <X size={18} /> Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}