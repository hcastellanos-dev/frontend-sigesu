"use client";

import React from "react";
import { Pencil, Trash2 } from "lucide-react";

interface Column {
  key: string;
  label: string;
  render?: (item: any) => React.ReactNode; 
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  // Hacemos que las funciones sean opcionales para evitar renderizar botones si no se necesitan
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  // Permitimos añadir acciones extra (como el botón de PDF en Vales)
  extraActions?: (item: any) => React.ReactNode;
}

export default function DataTable({ columns, data, onEdit, onDelete, extraActions }: DataTableProps) {
  return (
    <div className="overflow-x-auto shadow-sm rounded-xl border border-slate-200">
      <table className="w-full bg-white text-sm text-left">
        <thead className="bg-slate-50 text-slate-700 uppercase font-bold border-b border-slate-200">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="p-4 whitespace-nowrap">
                {c.label}
              </th>
            ))}
            {/* Solo mostramos el encabezado si hay alguna acción disponible */}
            {(onEdit || onDelete || extraActions) && (
              <th className="p-4 text-center">Acciones</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {data.length > 0 ? (
            data.map((row, index) => {
              // Priorizamos los IDs primarios específicos del modelo para evitar colisiones por llaves foráneas comunes (como id_usuario)
              const primaryId = 
                row.id_producto ?? 
                row.id_vale ?? 
                row.id_area ?? 
                row.id_edificio ?? 
                row.id_categoria ?? 
                row.id_proveedor ?? 
                row.id_bitacora ?? 
                row.id_usuario ?? 
                row.id_rol ?? 
                row.id ?? 
                row.groupKey;

              const rowId = primaryId !== undefined && primaryId !== null ? `row-${primaryId}-${index}` : `row-${index}`;

              return (
                <tr key={rowId} className="hover:bg-slate-50/50 transition-colors">
                  {columns.map((c) => (
                    <td key={`${rowId}-${c.key}`} className="p-4 text-slate-600 font-medium">
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}

                  {(onEdit || onDelete || extraActions) && (
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* Botón personalizado (ej. PDF en Vales) */}
                        {extraActions && extraActions(row)}

                        {/* Botón Editar con icono */}
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(row)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Pencil size={18} />
                          </button>
                        )}

                        {/* Botón Eliminar con icono */}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(row)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete || extraActions ? 1 : 0)} className="p-10 text-center text-slate-400 italic font-medium">
                No hay datos disponibles para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}