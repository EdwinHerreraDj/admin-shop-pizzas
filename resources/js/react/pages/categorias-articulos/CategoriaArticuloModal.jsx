import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

export default function CategoriaArticuloModal({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [nombre, setNombre] = useState("");
    const [orden, setOrden] = useState(0);
    const [activo, setActivo] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (item) {
            setNombre(item.nombre ?? "");
            setOrden(item.orden ?? 0);
            setActivo(Boolean(item.activo));
        } else {
            setNombre("");
            setOrden(0);
            setActivo(true);
        }
    }, [item]);

    const guardar = async () => {
        if (!nombre.trim()) {
            toast.error("El nombre es obligatorio");
            return;
        }

        if (saving) return;

        setSaving(true);

        const payload = {
            nombre: nombre.trim(),
            orden: orden === "" ? 0 : Number(orden),
            activo,
        };

        try {
            if (isEdit) {
                await api.put(`/categorias-articulos/${item.id}`, payload);
                toast.success("Categoría actualizada");
            } else {
                await api.post("/categorias-articulos", payload);
                toast.success("Categoría creada");
            }
            onSaved();
        } catch (e) {
            toast.error(
                e?.response?.data?.message ?? "No se pudo guardar la categoría",
            );
        } finally {
            setSaving(false);
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
                {/* HEADER PREMIUM */}
                <div
                    className="
                relative
                px-6 py-5
                bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600
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
                                <i className="mgc_folder_line"></i>
                            </div>

                            <div>
                                <h3 className="font-semibold tracking-tight">
                                    {isEdit
                                        ? "Editar categoría"
                                        : "Nueva categoría"}
                                </h3>
                                <p className="text-white/80 text-sm">
                                    Categorías comerciales de artículos
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            disabled={saving}
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
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Nombre
                        </label>

                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Menú de verano"
                            className="
                        mt-1
                        w-full h-11 px-3
                        rounded-xl
                        border border-gray-300
                        bg-white
                        font-medium
                        focus:outline-none
                        focus:ring-2
                        focus:ring-indigo-500/40
                        focus:border-indigo-500
                    "
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Orden
                        </label>

                        <input
                            type="number"
                            value={orden}
                            onChange={(e) => setOrden(e.target.value)}
                            placeholder="Opcional"
                            className="
                        mt-1
                        w-full h-11 px-3
                        rounded-xl
                        border border-gray-300
                        bg-white
                        font-medium
                        focus:outline-none
                        focus:ring-2
                        focus:ring-indigo-500/40
                    "
                        />
                    </div>

                    {/* SWITCH PREMIUM (mejor que checkbox visualmente) */}
                    <div
                        className="
                    flex items-center justify-between
                    rounded-2xl
                    border border-gray-200
                    p-4
                    bg-gradient-to-r from-gray-50 to-white
                "
                    >
                        <div>
                            <div className="text-sm font-semibold text-gray-800">
                                Categoría activa
                            </div>
                            <div className="text-xs text-gray-500">
                                Controla su visibilidad en el catálogo
                            </div>
                        </div>

                        <button
                            onClick={() => setActivo(!activo)}
                            className={`
                        relative w-12 h-7 rounded-full transition shadow-inner
                        ${activo ? "bg-indigo-500" : "bg-gray-300"}
                    `}
                        >
                            <span
                                className={`
                            absolute top-1 left-1
                            w-5 h-5 bg-white rounded-full
                            shadow-md transition
                            ${activo ? "translate-x-5" : ""}
                        `}
                            />
                        </button>
                    </div>
                </div>

                {/* FOOTER PREMIUM */}
                <div className="px-6 py-4 border-t flex justify-end gap-3 bg-slate-50">
                    <button
                        onClick={onClose}
                        disabled={saving}
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
                        onClick={guardar}
                        disabled={saving}
                        className="
                    h-11 px-6
                    rounded-xl
                    bg-gradient-to-r from-indigo-600 to-violet-600
                    text-white
                    font-semibold
                    hover:opacity-95
                    transition
                    shadow-xl
                    shadow-indigo-600/30
                "
                    >
                        {saving ? "Guardando…" : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
