"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import DataTable from "@/components/dashboard/DataTable";
import Link from "next/link";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Plus, Search, Package, FileSpreadsheet,
  ChevronLeft, ChevronRight, FileText
} from "lucide-react";

export default function ValesPage() {
  const [valesGrouped, setValesGrouped] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const loadVales = async () => {
    try {
      setLoading(true);
      const res = await api.get("/vales");
      
      const grouped = res.data.reduce((acc: any[], current: any) => {
        const timeKey = new Date(current.fecha_entrega).toISOString().slice(0, 16);
        const groupKey = `V-${current.id_usuario_recibio}-${current.id_area}-${timeKey}`;
        const existingGroup = acc.find(g => g.groupKey === groupKey);

        if (existingGroup) {
          existingGroup.productosList.push(current);
        } else {
          acc.push({
            ...current,
            groupKey,
            productosList: [current]
          });
        }
        return acc;
      }, []);

      setValesGrouped(grouped.sort((a: any, b: any) => 
        new Date(b.fecha_entrega).getTime() - new Date(a.fecha_entrega).getTime()
      ));
    } catch (err) {
      console.error("Error al cargar vales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVales(); }, []);

  const generatePDF = (vale: any) => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const fecha = new Date(vale.fecha_entrega);
    const idValeStr = vale.productosList[0].id_vale.toString().padStart(4, '0');

    const getFullName = (u: any) => {
      if (!u) return "__________________________";
      const partes = [u.nombre, u.apellido_paterno, u.apellido_materno].filter(Boolean);
      return partes.join(" ").toUpperCase() || "N/A";
    };

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("INSTITUTO ESTATAL DE EDUCACIÓN PÚBLICA DE OAXACA", pageWidth / 2, 15, { align: "center" });
    doc.text("UNIVERSIDAD PEDAGÓGICA NACIONAL", pageWidth / 2, 20, { align: "center" });
    doc.text("UNIDAD 201 OAXACA", pageWidth / 2, 25, { align: "center" });
    doc.text("ÁREA DE SISTEMAS DE CÓMPUTO", pageWidth / 2, 30, { align: "center" });

    doc.setFontSize(12);
    doc.text("VALE DE RESGUARDO", pageWidth / 2, 40, { align: "center" });
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const strFecha = `Sta. Cruz Xoxocotlán, Oax. A ${fecha.getDate()} de ${fecha.toLocaleString('es-ES', { month: 'long' })} de ${fecha.getFullYear()}`;
    doc.text(strFecha, pageWidth - 20, 50, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text(`NÚMERO DE VALE: #${idValeStr}`, 20, 55);
    doc.text(`EDIFICIO: ${vale.area?.edificio?.nombre || 'N/A'}`, 20, 62);

    autoTable(doc, {
      startY: 68,
      head: [['N/P', 'UNIDAD', 'EQUIPO', 'SKU', 'MODELO', 'MARCA', 'ÁREA ASIGNADA']],
      body: vale.productosList.map((p: any, index: number) => [
        index + 1,
        p.unidad || 'PZA',
        p.producto?.nombre_producto || 'N/A',
        p.producto?.sku || 'S/N', 
        p.producto?.modelo || 'N/A',
        p.producto?.marca || 'N/A',
        vale.area?.nombre || 'N/A'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: 20, fontSize: 9, halign: 'center' },
      styles: { fontSize: 9, cellPadding: 3 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(9);
    const textCompromiso = "De acuerdo a las disposiciones administrativas quedo comprometido (a) a que en caso de cambios, baja o renuncia, informar de inmediato al área de sistemas de cómputo, en caso contrario, estoy responsabilizado (a) por el valor de reposición de los bienes.";
    doc.text(doc.splitTextToSize(textCompromiso, pageWidth - 40), 20, finalY);

    const signaturesY = finalY + 35;
    doc.setFontSize(8);
    const columnWidth = pageWidth / 3;
    
    doc.setFont("helvetica", "bold");
    doc.line(20, signaturesY, columnWidth - 10, signaturesY);
    doc.text("ENTREGO", columnWidth / 2 + 5, signaturesY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(getFullName(vale.usuarioEntrego), columnWidth / 2 + 5, signaturesY + 10, { align: "center" });
    doc.text("SISTEMAS DE CÓMPUTO", columnWidth / 2 + 5, signaturesY + 14, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.line(columnWidth + 10, signaturesY, (columnWidth * 2) - 10, signaturesY);
    doc.text("VO. BO.", columnWidth * 1.5, signaturesY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(getFullName(vale.usuarioVoBo), columnWidth * 1.5, signaturesY + 10, { align: "center" });
    doc.text("SUBDIRECCIÓN ADMINISTRATIVA", columnWidth * 1.5, signaturesY + 14, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.line((columnWidth * 2) + 10, signaturesY, pageWidth - 20, signaturesY);
    doc.text("RECIBE", columnWidth * 2.5 - 5, signaturesY + 5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.text(getFullName(vale.usuarioRecibio), columnWidth * 2.5 - 5, signaturesY + 10, { align: "center" });
    doc.text("RESPONSABLE DEL EQUIPO", columnWidth * 2.5 - 5, signaturesY + 14, { align: "center" });

    doc.save(`Vale_${idValeStr}.pdf`);
  };

  const filteredVales = useMemo(() => {
    const term = search.toLowerCase();
    return valesGrouped.filter((v: any) => {
      const idVale = v.productosList[0].id_vale.toString();
      const idPadded = idVale.padStart(4, '0');
      
      return (
        idVale.includes(term) || // Busca por ID normal (ej. "5")
        idPadded.includes(term) || // Busca por ID con formato (ej. "0005")
        v.usuarioRecibio?.nombre.toLowerCase().includes(term) ||
        v.usuarioRecibio?.apellido_paterno?.toLowerCase().includes(term) ||
        v.area?.nombre.toLowerCase().includes(term) ||
        v.productosList.some((p: any) => p.producto?.nombre_producto.toLowerCase().includes(term))
      );
    });
  }, [valesGrouped, search]);

  const totalPages = Math.ceil(filteredVales.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredVales.slice(start, start + itemsPerPage);
  }, [filteredVales, currentPage]);

  const exportToExcel = () => {
    const dataToExport = filteredVales.map((vale: any) => ({
      "ID VALE": `#${vale.productosList[0].id_vale.toString().padStart(4, '0')}`,
      "RESGUARDANTE": `${vale.usuarioRecibio?.nombre} ${vale.usuarioRecibio?.apellido_paterno || ""}`,
      "AREA": vale.area?.nombre,
      "FECHA": new Date(vale.fecha_entrega).toLocaleDateString()
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vales");
    XLSX.writeFile(workbook, `Reporte_Vales.xlsx`);
  };

  const handleDelete = async (group: any) => {
    if (!confirm(`¿Desea eliminar este vale completo?`)) return;
    try {
      await Promise.all(group.productosList.map((p: any) => api.delete(`/vales/${p.id_vale}`)));
      loadVales();
    } catch (err) { alert("Error al eliminar."); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-semibold animate-pulse">Cargando Vales...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <Package className="text-indigo-600" size={32} />
            Vales de Resguardo
          </h1>
          <p className="text-slate-500 font-medium">Control de equipo de cómputo y mobiliario asignado.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 active:scale-95">
            <FileSpreadsheet size={20} /> Exportar Excel
          </button>
          <Link href="/dashboard/vales/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus size={20} /> Nuevo Vale
          </Link>
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por ID, resguardante, área o equipo..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
        <DataTable
          columns={[
            { 
              key: "id_vale", 
              label: "ID VALE",
              render: (item) => (
                <span className="bg-slate-100 text-slate-600 p-2 rounded-lg font-mono text-xs font-bold border border-slate-200">
                  #{item.productosList[0].id_vale.toString().padStart(4, '0')}
                </span>
              )
            },
            { 
              key: "productosList", 
              label: "EQUIPOS ASIGNADOS",
              render: (item) => (
                <div className="flex flex-col gap-1 py-2">
                  {item.productosList.map((p: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 rounded-md border border-indigo-100">{p.cantidad} {p.unidad}</span>
                      <span className="text-sm text-slate-700 font-semibold">{p.producto?.nombre_producto}</span>
                    </div>
                  ))}
                </div>
              )
            },
            { 
              key: "area", 
              label: "UBICACIÓN",
              render: (item) => (
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800 leading-tight">{item.area?.nombre}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{item.area?.edificio?.nombre || 'General'}</span>
                </div>
              )
            },
            { 
              key: "usuarioRecibio", 
              label: "RESGUARDANTE",
              render: (item) => (
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-slate-700">
                    {item.usuarioRecibio?.nombre} {item.usuarioRecibio?.apellido_paterno || ""}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Responsable</span>
                </div>
              )
            },
            { 
              key: "fecha_entrega", 
              label: "FECHA EMISIÓN",
              render: (item) => (
                <div className="flex flex-col">
                   <span className="text-slate-700 font-bold text-xs">
                     {new Date(item.fecha_entrega).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                   </span>
                   <span className="text-[10px] text-slate-400 font-medium pl-1">
                     {new Date(item.fecha_entrega).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs
                   </span>
                </div>
              )
            }
          ]}
          data={paginatedData}
          extraActions={(item) => (
            <button 
              onClick={() => generatePDF(item)}
              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
              title="Descargar PDF"
            >
              <FileText size={18} />
            </button>
          )}
          onEdit={(item) => router.push(`/dashboard/vales/edit/${item.productosList[0].id_vale}`)}
          onDelete={(item) => handleDelete(item)}
        />

        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 font-medium">
            Mostrando <span className="text-indigo-600 font-bold">{paginatedData.length}</span> de <span className="font-bold">{filteredVales.length}</span> resultados
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all text-slate-600"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-slate-700 px-4">Página {currentPage} de {totalPages || 1}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-all text-slate-600"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
