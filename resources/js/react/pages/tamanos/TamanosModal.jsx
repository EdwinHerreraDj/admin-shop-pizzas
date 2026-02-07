import React, { useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function TamanoModal({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [nombre, setNombre] = useState(item?.nombre ?? "");
    const [orden, setOrden] = useState(item?.orden ?? 1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const title = useMemo(
        () => (isEdit ? "Editar tamaño" : "Nuevo tamaño"),
        [isEdit],
    );

    const save = async () => {
        setLoading(true);
        setErrors({});

        try {
            const payload = { nombre, orden };

            if (isEdit) {
                await axios.put(`/api/admin/tamanos/${item.id}`, payload);
                toast.success("Actualizado");
            } else {
                await axios.post("/api/admin/tamanos", payload);
                toast.success("Creado");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4">
            <div
                className="
        w-full max-w-md
        rounded-3xl
        bg-white
        shadow-[0_40px_120px_rgba(0,0,0,0.45)]
        overflow-hidden
    "
            >
                {/* HEADER */}
                <div
                    className="
            px-6 py-5
            bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500
            text-white
        "
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="
                        w-12 h-12
                        rounded-2xl
                        bg-white/20
                        backdrop-blur
                        flex items-center justify-center
                        text-2xl
                    "
                            >
                                <i className="mgc_ruler_line"></i>
                            </div>

                            <div>
                                <h2 className="font-semibold tracking-tight">
                                    {title}
                                </h2>
                                <p className="text-white/80 text-sm">
                                    Configuración del tamaño
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="
                        w-10 h-10
                        rounded-xl
                        bg-white/20
                        hover:bg-white/30
                        flex items-center justify-center
                        transition
                    "
                        >
                            <i className="mgc_close_line text-xl"></i>
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="px-6 py-6 space-y-6">
                    {/* Nombre */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Nombre
                        </label>

                        <input
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Mediana"
                            className="
                        mt-1
                        w-full h-11 px-3
                        rounded-xl
                        border border-gray-300
                        bg-white
                        font-medium
                        focus:outline-none
                        focus:ring-2
                        focus:ring-amber-500/40
                        focus:border-amber-500
                    "
                        />

                        {errors.nombre && (
                            <div className="mt-1 text-xs text-red-600">
                                {errors.nombre[0]}
                            </div>
                        )}
                    </div>

                    {/* Orden */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Orden de visualización
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={orden}
                            onChange={(e) => setOrden(Number(e.target.value))}
                            className="
                        mt-1
                        w-full h-11 px-3
                        rounded-xl
                        border border-gray-300
                        bg-white
                        font-medium
                        focus:outline-none
                        focus:ring-2
                        focus:ring-amber-500/40
                        focus:border-amber-500
                    "
                        />

                        {errors.orden && (
                            <div className="mt-1 text-xs text-red-600">
                                {errors.orden[0]}
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}
                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="
                    h-11 px-5
                    rounded-xl
                    border border-gray-300
                    font-medium
                    text-gray-700
                    hover:bg-gray-100
                    transition
                "
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={save}
                        disabled={loading}
                        className="
                    h-11 px-6
                    rounded-xl
                    bg-gradient-to-r from-amber-500 to-rose-500
                    text-white
                    font-semibold
                    hover:opacity-95
                    transition
                    shadow-xl
                    shadow-rose-500/30
                "
                    >
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
