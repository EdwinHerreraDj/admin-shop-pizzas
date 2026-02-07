import React, { useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function TipoProductoModal({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [nombre, setNombre] = useState(item?.nombre ?? "");
    const [usaTamanos, setUsaTamanos] = useState(
        item?.usa_tamanos ? true : false,
    );
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const title = useMemo(
        () => (isEdit ? "Editar tipo de producto" : "Nuevo tipo de producto"),
        [isEdit],
    );

    const save = async () => {
        setLoading(true);
        setErrors({});

        try {
            const payload = {
                nombre,
                usa_tamanos: usaTamanos ? 1 : 0,
            };

            if (isEdit) {
                await axios.put(
                    `/api/admin/tipos-producto/${item.id}`,
                    payload,
                );
                toast.success("Actualizado");
            } else {
                await axios.post("/api/admin/tipos-producto", payload);
                toast.success("Creado");
            }

            onSaved();
        } catch (e) {
            if (e?.response?.status === 422) {
                setErrors(e.response.data.errors ?? {});
                toast.error(e.response.data.message ?? "Revisa el formulario");
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
            bg-gradient-to-r from-cyan-600 via-sky-600 to-indigo-600
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
                                <i className="mgc_git_merge_line"></i>
                            </div>

                            <div>
                                <h2 className="font-semibold tracking-tight">
                                    {title}
                                </h2>
                                <p className="text-white/80 text-sm">
                                    Configuración del tipo de producto
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
                            placeholder="Ej: Pizza"
                            className="
                        mt-1
                        w-full h-11 px-3
                        rounded-xl
                        border border-gray-300
                        bg-white
                        font-medium
                        focus:outline-none
                        focus:ring-2
                        focus:ring-cyan-500/40
                        focus:border-cyan-500
                    "
                        />

                        {errors.nombre && (
                            <div className="mt-1 text-xs text-red-600">
                                {errors.nombre[0]}
                            </div>
                        )}
                    </div>

                    {/* SWITCH PREMIUM */}
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
                                Usa tamaños
                            </div>
                            <div className="text-xs text-gray-500">
                                Actívalo para productos con variantes de tamaño
                            </div>
                        </div>

                        <button
                            onClick={() => setUsaTamanos(!usaTamanos)}
                            className={`
                        relative w-12 h-7 rounded-full transition
                        shadow-inner
                        ${usaTamanos ? "bg-cyan-500" : "bg-gray-300"}
                    `}
                        >
                            <span
                                className={`
                            absolute top-1 left-1
                            w-5 h-5 bg-white rounded-full
                            shadow-md transition
                            ${usaTamanos ? "translate-x-5" : ""}
                        `}
                            />
                        </button>
                    </div>

                    {errors.usa_tamanos && (
                        <div className="text-xs text-red-600">
                            {errors.usa_tamanos[0]}
                        </div>
                    )}
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
                    bg-gradient-to-r from-cyan-500 to-indigo-600
                    text-white
                    font-semibold
                    hover:opacity-95
                    transition
                    shadow-xl
                    shadow-indigo-600/30
                "
                    >
                        {loading ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
