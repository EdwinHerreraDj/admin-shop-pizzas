import React, { useEffect, useState } from "react";
function Fila({ row, onSave, onRemove }) {
    const update = (changes) => {
        onSave(row, {
            modo: row.modo,
            incluido_por_defecto:
                changes.incluido_por_defecto ?? row.incluido_por_defecto,
            obligatorio: changes.obligatorio ?? row.obligatorio,
            max_cantidad: changes.max_cantidad ?? row.max_cantidad,
        });
    };

    return (
        <tr className="border-t">
            <td className="px-3 py-2 font-medium">{row.ingrediente.nombre}</td>

            <td className="px-3 py-2 text-center">
                <input
                    type="checkbox"
                    checked={row.incluido_por_defecto}
                    onChange={(e) =>
                        update({ incluido_por_defecto: e.target.checked })
                    }
                />
            </td>

            <td className="px-3 py-2 text-center">
                <input
                    type="checkbox"
                    checked={row.obligatorio}
                    onChange={(e) => update({ obligatorio: e.target.checked })}
                />
            </td>

            <td className="px-3 py-2 text-center">
                <input
                    type="number"
                    min="1"
                    value={row.max_cantidad}
                    onChange={(e) =>
                        update({ max_cantidad: Number(e.target.value) })
                    }
                    className="w-16 border rounded px-1 text-center"
                />
            </td>

            <td className="px-3 py-2 text-right">
                <button
                    onClick={() => onRemove(row)}
                    className="text-red-600 text-sm"
                >
                    Quitar
                </button>
            </td>
        </tr>
    );
}

export default Fila;
