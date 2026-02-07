import React, { useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function CategoriaIngredienteModal({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [nombre, setNombre] = useState(item?.nombre ?? "");
    const [orden, setOrden] = useState(item?.orden ?? 1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const title = useMemo(
        () => (isEdit ? "Editar categoría" : "Nueva categoría"),
        [isEdit],
    );

    const save = async () => {
        setLoading(true);
        setErrors({});

        try {
            const payload = { nombre, orden };

            if (isEdit) {
                await axios.put(
                    `/api/admin/categorias-ingredientes/${item.id}`,
                    payload,
                );
                toast.success("Actualizada");
            } else {
                await axios.post("/api/admin/categorias-ingredientes", payload);
                toast.success("Creada");
            }

            onSaved();
        } catch (e) {
            if (e?.response?.status === 422) {
                setErrors(e.response.data.errors ?? {});
                toast.error("Revisa el formulario");
            } else {
                toast.error("Error guardando");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                <div className="p-5 border-b bg-gray-50">
                    <div className="text-base font-semibold text-gray-900">
                        {title}
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Nombre
                        </label>
                        <input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        {errors.nombre && (
                            <div className="mt-1 text-xs text-red-600">
                                {errors.nombre[0]}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Orden
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={orden}
                            onChange={(e) => setOrden(Number(e.target.value))}
                            className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        {errors.orden && (
                            <div className="mt-1 text-xs text-red-600">
                                {errors.orden[0]}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-5 border-t flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm border border-gray-200 hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={save}
                        className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? "Guardando…" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
