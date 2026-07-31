"use client";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import { Save, ArrowLeft, Loader2 } from "lucide-react";

export default function EditBitacoraPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [valeInfo, setValeInfo] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await api.get(`/bitacora/${id}`);
        setObservaciones(res.data.observaciones);
        setValeInfo(res.data.vale);
      } catch (error) {
        console.error("Error al cargar registro", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Nota: Asegúrate de que tu backend tenga el método PATCH en BitacoraController
      await api.patch(`/bitacora/${id}`, { observaciones });
      router.push("/dashboard/bitacora");
      router.refresh();
    } catch (error: any) {
      alert("Error al actualizar la observación");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Cargando datos del registro...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button onClick={() => router.back()} className="mb-4 text-slate-500 flex items-center gap-2 hover:text-slate-800 transition-colors">
        <ArrowLeft size={18} /> Volver al historial
      </button>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        <div className="bg-slate-800 p-4 text-white">
          <h2 className="text-lg font-bold">Edición de Auditoría #{id}</h2>
        </div>
        
        <div className="p-8 space-y-6">
          {valeInfo && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
              <p><strong>Producto:</strong> {valeInfo.producto?.nombre_producto}</p>
              <p><strong>Vale Relacionado:</strong> #{valeInfo.id_vale}</p>
              <p><strong>Resguardante:</strong> {valeInfo.usuarioRecibio?.nombre}</p>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Notas de Auditoría</label>
              <textarea
                value={observaciones}
                rows={5}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                onChange={(e) => setObservaciones(e.target.value)}
              />
              <p className="text-xs text-slate-400 mt-2 italic">
                Solo se permite modificar la observación por motivos de integridad de auditoría.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-blue-600 text-white py-3 rounded-md flex justify-center items-center gap-2 hover:bg-blue-700 font-bold transition-all shadow-md disabled:bg-slate-400"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />} 
              Actualizar Observación
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}