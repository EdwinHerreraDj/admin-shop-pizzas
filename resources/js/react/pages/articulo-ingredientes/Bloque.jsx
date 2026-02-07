import React, { useEffect, useState } from "react";
import Fila from "./Fila";
function Bloque({ titulo, items, onSave, onRemove }) {
    return (
        <div className="bg-white border rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 font-semibold">{titulo}</div>

            {items.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm">
                    Sin ingredientes
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-3 py-2 text-left">Ingrediente</th>
                            <th className="px-3 py-2 text-center">Incluido</th>
                            <th className="px-3 py-2 text-center">
                                Obligatorio
                            </th>
                            <th className="px-3 py-2 text-center">Máx</th>
                            <th className="px-3 py-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((row) => (
                            <Fila
                                key={row.id}
                                row={row}
                                onSave={onSave}
                                onRemove={onRemove}
                            />
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Bloque;
