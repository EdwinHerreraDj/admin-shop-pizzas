import React, { useEffect, useState } from "react";
import api from "@/react/lib/api";
import toast from "react-hot-toast";

export default function ZonaEnvioModal({ item, onClose, onSaved }) {
    const isEdit = !!item;

    const [codigoPostal, setCodigoPostal] = useState("");
    const [barrio, setBarrio] = useState("");
    const [recargo, setRecargo] = useState("0.00");
    const [activo, setActivo] = useState(true);

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (item) {
            setCodigoPostal(item.codigo_postal ?? "");
            setBarrio(item.barrio ?? "");
            setRecargo(item.recargo ?? "0.00");
            setActivo(!!item.activo);
        }
    }, [item]);

    const guardar = async () => {
        setSaving(true);
        setErrors({});

        try {
            const payload = {
                codigo_postal: codigoPostal,
                barrio,
                recargo,
                activo,
            };

            if (isEdit) {
                await api.put(`/zonas-envio/${item.id}`, payload);
                toast.success("Zona actualizada");
            } else {
                await api.post("/zonas-envio", payload);
                toast.success("Zona creada");
            }

            onSaved();
            onClose();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                toast.error("Error guardando zona");
            }
        }

        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm px-4">
            <div
                className="
            w-full max-w-lg
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
                bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600
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
                                <i className="mgc_map_line"></i>
                            </div>

                            <div>
                                <h2 className="font-semibold tracking-tight">
                                    {isEdit ? "Editar zona" : "Nueva zona"}
                                </h2>
                                <p className="text-white/80 text-sm">
                                    Configuración de la zona de envío
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
                    {/* Código Postal */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Código Postal
                        </label>

                        <input
                            type="text"
                            value={codigoPostal}
                            onChange={(e) => setCodigoPostal(e.target.value)}
                            className="
                        mt-1 w-full h-11 px-3
                        rounded-xl
                        border border-gray-300
                        bg-white
                        font-medium
                        focus:outline-none
                        focus:ring-2
                        focus:ring-violet-500/40
                        focus:border-violet-500
                    "
                        />

                        {errors.codigo_postal && (
                            <div className="mt-1 text-xs text-red-600">
                                {errors.codigo_postal[0]}
                            </div>
                        )}
                    </div>

                    {/* Barrio */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Barrio
                        </label>

                        <input
                            type="text"
                            value={barrio}
                            onChange={(e) => setBarrio(e.target.value)}
                            className="
                        mt-1 w-full h-11 px-3
                        rounded-xl
                        border border-gray-300
                        bg-white
                        font-medium
                        focus:outline-none
                        focus:ring-2
                        focus:ring-violet-500/40
                        focus:border-violet-500
                    "
                        />

                        {errors.barrio && (
                            <div className="mt-1 text-xs text-red-600">
                                {errors.barrio[0]}
                            </div>
                        )}
                    </div>

                    {/* Recargo */}
                    <div>
                        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Recargo (€)
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            value={recargo}
                            onChange={(e) => setRecargo(e.target.value)}
                            className="
                        mt-1 w-full h-11 px-3
                        rounded-xl
                        border border-gray-300
                        bg-white
                        font-medium
                        focus:outline-none
                        focus:ring-2
                        focus:ring-violet-500/40
                        focus:border-violet-500
                    "
                        />

                        {errors.recargo && (
                            <div className="mt-1 text-xs text-red-600">
                                {errors.recargo[0]}
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
                                Zona activa
                            </div>
                            <div className="text-xs text-gray-500">
                                Actívala para permitir envíos en esta zona
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setActivo(!activo)}
                            className={`
                        relative w-12 h-7 rounded-full transition shadow-inner
                        ${
                            activo
                                ? "bg-gradient-to-r from-violet-600 to-fuchsia-600"
                                : "bg-gray-300"
                        }
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

                    {errors.activo && (
                        <div className="text-xs text-red-600">
                            {errors.activo[0]}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
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
                    bg-gradient-to-r from-violet-600 to-fuchsia-600
                    text-white
                    font-semibold
                    hover:opacity-95
                    transition
                    shadow-xl
                    shadow-fuchsia-600/30
                "
                    >
                        {saving ? "Guardando..." : "Guardar"}
                    </button>
                </div>
            </div>
        </div>
    );
}
